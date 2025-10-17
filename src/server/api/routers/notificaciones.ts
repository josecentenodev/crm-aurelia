import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  CreateNotificationSchema,
  UpdateNotificationSchema,
  NotificationFiltersSchema,
  MarkAsReadSchema,
  MarkAllAsReadSchema,
  NotificationType,
  NotificationPriority
} from "@/domain/Notificaciones";
import type { NotificationWithUser, NotificationStats } from "@/domain/Notificaciones";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const notificacionesRouter = createTRPCRouter({
  // Obtener lista de notificaciones con filtros y paginación
  list: protectedProcedure
    .input(NotificationFiltersSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { clientId, userId, type, read, priority, category, dateFrom, dateTo, limit = 50, offset = 0 } = input;

        // Determinar clientId: usar el del input o del usuario de la sesión
        const effectiveClientId = clientId ?? ctx.session.user.clientId;

        if (!effectiveClientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se puede determinar el cliente"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== effectiveClientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas notificaciones"
          });
        }

        // Construir where clause
        const where: Prisma.NotificationWhereInput = {
          clientId: effectiveClientId,
          ...(userId !== undefined && { userId }),
          ...(type && { type }),
          ...(read !== undefined && { read }),
          ...(priority && { priority }),
          ...(category && { category }),
          ...(dateFrom && dateTo && {
            createdAt: {
              gte: dateFrom,
              lte: dateTo
            }
          })
        };

        const [notifications, total] = await Promise.all([
          db.notification.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: [
              { priority: "desc" }, // URGENT primero, luego HIGH, etc.
              { createdAt: "desc" }
            ],
            take: limit,
            skip: offset
          }),
          db.notification.count({ where })
        ]);

        return {
          notifications: notifications as NotificationWithUser[],
          total,
          hasMore: offset + notifications.length < total
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las notificaciones"
        });
      }
    }),

  // Obtener notificación por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const notification = await db.notification.findFirst({
          where: {
            id: input.id,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId
              ? { clientId: ctx.session.user.clientId }
              : {})
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notificación no encontrada"
          });
        }

        return notification as NotificationWithUser;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la notificación"
        });
      }
    }),

  // Crear nueva notificación
  create: protectedProcedure
    .input(CreateNotificationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se puede determinar el cliente"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para crear notificaciones en este cliente"
          });
        }

        const notification = await db.notification.create({
          data: {
            ...input,
            clientId,
            metadata: input.metadata ?? undefined
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        return notification;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la notificación"
        });
      }
    }),

  // Actualizar notificación
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: UpdateNotificationSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar que la notificación existe y pertenece al cliente
        const existing = await db.notification.findFirst({
          where: {
            id: input.id,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId
              ? { clientId: ctx.session.user.clientId }
              : {})
          }
        });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notificación no encontrada"
          });
        }

        const notification = await db.notification.update({
          where: { id: input.id },
          data: {
            ...input.data,
            metadata: input.data.metadata ?? undefined
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        return notification;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar la notificación"
        });
      }
    }),

  // Marcar notificaciones como leídas
  markAsRead: protectedProcedure
    .input(MarkAsReadSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuario sin cliente asignado"
          });
        }

        // Verificar que todas las notificaciones pertenecen al cliente
        const notifications = await db.notification.findMany({
          where: {
            id: { in: input.notificationIds },
            clientId
          },
          select: { id: true }
        });

        if (notifications.length !== input.notificationIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Algunas notificaciones no fueron encontradas"
          });
        }

        await db.notification.updateMany({
          where: {
            id: { in: input.notificationIds },
            clientId
          },
          data: {
            read: true,
            readAt: new Date()
          }
        });

        return { success: true, count: input.notificationIds.length };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al marcar las notificaciones como leídas"
        });
      }
    }),

  // Marcar todas las notificaciones como leídas
  markAllAsRead: protectedProcedure
    .input(MarkAllAsReadSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se puede determinar el cliente"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para modificar notificaciones de este cliente"
          });
        }

        const where: Prisma.NotificationWhereInput = {
          clientId,
          read: false,
          ...(input.userId !== undefined && { userId: input.userId })
        };

        const result = await db.notification.updateMany({
          where,
          data: {
            read: true,
            readAt: new Date()
          }
        });

        return { success: true, count: result.count };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al marcar todas las notificaciones como leídas"
        });
      }
    }),

  // Eliminar notificación
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar que la notificación existe y pertenece al cliente
        const notification = await db.notification.findFirst({
          where: {
            id: input.id,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId
              ? { clientId: ctx.session.user.clientId }
              : {})
          }
        });

        if (!notification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Notificación no encontrada"
          });
        }

        await db.notification.delete({
          where: { id: input.id }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar la notificación"
        });
      }
    }),

  // Eliminar múltiples notificaciones
  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()).min(1) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuario sin cliente asignado"
          });
        }

        // Verificar que todas las notificaciones pertenecen al cliente
        const notifications = await db.notification.findMany({
          where: {
            id: { in: input.ids },
            clientId
          },
          select: { id: true }
        });

        if (notifications.length !== input.ids.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Algunas notificaciones no fueron encontradas"
          });
        }

        const result = await db.notification.deleteMany({
          where: {
            id: { in: input.ids },
            clientId
          }
        });

        return { success: true, count: result.count };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar las notificaciones"
        });
      }
    }),

  // Obtener estadísticas de notificaciones
  getStats: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        userId: z.string().uuid().optional().nullable()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se puede determinar el cliente"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas estadísticas"
          });
        }

        const where: Prisma.NotificationWhereInput = {
          clientId,
          ...(input.userId !== undefined && { userId: input.userId })
        };

        const [total, unread, byTypeData, byPriorityData] = await Promise.all([
          db.notification.count({ where }),
          db.notification.count({ where: { ...where, read: false } }),
          db.notification.groupBy({
            by: ["type"],
            where,
            _count: { type: true }
          }),
          db.notification.groupBy({
            by: ["priority"],
            where,
            _count: { priority: true }
          })
        ]);

        // Construir objeto con todos los tipos
        const byType: Record<NotificationType, number> = {
          [NotificationType.INFO]: 0,
          [NotificationType.SUCCESS]: 0,
          [NotificationType.WARNING]: 0,
          [NotificationType.ERROR]: 0,
          [NotificationType.SYSTEM]: 0
        };

        byTypeData.forEach((item) => {
          byType[item.type as NotificationType] = item._count.type;
        });

        // Construir objeto con todas las prioridades
        const byPriority: Record<NotificationPriority, number> = {
          [NotificationPriority.LOW]: 0,
          [NotificationPriority.MEDIUM]: 0,
          [NotificationPriority.HIGH]: 0,
          [NotificationPriority.URGENT]: 0
        };

        byPriorityData.forEach((item) => {
          byPriority[item.priority as NotificationPriority] = item._count.priority;
        });

        const stats: NotificationStats = {
          total,
          unread,
          byType,
          byPriority
        };

        return stats;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las estadísticas"
        });
      }
    }),

  // Obtener contador de no leídas (para badge en el header)
  getUnreadCount: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        userId: z.string().uuid().optional().nullable()
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const clientId = input.clientId ?? ctx.session.user.clientId;

        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se puede determinar el cliente"
          });
        }

        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a este contador"
          });
        }

        const where: Prisma.NotificationWhereInput = {
          clientId,
          read: false,
          ...(input.userId !== undefined && { userId: input.userId })
        };

        const count = await db.notification.count({ where });

        return { count };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el contador de notificaciones"
        });
      }
    }),

  // Limpiar notificaciones expiradas
  cleanExpired: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar permisos (solo AURELIA o ADMIN)
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.type !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para esta operación"
          });
        }

        const result = await db.notification.deleteMany({
          where: {
            clientId: input.clientId,
            expiresAt: {
              lte: new Date()
            }
          }
        });

        return { success: true, count: result.count };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al limpiar notificaciones expiradas"
        });
      }
    })
});
