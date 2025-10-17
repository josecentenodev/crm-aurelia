import { z } from "zod";
import { randomUUID } from "crypto";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { 
  UpdateConversationSchema, 
  CreateConversationWithInstanceSchema,
  ConversationFiltersSchema,
  CreateMessageSchema,
  ConversationStatus,
  ConversationType,
  ContactChannel
} from "@/domain/Conversaciones";
import type { ConversationFilters, ConversationsByInstance, ConversationWithDetails } from "@/domain/Conversaciones";


import { TRPCError } from "@trpc/server";
import { Prisma, MessageReadStatus, MessageSenderType } from "@prisma/client";

import { AiInfo } from "@/lib/openai";
import { Ai } from "@/lib/ai";
import { Encryptor } from "@/lib/encryptor/functions";
import { logger } from "@/lib/utils/server-logger";

// SSE broadcasting removed - Supabase Realtime handles this automatically

// Helper function para verificar que el usuario existe en la base de datos
async function verifyUserExists(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });
  
  if (!user) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El usuario no existe en la base de datos"
    });
  }
}

// NUEVA FUNCIÓN: Obtener conversaciones agrupadas por instancia
async function getConversationsGroupedByInstance(
  clientId: string,
  filters?: ConversationFilters,
  currentUserId?: string
): Promise<ConversationsByInstance[]> {
  // Obtener todas las conversaciones con sus instancias
  const conversations = await db.conversation.findMany({
    where: {
      clientId,
      evolutionInstanceId: { not: null }, // Solo conversaciones con instancia
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.channel && { channel: filters.channel }),
      ...(filters?.evolutionInstanceId && {
        evolutionInstanceId: filters.evolutionInstanceId
      }),
      // Filtro de asignación: si es 'CURRENT_USER', usar el ID del usuario proporcionado
      ...(filters?.assignedUserId !== undefined && {
        assignedUserId: filters.assignedUserId === 'CURRENT_USER'
          ? currentUserId
          : filters.assignedUserId
      }),
      ...(filters?.phoneNumber && {
        evolutionInstance: {
          phoneNumber: { contains: filters.phoneNumber }
        }
      }),
      ...(filters?.dateFrom && filters?.dateTo && {
        lastMessageAt: {
          gte: filters.dateFrom,
          lte: filters.dateTo
        }
      }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { contact: { name: { contains: filters.search, mode: 'insensitive' } } },
          { contact: { phone: { contains: filters.search } } },
        ]
      })
    },
    include: {
      contact: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          channel: true,
          stage: {
            select: { id: true, name: true, color: true }
          },
          pipeline: {
            select: { id: true, name: true }
          }
        }
      },
      agent: {
        select: {
          id: true,
          name: true,
          isActive: true
        }
      },
      assignedUser: {
        select: {
          id: true,
          name: true
        }
      },
      evolutionInstance: {
        select: {
          id: true,
          instanceName: true,
          phoneNumber: true,
          status: true
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    },
    orderBy: { lastMessageAt: "desc" }
  });

  // Calcular no leídos por conversación con una sola query
  const conversationIds = conversations.map(c => c.id)
  const unreadGrouped = await db.message.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: conversationIds },
      senderType: 'CONTACT',
      readStatus: 'UNREAD'
    },
    _count: { _all: true }
  })
  const unreadMap = new Map<string, number>(unreadGrouped.map(r => [r.conversationId, r._count._all]))

  // Agrupar conversaciones por instancia
  const groupedMap = new Map<string, ConversationsByInstance>();

  for (const conversation of conversations) {
    if (!conversation.evolutionInstance) continue;

    const instanceKey = conversation.evolutionInstance.instanceName;
    
    if (!groupedMap.has(instanceKey)) {
      groupedMap.set(instanceKey, {
        instanceName: conversation.evolutionInstance.instanceName,
        phoneNumber: conversation.evolutionInstance.phoneNumber,
        instanceStatus: conversation.evolutionInstance.status,
        instanceId: conversation.evolutionInstance.id,
        conversations: [],
        stats: {
          total: 0,
          active: 0,
          paused: 0,
          finished: 0
        }
      });
    }

    const group = groupedMap.get(instanceKey)!;
    const unreadCount = unreadMap.get(conversation.id) ?? conversation.unreadCount ?? 0
    group.conversations.push({ ...(conversation as ConversationWithDetails), unreadCount });
    group.stats.total++;
    
    // Calcular estadísticas
    switch (conversation.status) {
      case 'ACTIVA':
        group.stats.active++;
        break;
      case 'PAUSADA':
        group.stats.paused++;
        break;
      case 'FINALIZADA':
        group.stats.finished++;
        break;
    }
  }

  return Array.from(groupedMap.values()).sort((a, b) => 
    a.instanceName.localeCompare(b.instanceName)
  );
}

