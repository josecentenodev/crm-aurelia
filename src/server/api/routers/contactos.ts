import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { 
  CreateContactSchema, 
  UpdateContactSchema, 
  ContactStatus
} from "@/domain/Contactos";
import type { ContactChannel } from "@/domain/Contactos";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const contactosRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      filters: z.object({
        status: z.nativeEnum(ContactStatus).optional(),
        channel: z.string().optional(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }).optional(),
      clientId: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Validar que usuarios no-AURELIA solo puedan ver sus propios contactos
        if (ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para ver los contactos de este cliente" });
        }

        const filters = input.filters;
        
        const where: Prisma.ContactWhereInput = {
          clientId: input.clientId,
          // Excluir contactos de playground
          // source: { not: "playground" },
          ...(filters?.status && { status: filters.status }),
          ...(filters?.channel && { channel: filters.channel as ContactChannel }),
          ...(filters?.search && {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { phone: { contains: filters.search, mode: 'insensitive' } },
              { message: { contains: filters.search, mode: 'insensitive' } },
            ]
          }),
          ...(filters?.tags && filters.tags.length > 0 && {
            tags: { hasSome: filters.tags }
          })
        };

        return await db.contact.findMany({
          where,
          include: {
            conversations: {
              select: {
                id: true,
                title: true,
                status: true,
                lastMessageAt: true,
                _count: {
                  select: {
                    messages: true
                  }
                }
              },
              orderBy: {
                lastMessageAt: 'desc'
              },
              take: 1 // Solo la conversación más reciente
            }
          },
          orderBy: { createdAt: "desc" }
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener los contactos"
        });
      }
    }),

  

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario sin cliente asignado"
        });
      }
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const contact = await db.contact.findUnique({
          where: { 
            id: input.id,
            clientId // Asegurar que el contacto pertenece al cliente del usuario
          },
          include: {
            pipeline: { select: { id: true, name: true } },
            stage: { select: { id: true, name: true, color: true } },
            _count: { select: { conversations: true } },
          }
        });
        if (!contact) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado" });
        }
        return contact;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el contacto"
        });
      }
    }),

  create: protectedProcedure
    .input(CreateContactSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Manejo de multitenant: para usuarios AURELIA, permitir clientId del input
        // Para usuarios no-AURELIA, usar solo el clientId de la sesión
        const clientId = input.clientId ?? ctx.session.user.clientId;
        
        if (!clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        }

        // Validar que usuarios no-AURELIA no puedan crear contactos para otros clientes
        if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para crear contactos para este cliente" });
        }

        if (!input.name?.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El nombre es requerido" });
        }

        // Validar número de teléfono para WhatsApp si se proporciona
        if (input.phone?.trim()) {
          const phoneRegex = /^[0-9+\-\s\(\)]+$/
          if (!phoneRegex.test(input.phone.trim())) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: "El número de teléfono contiene caracteres no válidos. Solo se permiten números, +, -, espacios y paréntesis." 
            });
          }
          
          // Verificar que el número tenga al menos 8 dígitos
          const digitsOnly = input.phone.replace(/[^\d]/g, '')
          if (digitsOnly.length < 8) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: "El número de teléfono debe tener al menos 8 dígitos." 
            });
          }
        }

        const client = await db.client.findUnique({ where: { id: clientId } });
        if (!client) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El cliente especificado no existe" });
        }

        const contactData = {
          ...input,
          name: input.name.trim(),
          status: input.status ?? ContactStatus.NUEVO,
          clientId, // Usar el clientId determinado por la lógica de multitenant
          email: input.email?.trim() ?? null,
          phone: input.phone?.trim() ?? null,
          message: input.message?.trim() ?? null,
          source: input.source?.trim() ?? null,
          notes: input.notes?.trim() ?? null,
          tags: input.tags ?? [],
        };
        
        return await db.contact.create({ data: contactData });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "El email ya está registrado." });
        }
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2003") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El cliente especificado no existe." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el contacto" });
      }
    }),
  

  update: protectedProcedure
    .input(UpdateContactSchema.extend({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { id, clientId: inputClientId, ...data } = input;
      const clientId = inputClientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      }
      if (inputClientId && ctx.session.user.type !== "AURELIA" && inputClientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const existingContact = await db.contact.findUnique({ where: { id, clientId } });
        if (!existingContact) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado para actualizar." });
        }
        if (data.name !== undefined && !data.name?.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El nombre no puede estar vacío" });
        }
        const updateData = {
          ...data,
          ...(data.name && { name: data.name.trim() }),
          ...(data.email && { email: data.email.trim() }),
          ...(data.phone && { phone: data.phone.trim() }),
          ...(data.message && { message: data.message.trim() }),
          ...(data.source && { source: data.source.trim() }),
          ...(data.notes && { notes: data.notes.trim() }),
        };
        return await db.contact.update({ where: { id }, data: updateData });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado para actualizar." });
        }
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "El email ya está registrado por otro contacto." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el contacto" });
      }
    }),
  

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      }
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const existingContact = await db.contact.findUnique({ where: { id: input.id, clientId } });
        if (!existingContact) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado para eliminar." });
        }
        return await db.contact.delete({ where: { id: input.id } });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado para eliminar." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el contacto" });
      }
    }),
  

  // Endpoints para superadmin
  listByClient: protectedProcedure
    .input(z.object({ 
      clientId: z.string().uuid(),
      filters: z.object({
        status: z.nativeEnum(ContactStatus).optional(),
        channel: z.string().optional(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }).optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar que el usuario es superadmin o admin del cliente
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== input.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estos contactos"
          });
        }

        const filters = input.filters;
        
        const where: Prisma.ContactWhereInput = {
          clientId: input.clientId,
          // Excluir contactos de playground
          //source: { not: "playground" },
          ...(filters?.status && { status: filters.status }),
          ...(filters?.channel && { channel: filters.channel as ContactChannel }),
          ...(filters?.search && {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { phone: { contains: filters.search, mode: 'insensitive' } },
              { message: { contains: filters.search, mode: 'insensitive' } },
            ]
          }),
          ...(filters?.tags && filters.tags.length > 0 && {
            tags: { hasSome: filters.tags }
          })
        };

        return await db.contact.findMany({
          where,
          orderBy: { createdAt: "desc" }
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener los contactos del cliente"
        });
      }
    }),

  stats: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const clientId = input.clientId;

        const [total, byStatus, byChannel] = await Promise.all([
          db.contact.count({ where: { clientId, source: { not: "playground" } } }),
          db.contact.groupBy({
            by: ['status'],
            where: { clientId, 
            //  source: { not: "playground" } 
            },
            _count: { status: true }
          }),
          db.contact.groupBy({
            by: ['channel'],
            where: { clientId, 
            //  source: { not: "playground" } 
            },
            _count: { channel: true }
          })
        ]);

        return {
          total,
          byStatus: byStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          byChannel: byChannel.reduce((acc, item) => {
            acc[item.channel] = item._count.channel;
            return acc;
          }, {} as Record<string, number>)
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener estadísticas de contactos"
        });
      }
    })
});
