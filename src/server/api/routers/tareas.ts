import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  CreateCrmTaskSchema,
  UpdateCrmTaskSchema,
  CrmTaskStatus,
  CrmTaskPriority
} from "@/domain/Tareas";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";

export const tareasRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      filters: z.object({
        status: z.nativeEnum(CrmTaskStatus).optional(),
        priority: z.nativeEnum(CrmTaskPriority).optional(),
        ownerId: z.string().uuid().optional(),
        relatedContactId: z.string().uuid().optional(),
        relatedConversationId: z.string().uuid().optional(),
        relatedOpportunityId: z.string().uuid().optional(),
        search: z.string().optional(),
        dueDateFrom: z.date().optional(),
        dueDateTo: z.date().optional(),
      }).optional(),
      clientId: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Validar que usuarios no-AURELIA solo puedan ver sus propias tareas o de su cliente
        if (ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para ver las tareas de este cliente" });
        }

        const filters = input.filters;

        const where: Prisma.CrmTaskWhereInput = {
          clientId: input.clientId,
          ...(filters?.status && { status: filters.status }),
          ...(filters?.priority && { priority: filters.priority }),
          ...(filters?.ownerId && { ownerId: filters.ownerId }),
          ...(filters?.relatedContactId && { relatedContactId: filters.relatedContactId }),
          ...(filters?.relatedConversationId && { relatedConversationId: filters.relatedConversationId }),
          ...(filters?.relatedOpportunityId && { relatedOpportunityId: filters.relatedOpportunityId }),
          ...(filters?.search && {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ]
          }),
          ...(filters?.dueDateFrom && { dueDate: { gte: filters.dueDateFrom } }),
          ...(filters?.dueDateTo && { dueDate: { lte: filters.dueDateTo } }),
        };

        return await db.crmTask.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            relatedContact: {
              select: {
                id: true,
                name: true,
              }
            },
            relatedConversation: {
              select: {
                id: true,
                title: true,
              }
            },
            relatedOpportunity: {
              select: {
                id: true,
                title: true,
              }
            },
          },
          orderBy: [
            { status: 'asc' },
            { priority: 'desc' },
            { dueDate: 'asc' }
          ]
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las tareas"
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
        const task = await db.crmTask.findUnique({
          where: {
            id: input.id,
            clientId
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            relatedContact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            },
            relatedConversation: {
              select: {
                id: true,
                title: true,
                status: true,
              }
            },
            relatedOpportunity: {
              select: {
                id: true,
                title: true,
                amount: true,
                status: true,
              }
            },
          }
        });
        if (!task) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarea no encontrada" });
        }
        return task;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la tarea"
        });
      }
    }),

  create: protectedProcedure
    .input(CreateCrmTaskSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        }

        // Validar que usuarios no-AURELIA no puedan crear tareas para otros clientes
        if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para crear tareas para este cliente" });
        }

        if (!input.title?.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El título es requerido" });
        }

        // Verificar que el owner existe y pertenece al cliente
        const owner = await db.user.findUnique({
          where: { id: input.ownerId },
          select: { id: true, clientId: true }
        });

        if (!owner) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El propietario especificado no existe" });
        }

        if (owner.clientId !== clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El propietario no pertenece a este cliente" });
        }

        const taskData = {
          ...input,
          title: input.title.trim(),
          description: input.description?.trim() ?? null,
          status: input.status ?? CrmTaskStatus.PENDING,
          priority: input.priority ?? CrmTaskPriority.MEDIUM,
          clientId,
        };

        return await db.crmTask.create({
          data: taskData,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            relatedContact: {
              select: {
                id: true,
                name: true,
              }
            },
            relatedConversation: {
              select: {
                id: true,
                title: true,
              }
            },
            relatedOpportunity: {
              select: {
                id: true,
                title: true,
              }
            },
          }
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2003") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Una de las relaciones especificadas no existe." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear la tarea" });
      }
    }),

  update: protectedProcedure
    .input(UpdateCrmTaskSchema.extend({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
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
        const existingTask = await db.crmTask.findUnique({ where: { id, clientId } });
        if (!existingTask) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarea no encontrada para actualizar." });
        }
        if (data.title !== undefined && !data.title?.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "El título no puede estar vacío" });
        }

        // Si se está cambiando el owner, verificar que existe y pertenece al cliente
        if (data.ownerId) {
          const owner = await db.user.findUnique({
            where: { id: data.ownerId },
            select: { id: true, clientId: true }
          });

          if (!owner) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "El propietario especificado no existe" });
          }

          if (owner.clientId !== clientId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "El propietario no pertenece a este cliente" });
          }
        }

        const updateData = {
          ...data,
          ...(data.title && { title: data.title.trim() }),
          ...(data.description !== undefined && { description: data.description?.trim() ?? null }),
        };

        return await db.crmTask.update({
          where: { id },
          data: updateData,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            relatedContact: {
              select: {
                id: true,
                name: true,
              }
            },
            relatedConversation: {
              select: {
                id: true,
                title: true,
              }
            },
            relatedOpportunity: {
              select: {
                id: true,
                title: true,
              }
            },
          }
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarea no encontrada para actualizar." });
        }
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2003") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Una de las relaciones especificadas no existe." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar la tarea" });
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
        const existingTask = await db.crmTask.findUnique({ where: { id: input.id, clientId } });
        if (!existingTask) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarea no encontrada para eliminar." });
        }
        return await db.crmTask.delete({ where: { id: input.id } });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2025") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarea no encontrada para eliminar." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar la tarea" });
      }
    }),

  stats: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        // Validar que usuarios no-AURELIA solo puedan ver estadísticas de su cliente
        if (ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para ver estadísticas de este cliente" });
        }

        const clientId = input.clientId;

        const [total, byStatus, byPriority, overdue] = await Promise.all([
          db.crmTask.count({ where: { clientId } }),
          db.crmTask.groupBy({
            by: ['status'],
            where: { clientId },
            _count: { status: true }
          }),
          db.crmTask.groupBy({
            by: ['priority'],
            where: { clientId },
            _count: { priority: true }
          }),
          db.crmTask.count({
            where: {
              clientId,
              status: { notIn: [CrmTaskStatus.COMPLETED, CrmTaskStatus.ARCHIVED] },
              dueDate: { lt: new Date() }
            }
          })
        ]);

        return {
          total,
          overdue,
          byStatus: byStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          byPriority: byPriority.reduce((acc, item) => {
            acc[item.priority] = item._count.priority;
            return acc;
          }, {} as Record<string, number>)
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener estadísticas de tareas"
        });
      }
    }),

  myTasks: protectedProcedure
    .input(z.object({
      filters: z.object({
        status: z.nativeEnum(CrmTaskStatus).optional(),
        priority: z.nativeEnum(CrmTaskPriority).optional(),
      }).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.session.user.id;
        const clientId = ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        }

        const filters = input.filters;

        const where: Prisma.CrmTaskWhereInput = {
          clientId,
          ownerId: userId,
          ...(filters?.status && { status: filters.status }),
          ...(filters?.priority && { priority: filters.priority }),
        };

        return await db.crmTask.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            relatedContact: {
              select: {
                id: true,
                name: true,
              }
            },
            relatedConversation: {
              select: {
                id: true,
                title: true,
              }
            },
            relatedOpportunity: {
              select: {
                id: true,
                title: true,
              }
            },
          },
          orderBy: [
            { status: 'asc' },
            { priority: 'desc' },
            { dueDate: 'asc' }
          ]
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener tus tareas"
        });
      }
    }),
});