export const conversacionesRouter = createTRPCRouter({
  // ENDPOINT OPTIMIZADO PARA CARGA INICIAL DE PÁGINA
  getPageData: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      includeInstances: z.boolean().default(true),
      includeStats: z.boolean().default(true),
      filters: ConversationFiltersSchema.optional() // Nueva prop para filtros
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { clientId, includeInstances, includeStats, filters } = input;
        
        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a este cliente"
          });
        }

        // UNA SOLA QUERY OPTIMIZADA que obtiene todo lo necesario
        const [conversations, instances, stats] = await Promise.all([
          // Conversaciones agrupadas por instancia (con filtros aplicados)
          getConversationsGroupedByInstance(clientId, filters || { groupByInstance: true }, ctx.session.user.id),
          
          // Instancias del cliente (solo si se solicitan)
          includeInstances ? db.evolutionApiInstance.findMany({
            where: {
              evolutionApi: {
                integration: {
                  clientId,
                  isActive: true
                }
              }
            },
            select: {
              id: true,
              instanceName: true,
              phoneNumber: true,
              status: true,
              lastConnected: true,
              lastMessageAt: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: {
                  conversations: true
                }
              }
            },
            orderBy: { instanceName: 'asc' }
          }) : Promise.resolve([]),
          
          // Estadísticas (solo si se solicitan)
          includeStats ? db.conversation.aggregate({
            where: { clientId },
            _count: { _all: true }
          }) : Promise.resolve({ _count: { _all: 0 } })
        ]);

        return {
          conversations,
          instances,
          stats: {
            totalConversations: stats._count._all
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener datos de la página"
        });
      }
    }),

  // Obtener conversación por ID
  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const conversation = await db.conversation.findFirst({
          where: {
            id: input.id,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId ? { clientId: ctx.session.user.clientId } : {})
          },
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                pipeline: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                stage: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            },
            evolutionInstance: {
              select: {
                id: true,
                instanceName: true,
                phoneNumber: true,
                status: true
              }
            },
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 100
            },
            _count: {
              select: {
                messages: true
              }
            }
          }
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversación no encontrada"
          });
        }

        // Calcular no leídos (CONTACT -> UNREAD) para este detalle
        const unreadCount = await db.message.count({
          where: {
            conversationId: input.id,
            senderType: MessageSenderType.CONTACT,
            readStatus: MessageReadStatus.UNREAD
          }
        })

        return {
          ...conversation,
          unreadCount
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener la conversación"
        });
      }
    }),

  // Obtener mensajes de una conversación específica
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar que la conversación pertenece al cliente del usuario
        const conversation = await db.conversation.findFirst({
          where: {
            id: input.conversationId,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId ? { 
              clientId: ctx.session.user.clientId 
            } : {})
          },
          select: { id: true }
        })

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversación no encontrada"
          })
        }

        const messages = await db.message.findMany({
          where: { conversationId: input.conversationId },
          orderBy: { createdAt: 'desc' },
          take: 100 // Los 100 mensajes más recientes
        })

        // Invertir el orden para mostrar los más antiguos primero (como en un chat)
        return messages.reverse()
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener los mensajes"
        })
      }
    }),

  // ENDPOINT PRINCIPAL UNIFICADO CON SOPORTE COMPLETO PARA INSTANCIAS
  list: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      filters: ConversationFiltersSchema.optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { clientId, filters } = input;
        
        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas conversaciones"
          });
        }

        // Si se solicita agrupación por instancia, usar método especializado
        if (filters?.groupByInstance) {
          return await getConversationsGroupedByInstance(clientId, filters, ctx.session.user.id);
        }

        // Construir where clause con soporte completo para filtros
        const where: Prisma.ConversationWhereInput = {
          clientId,
          ...(filters?.status && { status: filters.status }),
          ...(filters?.type && { type: filters.type }),
          ...(filters?.channel && { channel: filters.channel }),
          ...(filters?.contactId && { contactId: filters.contactId }),
          ...(filters?.agentId && { agentId: filters.agentId }),
          // Filtro de asignación: si es 'CURRENT_USER', usar el ID del usuario de la sesión
          ...(filters?.assignedUserId !== undefined && {
            assignedUserId: filters.assignedUserId === 'CURRENT_USER'
              ? ctx.session.user.id
              : filters.assignedUserId
          }),
          ...(filters?.evolutionInstanceId && { 
            evolutionInstanceId: filters.evolutionInstanceId 
          }),
          ...(filters?.instanceName && {
            evolutionInstance: {
              instanceName: { contains: filters.instanceName, mode: 'insensitive' }
            }
          }),
          ...(filters?.phoneNumber && {
            evolutionInstance: {
              phoneNumber: { contains: filters.phoneNumber }
            }
          }),
          ...(filters?.dateFrom && filters?.dateTo && {
            lastMessageAt: {
              gte: filters.dateFrom,
              lte: filters.dateTo
            }
          }),
          ...(filters?.search && {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { contact: { name: { contains: filters.search, mode: 'insensitive' } } },
              { contact: { phone: { contains: filters.search } } },
              { contact: { email: { contains: filters.search, mode: 'insensitive' } } },
            ]
          })
        };

        const conversations = await db.conversation.findMany({
          where,
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                channel: true,
                stage: {
                  select: { id: true, name: true, color: true }
                },
                pipeline: {
                  select: { id: true, name: true }
                }
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            },
            assignedUser: {
              select: {
                id: true,
                name: true
              }
            },
            evolutionInstance: {
              select: {
                id: true,
                instanceName: true,
                phoneNumber: true,
                status: true
              }
            },
            _count: {
              select: {
                messages: true
              }
            }
          },
          orderBy: { lastMessageAt: "desc" }
        });

        // Fuente única: unreadCount mantenido por DB (triggers)
        const withUnread = conversations.map(c => ({
          ...(c as ConversationWithDetails),
          unreadCount: c.unreadCount ?? 0
        }))

        return withUnread as ConversationWithDetails[];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las conversaciones"
        });
      }
    }),

  // ENDPOINT CONSOLIDADO PARA CREAR CONVERSACIONES (con soporte opcional para instancias)
  create: protectedProcedure
    .input(CreateConversationWithInstanceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;
        if (!clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        }

        // Validaciones básicas
        if (!input.contactId?.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El contacto es requerido"
          });
        }

        // Verificar que el contacto existe y pertenece al cliente
        const contact = await db.contact.findFirst({
          where: {
            id: input.contactId,
            clientId
          }
        });

        if (!contact) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El contacto especificado no existe"
          });
        }

        // VALIDACIÓN: Verificar si ya existe una conversación activa para este contacto en el mismo canal
        const existingActiveConversation = await db.conversation.findFirst({
          where: {
            contactId: input.contactId,
            clientId,
            channel: input.channel ?? 'WHATSAPP',
            status: {
              in: ['ACTIVA', 'PAUSADA'] // Considerar tanto activas como pausadas
            }
          },
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                channel: true
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            },
            evolutionInstance: {
              select: {
                id: true,
                instanceName: true,
                phoneNumber: true,
                status: true
              }
            }
          }
        });

        // Si existe una conversación activa, retornarla en lugar de crear una nueva
        if (existingActiveConversation) {
          return existingActiveConversation;
        }

        // Verificar instancia de Evolution API si se especifica
        const evolutionInstanceId = input.evolutionInstanceId;
        if (evolutionInstanceId) {
          const instance = await db.evolutionApiInstance.findFirst({
            where: { 
              id: evolutionInstanceId,
              evolutionApi: {
                integration: {
                  clientId 
                }
              }
            }
          });

          if (!instance) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "La instancia de Whatsapp especificada no existe o no pertenece a este cliente"
            });
          }
        }

        // Si no se especifica un agente, buscar el agente principal del cliente
        let agentId = input.agentId;
        if (!agentId) {
          const leadAgent = await db.agente.findFirst({
            where: { 
              clientId,
              isLeadAgent: true,
              isActive: true
            }
          });
          
          if (leadAgent) {
            agentId = leadAgent.id;
          }
        } else {
          // Verificar que el agente especificado existe y pertenece al cliente
          const agent = await db.agente.findFirst({
            where: { 
              id: input.agentId!,
              clientId 
            }
          });

          if (!agent) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "El agente especificado no existe"
            });
          }
        }

        // Crear conversación
        const conversation = await db.conversation.create({
          data: { 
            contactId: input.contactId,
            agentId,
            assignedUserId: input.assignedUserId,
            title: input.title ?? `Conversación con ${contact.name}`,
            status: input.status ?? 'ACTIVA',
            type: input.type ?? 'LEAD',
            channel: input.channel ?? 'WHATSAPP',
            evolutionInstanceId, // NUEVO: usar FK a evolutionInstance
            channelInstance: input.channelInstance, // DEPRECATED: mantener por compatibilidad
            clientId,
            lastMessageAt: new Date(),
            metadata: input.metadata ?? undefined
          },
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                channel: true
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            },
            evolutionInstance: {
              select: {
                id: true,
                instanceName: true,
                phoneNumber: true,
                status: true
              }
            }
          }
        });

        // Si hay mensaje inicial, enviarlo vía Evolution API
        if (input.initialMessage?.trim() && evolutionInstanceId && contact.phone) {
          try {
            // Importar el factory de Evolution API
            const { getEvolutionApiServiceFromDB } = await import("@/server/services/evolution-api.factory");

            // Obtener la instancia para enviar el mensaje
            const instance = await db.evolutionApiInstance.findUnique({
              where: { id: evolutionInstanceId },
              select: { id: true, instanceName: true, status: true }
            });

            // Solo enviar si la instancia está conectada
            if (instance && instance.status === "CONNECTED") {
              // 1) Crear el mensaje en la base de datos primero (DB-first)
              const messageRecord = await db.message.create({
                data: {
                  conversationId: conversation.id,
                  content: input.initialMessage,
                  role: "USER",
                  senderType: "USER",
                  messageType: "TEXT",
                  messageStatus: "PENDING",
                  source: "manual",
                  evolutionInstanceId: instance.id,
                  metadata: { source: "initial_message", createdFrom: "conversationCreation", clientId }
                },
                select: { id: true }
              });

              // 2) Enviar el mensaje vía Evolution API
              const svc = await getEvolutionApiServiceFromDB();
              const result = await svc.sendMessage({
                instanceName: instance.instanceName,
                number: contact.phone,
                text: input.initialMessage,
                clientId
              });

              // 3) Actualizar el estado del mensaje según el resultado
              if (result.success) {
                await db.message.update({
                  where: { id: messageRecord.id },
                  data: {
                    whatsappId: result.messageId,
                    messageStatus: "SENT",
                    sentAt: new Date()
                  }
                });
              } else {
                // Si falla el envío, marcar como fallido pero no bloquear la creación de la conversación
                await db.message.update({
                  where: { id: messageRecord.id },
                  data: {
                    messageStatus: "FAILED",
                    metadata: { error: result.error ?? "unknown_error", source: "initial_message" }
                  }
                });
                logger.error(`Failed to send initial message for conversation ${conversation.id}: ${result.error}`);
              }
            } else {
              // Si la instancia no está conectada, crear mensaje como SYSTEM (sin enviar)
              await db.message.create({
                data: {
                  conversationId: conversation.id,
                  content: input.initialMessage,
                  role: "SYSTEM",
                  senderType: "AGENT",
                  senderName: "Sistema",
                  metadata: { note: "Instance not connected, message not sent" }
                }
              });
              logger.warn(`Cannot send initial message for conversation ${conversation.id}: Instance not connected`);
            }
          } catch (error) {
            // Log error but don't block conversation creation
            logger.error(`Error sending initial message for conversation ${conversation.id}:`, error);

            // Create a system message as fallback
            await db.message.create({
              data: {
                conversationId: conversation.id,
                content: input.initialMessage,
                role: "SYSTEM",
                senderType: "AGENT",
                senderName: "Sistema",
                metadata: { note: "Failed to send via Evolution API", error: (error as Error).message }
              }
            });
          }
        }

        return conversation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Ya existe una conversación con los mismos datos."
            });
          }
          if (error.code === "P2003") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Referencia inválida (contacto, agente o instancia no existe)."
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la conversación"
        });
      }
    }),

  update: protectedProcedure
    .input(UpdateConversationSchema.extend({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
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
        const existing = await db.conversation.findFirst({ where: { id, clientId } });
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada para actualizar." });
        }
        interface UpdatePayload {
          contactId?: string
          agentId?: string | null
          metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
          title?: string | null
          status?: string
          type?: string
          channel?: string
          assignedUserId?: string | null
          evolutionInstanceId?: string | null
          channelInstance?: string | null
          lastMessageAt?: Date
          unreadCount?: number
          lastReadAt?: Date | null
          lastReadMessageId?: string | null
        }
        
        // Guardar historial si cambia el status
        if (data.status && existing.status !== data.status) {
          await db.conversationStatusHistory.create({
            data: {
              conversationId: id,
              fromStatus: existing.status,
              toStatus: data.status as ConversationStatus,
              changedById: ctx.session.user.id,
              reason: (data.metadata as Record<string, unknown>)?.statusChangeReason as string | undefined,
            }
          })
        }
        
        const { agentId: maybeAgentId, metadata, ...rest } = data as UpdatePayload
        const updateData: Prisma.ConversationUpdateInput = {
          ...(rest as Prisma.ConversationUpdateInput),
          ...(metadata !== undefined && { metadata }),
          ...(maybeAgentId !== undefined && { agent: maybeAgentId === null ? { disconnect: true } : { connect: { id: maybeAgentId } } })
        }
        return await db.conversation.update({ where: { id }, data: updateData });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Conversación no encontrada para actualizar."
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar la conversación"
        });
      }
    }),

  addMessage: protectedProcedure
    .input(CreateMessageSchema.extend({ clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Usar clientId de la URL solo para validar permisos si NO es AURELIA
      const providedClientId = input.clientId;
      if (providedClientId && ctx.session.user.type !== "AURELIA" && providedClientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }

      try {
        // Buscar la conversación. Si NO es AURELIA, además validar que pertenezca a su cliente
        const conversation = await db.conversation.findFirst({
          where: {
            id: input.conversationId,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId ? { clientId: ctx.session.user.clientId } : {})
          }
        })

        if (!conversation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada para agregar mensaje." });
        }

        // ClientId de la conversación disponible si se requiere para scopes externos

        // Actualizar lastMessageAt de la conversación
        await db.conversation.update({
          where: { id: input.conversationId },
          data: { lastMessageAt: new Date() }
        })

        // Verificar que el usuario existe antes de crear el mensaje
        await verifyUserExists(ctx.session.user.id)
        
        return await db.message.create({
          data: {
            conversationId: input.conversationId,
            content: input.content,
            role: input.role,
            senderId: ctx.session.user.id,
            senderName: ctx.session.user.name,
            metadata: input.metadata ?? undefined
          }
        })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada para agregar mensaje." })
          }
          if (error.code === "P2003") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Referencia inválida (conversación no existe)." })
          }
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al agregar el mensaje" })
      }
    }),

  listMessages: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      // Usar clientId de la URL solo para validar permisos si NO es AURELIA
      const providedClientId = input.clientId
      if (providedClientId && ctx.session.user.type !== "AURELIA" && providedClientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" })
      }

      try {
        // Buscar la conversación. Si NO es AURELIA, además validar que pertenezca a su cliente
        const conversation = await db.conversation.findFirst({
          where: {
            id: input.conversationId,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId ? { clientId: ctx.session.user.clientId } : {})
          },
          select: { id: true }
        })

        if (!conversation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada para obtener mensajes." })
        }

        return await db.message.findMany({
          where: { conversationId: input.conversationId },
          orderBy: { createdAt: "desc" },
          take: 100 // Los 100 mensajes más recientes
        }).then(messages => messages.reverse()) // Invertir para mostrar orden cronológico
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener los mensajes" })
      }
    }),

  openaiMessage: protectedProcedure.input(z.object({
    conversationId: z.string().uuid(),
    content: z.string()
  })).mutation(async ({ input, ctx }) => {
    let clientId = "";
    if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId) {
      clientId = ctx.session.user.clientId;
    }
    // Validar conversación por id y tenant si NO es AURELIA
    const dbtransaction = await db.$transaction(async function (tx) {
      const conversation = await tx.conversation.findFirst({
        where: { id: input.conversationId },
        include: { 
          //messages: { orderBy: { createdAt: "asc" } },
          agent: { include: { template: true } }
        }
      });
      if (!conversation) {
        return {conversation};
      }
      const aiInfo = await AiInfo.get(conversation.clientId, undefined, tx);
      return {
        conversation,
        aiInfo
      };
    });

    const {
      conversation,
      aiInfo
    } = dbtransaction;
    if (!conversation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conversación no encontrada"
      });
    }
    if (!aiInfo) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "AiInfo no encontrado"
      });
    }
    const agent = conversation.agent;
    if (!agent) {
      //AGENT DOES NOT EXIST
      //TODO: crear agente??
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Conversation no tiene Agente asignado"
      });
    }
  
    // Verificar que el usuario existe antes de crear el mensaje
    await verifyUserExists(ctx.session.user.id);

    //TODO
    //Primera interaccion con AI
    const aiPrompt = agent.aiPrompt || "";
    let aiConversationId = "";
    if (!conversation.aiConversationId) {
      const apikey = Encryptor.decrypt(aiInfo.apiKeyValue);
      aiConversationId = await Ai.createConversationId(
        apikey,
        aiPrompt
      );
    } else {
      aiConversationId = conversation.aiConversationId;
    }

    const requestId = randomUUID();
    await Ai.fetch({
      aiApiKey: aiInfo.apiKeyValue,
      aiModel: agent.aiModel as string,
      aiConversationId: aiConversationId,
      agentId: agent.id as string,
      message: input.content,
      from: "conversation",
      conversationId: conversation.id,
      requestId,
      senderId: ctx.session.user.id,
      senderName: ctx.session.user.name,
    }).catch((error: Error) => {
        logger.error(error.message, error);
    });

    await db.$transaction([
      // Guardar el mensaje del usuario
      db.message.create({
        data: {
          conversationId: input.conversationId,
          content: input.content,
          role: "USER",
          senderType: "USER",
          senderId: ctx.session.user.id,
          senderName: ctx.session.user.name,
        }
      }),
      db.conversation.update({
        where: { id: input.conversationId },
        data: { lastMessageAt: new Date() }
      })
    ]);
    return {conversationId: input.conversationId};
  }),

  addMessageFeedback: protectedProcedure
    .input(z.object({ messageId: z.string().uuid(), rating: z.number().int().min(1).max(5), feedback: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;
        if (!clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        }

        // Verificar que el mensaje pertenece a una conversación del cliente
        const message = await db.message.findFirst({
          where: { id: input.messageId },
          include: { conversation: true }
        });

        if (!message || message.conversation.clientId !== clientId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mensaje no encontrado" });
        }

        const updated = await db.message.update({
          where: { id: input.messageId },
          data: { rating: input.rating, feedback: input.feedback },
        });
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el feedback del mensaje"
        });
      }
    }),

  // Endpoints para superadmin
  listByClient: protectedProcedure
    .input(z.object({ 
      clientId: z.string().uuid(),
      filters: z.object({
        status: z.nativeEnum(ConversationStatus).optional(),
        type: z.nativeEnum(ConversationType).optional(),
        channel: z.nativeEnum(ContactChannel).optional(),
        contactId: z.string().uuid().optional(),
        agentId: z.string().uuid().optional(),
        assignedUserId: z.string().uuid().optional(),
        search: z.string().optional(),
      }).optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar que el usuario es superadmin o admin del cliente
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== input.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas conversaciones"
          });
        }

        const filters = input.filters;
        
        const where: Prisma.ConversationWhereInput = {
          clientId: input.clientId,
          ...(filters?.status && { status: filters.status }),
          ...(filters?.type && { type: filters.type }),
          ...(filters?.channel && { channel: filters.channel }),
          ...(filters?.contactId && { contactId: filters.contactId }),
          ...(filters?.agentId && { agentId: filters.agentId }),
          ...(filters?.assignedUserId !== undefined && { assignedUserId: filters.assignedUserId }),
          ...(filters?.search && {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { contact: { name: { contains: filters.search, mode: 'insensitive' } } },
              { contact: { email: { contains: filters.search, mode: 'insensitive' } } },
            ]
          })
        };

        return await db.conversation.findMany({
          where,
          include: { 
            messages: { 
              orderBy: { createdAt: "asc" } 
            }, 
            contact: true, 
            agent: true, 
            assignedUser: true 
          },
          orderBy: { updatedAt: "desc" }
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las conversaciones del cliente"
        });
      }
    }),

  // [REMOVED DUPLICATE] stats (see below consolidated stats endpoint)

  // NUEVO: Obtener instancias de Evolution API del cliente
  getClientInstances: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== input.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a estas instancias"
          });
        }

        const instances = await db.evolutionApiInstance.findMany({
          where: {
            evolutionApi: {
              integration: {
                clientId: input.clientId
              }
            }
          },
          include: {
            _count: {
              select: {
                conversations: {
                  where: { status: 'ACTIVA' }
                }
              }
            }
          },
          orderBy: { instanceName: 'asc' }
        });

        return instances;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener las instancias del cliente"
        });
      }
    }),

  // Asignar o cambiar agente a una conversación
  assignAgent: protectedProcedure
    .input(z.object({ 
      conversationId: z.string().uuid(),
      agentId: z.string().uuid().optional() // Si es undefined, se desasigna el agente
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const clientId = ctx.session.user.clientId;
        
        if (!clientId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuario sin cliente asignado"
          });
        }

        // Verificar que la conversación existe y pertenece al cliente
        const existingConversation = await db.conversation.findFirst({
          where: { 
            id: input.conversationId,
            clientId
          }
        });

        if (!existingConversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversación no encontrada."
          });
        }

        // Si se especifica un agente, verificar que existe y pertenece al cliente
        if (input.agentId) {
          const agent = await db.agente.findFirst({
            where: { 
              id: input.agentId,
              clientId 
            }
          });

          if (!agent) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "El agente especificado no existe o no pertenece a este cliente."
            });
          }
        }

        // Actualizar la conversación con el nuevo agente
        const updatedConversation = await db.conversation.update({
          where: { id: input.conversationId },
          data: { 
            agentId: input.agentId ?? null // Si agentId es undefined, se asigna null
          },
          include: { 
            messages: { 
              orderBy: { createdAt: "asc" } 
            }, 
            contact: true, 
            agent: true, 
            assignedUser: true 
          }
        });

        return updatedConversation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Conversación no encontrada."
            });
          }
          if (error.code === "P2003") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Referencia inválida (agente no existe)."
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al asignar el agente a la conversación"
        });
      }
    }),

  // Marcar conversación como leída
  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Buscar conversación; si el usuario NO es AURELIA, filtrar por su clientId
        const conversation = await db.conversation.findFirst({
          where: {
            id: input.conversationId,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId ? { clientId: ctx.session.user.clientId } : {})
          },
          select: { id: true, clientId: true }
        });

        if (!conversation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada." });
        }

        // Obtener último mensaje para setear lastReadMessageId
        const lastMessage = await db.message.findFirst({
          where: { conversationId: input.conversationId },
          orderBy: { createdAt: "desc" },
          select: { id: true }
        });

        const now = new Date();

        // Transacción: marcar mensajes como READ y resetear contador de no leídos
        await db.$transaction([
          db.message.updateMany({
            where: {
              conversationId: input.conversationId,
              senderType: MessageSenderType.CONTACT,
              readStatus: MessageReadStatus.UNREAD,
            },
            data: {
              readStatus: MessageReadStatus.READ,
              readAt: now,
              readByUserId: ctx.session.user.id,
            }
          }),
          db.conversation.update({
            where: { id: input.conversationId },
            data: {
              unreadCount: 0,
              lastReadAt: now,
              lastReadMessageId: lastMessage?.id ?? null,
            }
          })
        ]);

        // Supabase Realtime notificará automáticamente los cambios en la conversación

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al marcar la conversación como leída" });
      }
    }),

  // Obtener instancias del cliente (detalladas)
  getClientInstancesDetailed: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== input.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a las instancias de este cliente" });
        }
        const instances = await db.evolutionApiInstance.findMany({
          where: {
            evolutionApi: { integration: { clientId: input.clientId, isActive: true } }
          },
          include: {
            evolutionApi: { include: { integration: { select: { id: true, name: true, isActive: true } } } },
            _count: { select: { conversations: true } }
          },
          orderBy: { instanceName: 'asc' }
        })
        return instances.map(instance => ({
          id: instance.id,
          instanceName: instance.instanceName,
          phoneNumber: instance.phoneNumber,
          status: instance.status,
          lastConnected: instance.lastConnected,
          lastMessageAt: instance.lastMessageAt,
          conversationCount: instance._count.conversations,
          integration: instance.evolutionApi.integration
        }))
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener las instancias del cliente" })
      }
    }),

  // Obtener conteos de categorías para filtros
  getCategoryCounts: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== input.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a las estadísticas de este cliente"
          });
        }

        const [total, unassigned, assigned, active, archived] = await Promise.all([
          // Total de conversaciones
          db.conversation.count({
            where: { clientId: input.clientId }
          }),
          // Conversaciones sin asignar
          db.conversation.count({
            where: { 
              clientId: input.clientId,
              assignedUserId: null
            }
          }),
          // Conversaciones asignadas
          db.conversation.count({
            where: { 
              clientId: input.clientId,
              assignedUserId: { not: null }
            }
          }),
          // Conversaciones activas
          db.conversation.count({
            where: { 
              clientId: input.clientId,
              status: "ACTIVA"
            }
          }),
          // Conversaciones archivadas
          db.conversation.count({
            where: { 
              clientId: input.clientId,
              status: "ARCHIVADA"
            }
          })
        ]);

        return {
          total,
          unassigned,
          assigned,
          active,
          archived
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener los conteos de categorías"
        });
      }
    }),

  // Estadísticas del cliente
  stats: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        // Verificar permisos
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== input.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para acceder a las estadísticas de este cliente"
          });
        }

        const [
          totalConversations,
          activeConversations,
          totalMessages,
          totalContacts,
          instancesConnected
        ] = await Promise.all([
          // Total de conversaciones
          db.conversation.count({
            where: { clientId: input.clientId }
          }),
          // Conversaciones activas
          db.conversation.count({
            where: { 
              clientId: input.clientId,
              status: "ACTIVA"
            }
          }),
          // Total de mensajes
          db.message.count({
            where: {
              conversation: {
                clientId: input.clientId
              }
            }
          }),
          // Total de contactos
          db.contact.count({
            where: { clientId: input.clientId }
          }),
          // Instancias conectadas
          db.evolutionApiInstance.count({
            where: {
              evolutionApi: {
                integration: {
                  clientId: input.clientId,
                  isActive: true
                }
              },
              status: "CONNECTED"
            }
          })
        ]);

        return {
          totalConversations,
          activeConversations,
          totalMessages,
          totalContacts,
          instancesConnected,
          averageMessagesPerConversation: totalConversations > 0 ? 
            Math.round(totalMessages / totalConversations) : 0
        };
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

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const clientIdFromCtx = ctx.session.user.clientId
      try {
        let clientScope: Prisma.ConversationWhereInput = {}
        if (ctx.session.user.type !== "AURELIA") {
          if (!clientIdFromCtx) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" })
          }
          clientScope = { clientId: clientIdFromCtx }
        }
        const existingConversation = await db.conversation.findFirst({ 
          where: { 
            id: input.id, 
            ...clientScope
          } 
        });
        if (!existingConversation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada para eliminar." });
        }
        const deleted = await db.conversation.delete({ where: { id: input.id } });
        // Supabase Realtime notificará automáticamente la eliminación de la conversación
        return deleted
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Conversación no encontrada para eliminar."
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar la conversación"
        });
      }
    }),

  // Toggle IA activa/inactiva en una conversación
  toggleAiActive: protectedProcedure
    .input(z.object({ 
      conversationId: z.string().uuid(),
      isActive: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar que la conversación existe y pertenece al cliente del usuario
        const conversation = await db.conversation.findFirst({
          where: {
            id: input.conversationId,
            ...(ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId ? { 
              clientId: ctx.session.user.clientId 
            } : {})
          }
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversación no encontrada"
          });
        }

        // Actualizar el estado de IA
        const updatedConversation = await db.conversation.update({
          where: { id: input.conversationId },
          data: { isAiActive: input.isActive },
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                channel: true,
                stage: {
                  select: { id: true, name: true, color: true }
                },
                pipeline: {
                  select: { id: true, name: true }
                }
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            },
            assignedUser: {
              select: {
                id: true,
                name: true
              }
            },
            evolutionInstance: {
              select: {
                id: true,
                instanceName: true,
                phoneNumber: true,
                status: true
              }
            }
          }
        });

        return updatedConversation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el estado de IA de la conversación"
        });
      }
    }),

  // NOTA: Los endpoints createWhatsAppConversation, sendWhatsAppMessage y getWhatsAppConversations
  // han sido consolidados en el endpoint principal 'create' y 'list' con soporte para instancias.
  // Mantenemos compatibilidad hacia atrás usando el endpoint unificado.
});
