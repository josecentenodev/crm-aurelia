import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

export const dashboardClienteRouter = createTRPCRouter({
  // Métricas básicas disponibles actualmente
  getMetrics: protectedProcedure
    .input(z.object({ clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        // Obtener métricas de contactos
        const [totalContacts, newContactsThisWeek, activeContacts] = await Promise.all([
          // Total de contactos
          db.contact.count({
            where: { clientId }
          }),
          // Contactos nuevos esta semana
          db.contact.count({
            where: {
              clientId,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
              }
            }
          }),
          // Contactos activos (no descartados)
          db.contact.count({
            where: {
              clientId,
              status: {
                not: "DESCARTADO"
              }
            }
          })
        ]);

        // Obtener métricas de conversaciones
        const [totalConversations, activeConversations, conversationsThisWeek] = await Promise.all([
          // Total de conversaciones
          db.conversation.count({
            where: { clientId }
          }),
          // Conversaciones activas
          db.conversation.count({
            where: {
              clientId,
              status: "ACTIVA"
            }
          }),
          // Conversaciones esta semana
          db.conversation.count({
            where: {
              clientId,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
              }
            }
          })
        ]);

        // Obtener métricas de mensajes
        const totalMessages = await db.message.count({
          where: {
            conversation: {
              clientId
            }
          }
        });

        // Obtener métricas de agentes
        const [totalAgents, activeAgents] = await Promise.all([
          db.agente.count({
            where: { clientId }
          }),
          db.agente.count({
            where: { 
              clientId,
              isActive: true
            }
          })
        ]);

        // Calcular tendencias (comparación con semana anterior)
        const lastWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const thisWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [lastWeekContacts, lastWeekConversations] = await Promise.all([
          db.contact.count({
            where: {
              clientId,
              createdAt: {
                gte: lastWeekStart,
                lt: thisWeekStart
              }
            }
          }),
          db.conversation.count({
            where: {
              clientId,
              createdAt: {
                gte: lastWeekStart,
                lt: thisWeekStart
              }
            }
          })
        ]);

        // Calcular porcentajes de cambio
        const contactsChange = lastWeekContacts > 0 
          ? Math.round(((newContactsThisWeek - lastWeekContacts) / lastWeekContacts) * 100)
          : newContactsThisWeek > 0 ? 100 : 0;

        const conversationsChange = lastWeekConversations > 0
          ? Math.round(((conversationsThisWeek - lastWeekConversations) / lastWeekConversations) * 100)
          : conversationsThisWeek > 0 ? 100 : 0;

        return {
          contacts: {
            total: totalContacts,
            newThisWeek: newContactsThisWeek,
            active: activeContacts,
            change: contactsChange
          },
          conversations: {
            total: totalConversations,
            active: activeConversations,
            thisWeek: conversationsThisWeek,
            change: conversationsChange
          },
          messages: {
            total: totalMessages
          },
          agents: {
            total: totalAgents,
            active: activeAgents
          }
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las métricas del dashboard"
        });
      }
    }),

  // Métricas por canal (para cuando se implemente la integración)
  getChannelMetrics: protectedProcedure
    .input(z.object({ clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        // Obtener conversaciones agrupadas por canal
        const conversationsByChannel = await db.conversation.groupBy({
          by: ['channel'],
          where: { clientId },
          _count: {
            id: true
          }
        });

        // Obtener contactos agrupados por canal
        const contactsByChannel = await db.contact.groupBy({
          by: ['channel'],
          where: { clientId },
          _count: {
            id: true
          }
        });

        return {
          conversations: conversationsByChannel.map(item => ({
            channel: item.channel,
            count: item._count.id
          })),
          contacts: contactsByChannel.map(item => ({
            channel: item.channel,
            count: item._count.id
          }))
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las métricas por canal"
        });
      }
    }),

  // Actividad reciente
  getRecentActivity: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10), clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        // Obtener conversaciones recientes
        const recentConversations = await db.conversation.findMany({
          where: { clientId },
          include: {
            contact: {
              select: {
                name: true
              }
            }
          },
          orderBy: { updatedAt: "desc" },
          take: input.limit
        });

        // Obtener contactos recientes
        const recentContacts = await db.contact.findMany({
          where: { clientId },
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            channel: true
          },
          orderBy: { createdAt: "desc" },
          take: input.limit
        });

        return {
          conversations: recentConversations.map(conv => ({
            id: conv.id,
            type: 'conversation' as const,
            title: conv.title ?? `Conversación con ${conv.contact?.name ?? 'Contacto'}`,
            status: conv.status,
            channel: conv.channel,
            updatedAt: conv.updatedAt,
            contactName: conv.contact?.name
          })),
          contacts: recentContacts.map(contact => ({
            id: contact.id,
            type: 'contact' as const,
            title: contact.name,
            status: contact.status,
            channel: contact.channel,
            createdAt: contact.createdAt
          }))
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la actividad reciente"
        });
      }
    }),

  // Métricas detalladas por status
  getStatusMetrics: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;
        if (!clientId) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Usuario sin cliente asignado" 
          });
        }

        // Obtener contactos por status
        const contactsByStatus = await db.contact.groupBy({
          by: ['status'],
          where: { clientId },
          _count: { status: true }
        });

        // Obtener conversaciones por status
        const conversationsByStatus = await db.conversation.groupBy({
          by: ['status'],
          where: { clientId },
          _count: { status: true }
        });

        return {
          contacts: contactsByStatus.map(item => ({
            status: item.status,
            count: item._count.status
          })),
          conversations: conversationsByStatus.map(item => ({
            status: item.status,
            count: item._count.status
          }))
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las métricas por status"
        });
      }
    }),

  // Métricas de rendimiento de agentes
  getAgentPerformance: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;
        if (!clientId) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Usuario sin cliente asignado" 
          });
        }

        // Obtener agentes con sus conversaciones
        const agents = await db.agente.findMany({
          where: { clientId },
          include: {
            _count: {
              select: {
                conversations: true
              }
            }
          },
          orderBy: {
            conversationsThisMonth: 'desc'
          }
        });

        return agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          isActive: agent.isActive,
          isPrincipal: agent.isPrincipal,
          conversationsThisMonth: agent.conversationsThisMonth,
          totalConversations: agent._count.conversations
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el rendimiento de agentes"
        });
      }
    }),

  // Endpoints para superadmin
  getClientMetrics: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar que el usuario es superadmin
        if (ctx.session.user.type !== "AURELIA") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas métricas"
          });
        }

        const clientId = input.clientId;

        // Obtener métricas básicas del cliente
        const [totalContacts, totalConversations, totalMessages, totalAgents] = await Promise.all([
          db.contact.count({ where: { clientId } }),
          db.conversation.count({ where: { clientId } }),
          db.message.count({
            where: {
              conversation: { clientId }
            }
          }),
          db.agente.count({ where: { clientId } })
        ]);

        // Obtener actividad reciente
        const recentActivity = await db.conversation.findMany({
          where: { clientId },
          include: {
            contact: {
              select: { name: true }
            }
          },
          orderBy: { updatedAt: "desc" },
          take: 5
        });

        return {
          overview: {
            totalContacts,
            totalConversations,
            totalMessages,
            totalAgents
          },
          recentActivity: recentActivity.map(conv => ({
            id: conv.id,
            title: conv.title ?? `Conversación con ${conv.contact?.name ?? 'Contacto'}`,
            status: conv.status,
            updatedAt: conv.updatedAt
          }))
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las métricas del cliente"
        });
      }
    }),

  // Métricas globales para superadmin
  getGlobalMetrics: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Verificar que el usuario es superadmin
        if (ctx.session.user.type !== "AURELIA") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas métricas"
          });
        }

        // Obtener métricas globales
        const [totalClients, totalUsers, totalContacts, totalConversations] = await Promise.all([
          db.client.count(),
          db.user.count(),
          db.contact.count(),
          db.conversation.count()
        ]);

        // Obtener clientes activos (con actividad reciente)
        const activeClients = await db.client.count({
          where: {
            conversations: {
              some: {
                updatedAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                }
              }
            }
          }
        });

        return {
          totalClients,
          activeClients,
          totalUsers,
          totalContacts,
          totalConversations
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las métricas globales"
        });
      }
    })
});
