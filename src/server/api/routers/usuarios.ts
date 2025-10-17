import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TipoUsuario } from "@prisma/client";

// Schemas de validación actualizados para usar enums de Prisma
const UpdateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  image: z.string().url("URL de imagen inválida").optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

const CreateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  type: z.nativeEnum(TipoUsuario).optional(),
  clientId: z.string().uuid().optional(),
  active: z.boolean().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  type: z.nativeEnum(TipoUsuario).optional(),
  clientId: z.string().uuid().optional(),
  active: z.boolean().optional(),
});

// Schema para edición rápida (campos simples)
const QuickUpdateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  active: z.boolean().optional(),
});

export const usuariosRouter = createTRPCRouter({
  // ================= ENDPOINTS PARA EL ENFOQUE HÍBRIDO =================
  
  // Obtener usuario por ID (para páginas de detalle)
  getUserById: protectedProcedure
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
        const user = await db.user.findFirst({
          where: { 
            id: input.id,
            clientId // Asegurar que pertenece al cliente
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                status: {
                  select: { name: true }
                },
                plan: {
                  select: { name: true }
                }
              }
            }
          }
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado"
          });
        }

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el usuario"
        });
      }
    }),

  // Actualizar usuario (edición completa)
  updateUser: protectedProcedure
    .input(UpdateUserSchema.extend({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { id, clientId: inputClientId, ...data } = input;
      const clientId = inputClientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario sin cliente asignado"
        });
      }
      if (inputClientId && ctx.session.user.type !== "AURELIA" && inputClientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        // Verificar que el usuario existe y pertenece al cliente
        const existingUser = await db.user.findFirst({
          where: { 
            id,
            clientId
          }
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado para actualizar."
          });
        }

        // Si se está actualizando el email, verificar que no exista
        if (data.email) {
          const emailExists = await db.user.findFirst({
            where: {
              email: data.email.toLowerCase(),
              id: { not: id }
            }
          });

          if (emailExists) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "El email ya está registrado por otro usuario"
            });
          }
        }

        const user = await db.user.update({
          where: { id },
          data: {
            ...data,
            ...(data.email && { email: data.email.toLowerCase() })
          },
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "El email ya está registrado por otro usuario"
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el usuario"
        });
      }
    }),

  // Actualizar usuario (edición rápida - solo campos simples)
  updateUserQuick: protectedProcedure
    .input(QuickUpdateUserSchema.extend({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { id, clientId: inputClientId, ...data } = input;
      const clientId = inputClientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario sin cliente asignado"
        });
      }
      if (inputClientId && ctx.session.user.type !== "AURELIA" && inputClientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        // Verificar que el usuario existe y pertenece al cliente
        const existingUser = await db.user.findFirst({
          where: { 
            id,
            clientId
          }
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado para actualizar."
          });
        }

        const user = await db.user.update({
          where: { id },
          data,
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el usuario"
        });
      }
    }),

  // ================= ENDPOINTS EXISTENTES (MANTENIDOS) =================

  // Obtener perfil del usuario actual
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.session.user.id;

        const user = await db.user.findUnique({
          where: { id: userId },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                status: {
                  select: { name: true }
                },
                plan: {
                  select: { name: true }
                }
              }
            }
          }
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado"
          });
        }

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el perfil"
        });
      }
    }),

  // Actualizar perfil del usuario actual
  updateProfile: protectedProcedure
    .input(UpdateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.session.user.id;
        const { name, image } = input;

        const user = await db.user.update({
          where: { id: userId },
          data: {
            ...(name && { name }),
            ...(image && { image })
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                status: {
                  select: { name: true }
                },
                plan: {
                  select: { name: true }
                }
              }
            }
          }
        });

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el perfil"
        });
      }
    }),

  // Cambiar contraseña del usuario actual
  changePassword: protectedProcedure
    .input(ChangePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { currentPassword, newPassword } = input;
        const userId = ctx.session.user.id;

        // Obtener usuario actual
        const user = await db.user.findUnique({
          where: { id: userId }
        });

        if (!user?.password) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado"
          });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "La contraseña actual es incorrecta"
          });
        }

        // Hash de la nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Actualizar contraseña
        await db.user.update({
          where: { id: userId },
          data: { password: hashedNewPassword }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al cambiar la contraseña"
        });
      }
    }),

  // Verificar si el usuario está autenticado
  checkAuth: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.session.user.id;

        const user = await db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            clientId: true,
            active: true
          }
        });

        if (!user?.active) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuario no autenticado o inactivo"
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al verificar autenticación"
        });
      }
    }),

  // ================= ENDPOINTS PARA SAAS (GESTIÓN POR CLIENTE) =================

  // Listar usuarios del cliente actual
  listByClient: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.nativeEnum(TipoUsuario).optional(),
      active: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      clientId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const clientId = input?.clientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario sin cliente asignado"
        });
      }
      if (input?.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        // Verificar permisos: solo ADMIN y AURELIA pueden gestionar usuarios
        if (ctx.session.user.type === "CUSTOMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para gestionar usuarios"
          });
        }

        const filters = input ?? {
          search: undefined,
          type: undefined,
          active: undefined,
          limit: 20,
          offset: 0
        };
        
        const where: Prisma.UserWhereInput = {
          clientId,
          type: { in: ["ADMIN", "CUSTOMER", "AURELIA"] }, // Solo usuarios del cliente, no superadmins
          ...(filters.type && { type: filters.type }),
          ...(filters.active !== undefined && { active: filters.active }),
          ...(filters.search && {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
            ]
          })
        };

        const [users, total] = await Promise.all([
          db.user.findMany({
            where,
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
              active: true,
              image: true,
              createdAt: true,
              updatedAt: true,
              client: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: { createdAt: "desc" },
            take: filters.limit,
            skip: filters.offset
          }),
          db.user.count({ where })
        ]);

        return {
          users,
          pagination: {
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: filters.offset + filters.limit < total
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la lista de usuarios"
        });
      }
    }),

  // Crear usuario para el cliente actual
  createUser: protectedProcedure
    .input(CreateUserSchema.omit({ clientId: true }).extend({ clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
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
        // Verificar permisos
        if (ctx.session.user.type === "CUSTOMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para crear usuarios"
          });
        }

        const { name, email, password, type, active } = input;

        // Verificar si el email ya existe
        const existingUser = await db.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "El email ya está registrado"
          });
        }

        // Verificar que el cliente existe
        const client = await db.client.findUnique({
          where: { id: clientId }
        });

        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente no encontrado"
          });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear usuario
        const user = await db.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            type: type ?? "CUSTOMER",
            active: active ?? true,
            clientId
          },
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            active: true,
            image: true,
            createdAt: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "El email ya está registrado"
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear el usuario"
        });
      }
    }),

  // Eliminar usuario del cliente
  deleteUser: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
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
        // Verificar permisos
        if (ctx.session.user.type === "CUSTOMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para eliminar usuarios"
          });
        }

        const { id } = input;

        // Verificar que el usuario existe y pertenece al cliente
        const existingUser = await db.user.findFirst({
          where: { 
            id,
            clientId,
            type: { in: ["ADMIN", "CUSTOMER"] }
          }
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado"
          });
        }

        // No permitir eliminar el propio usuario
        if (id === ctx.session.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No puedes eliminar tu propia cuenta"
          });
        }

        // Eliminar usuario (soft delete)
        await db.user.update({
          where: { id },
          data: { 
            active: false,
            deletedAt: new Date()
          }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar el usuario"
        });
      }
    }),

  // Activar/Desactivar usuario del cliente
  toggleUserActive: protectedProcedure
    .input(z.object({ 
      id: z.string().uuid(), 
      clientId: z.string().uuid().optional(),
      active: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
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
        // Verificar permisos
        if (ctx.session.user.type === "CUSTOMER") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para gestionar usuarios"
          });
        }

        const { id, active } = input;

        // Verificar que el usuario existe y pertenece al cliente
        const existingUser = await db.user.findFirst({
          where: { 
            id,
            clientId,
            type: { in: ["ADMIN", "CUSTOMER"] },
            deletedAt: null // Solo usuarios no eliminados
          }
        });

        if (!existingUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado"
          });
        }

        // No permitir desactivar el propio usuario
        if (ctx.session.user.id === id && !active) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No puedes desactivar tu propia cuenta"
          });
        }

        // Actualizar estado del usuario
        const updatedUser = await db.user.update({
          where: { id },
          data: { 
            active,
            updatedAt: new Date()
          },
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            active: true,
            updatedAt: true
          }
        });

        return { 
          success: true, 
          user: updatedUser,
          message: active ? "Usuario activado correctamente" : "Usuario desactivado correctamente"
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el estado del usuario"
        });
      }
    }),

  // ================= ENDPOINTS PARA SUPERADMIN (MANTENIDOS) =================

  // Endpoints para superadmin
  list: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid().optional(),
      filters: z.object({
        type: z.nativeEnum(TipoUsuario).optional(),
        active: z.boolean().optional(),
        search: z.string().optional(),
      }).optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        // Verificar que el usuario es superadmin
        if (ctx.session.user.type !== "AURELIA") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a esta información"
          });
        }

        const filters = input?.filters;
        const clientId = input?.clientId;
        
        const where: Prisma.UserWhereInput = {
          ...(clientId && { clientId }),
          ...(filters?.type && { type: filters.type }),
          ...(filters?.active !== undefined && { active: filters.active }),
          ...(filters?.search && {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
            ]
          })
        };

        const users = await db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            active: true,
            clientId: true,
            createdAt: true,
            updatedAt: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        });

        return users;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la lista de usuarios"
        });
      }
    }),

  // Cambiar de cliente (solo para usuarios AURELIA)
  switchClient: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar que el usuario es AURELIA
        if (ctx.session.user.type !== "AURELIA") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Solo usuarios AURELIA pueden cambiar de cliente"
          });
        }

        // Verificar que el cliente existe
        const client = await db.client.findUnique({
          where: { id: input.clientId },
          select: { id: true, name: true, status: true }
        });

        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente no encontrado"
          });
        }

        // Actualizar el clientId del usuario en la base de datos
        await db.user.update({
          where: { id: ctx.session.user.id },
          data: { clientId: input.clientId }
        });

        return {
          success: true,
          client: {
            id: client.id,
            name: client.name,
            status: client.status
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al cambiar de cliente"
        });
      }
    }),

  // Obtener lista de clientes disponibles (solo para usuarios AURELIA)
  getAvailableClients: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Verificar que el usuario es AURELIA
        if (ctx.session.user.type !== "AURELIA") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Solo usuarios AURELIA pueden acceder a esta información"
          });
        }

        const clients = await db.client.findMany({
          select: {
            id: true,
            name: true,
            status: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { name: "asc" }
        });

        return clients;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la lista de clientes"
        });
      }
    }),

  // Obtener usuarios por cliente
  getUsers: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;
        
        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuario sin cliente asignado"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && clientId !== ctx.session.user.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a este cliente"
          });
        }

        const users = await db.user.findMany({
          where: { 
            clientId,
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        });

        return users;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la lista de usuarios"
        });
      }
    }),

  // Obtener estadísticas de usuarios
  getUserStats: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;
        
        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuario sin cliente asignado"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && clientId !== ctx.session.user.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a este cliente"
          });
        }

        const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
          db.user.count({
            where: { 
              clientId,
              deletedAt: null
            }
          }),
          db.user.count({
            where: { 
              clientId,
              active: true,
              deletedAt: null
            }
          }),
          db.user.count({
            where: { 
              clientId,
              active: false,
              deletedAt: null
            }
          })
        ]);

        return {
          totalUsers,
          activeUsers,
          inactiveUsers,
          activePercentage: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener estadísticas de usuarios"
        });
      }
    }),

  // Obtener usuarios de un cliente específico (para asignación de conversaciones)
  getClientUsers: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a este cliente"
          });
        }

        const users = await db.user.findMany({
          where: {
            clientId: input.clientId,
            active: true,
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          },
          orderBy: {
            name: 'asc'
          }
        });

        return users;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener usuarios del cliente"
        });
      }
    })
});
