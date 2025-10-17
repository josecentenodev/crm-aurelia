import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { db } from "../../db"
import { TRPCError } from "@trpc/server"
import { getEvolutionApiServiceFromDB } from "@/server/services/evolution-api.factory"

export const messagesRouter = createTRPCRouter({
  /*
  sendAiResponse: protectedProcedure.input(z.object({
    clientId: z.string().uuid(),
    conversationId: z.string().uuid(),
    messages: z.array(z.string()),
  })).mutation(async ({input}) => {
    try {
      const conversation = db.conversation.findFirst({
        where: {id: input.conversationId},
        include: {
            contact: true,
            evolutionInstance: true
        }
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation no encontrada"
        })
      }
      const instance = conversation.evolutionInstance;
      const contact = conversation.contact;
      if (instance != null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instancia no encontrada"
        })
      }
      if (contact != null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contacto no encontrado"
        })
      }
      if (instance.status !== "CONNECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La instancia debe estar conectada para enviar mensajes"
        })
      }

      // Enviar mensaje usando factory (config global consistente)
      const svc = await getEvolutionApiServiceFromDB()
      const result = await svc.sendTextMessages({
        instanceName: instance.instanceName,
        number: contact.phone,
        messages: input.messages,
        clientId: input.clientId
      })

      // Importante: no creamos el mensaje aquí para evitar duplicados.
      // El webhook de Evolution (fromMe) insertará el mensaje con whatsappId.

      return { success: result.success}

    } catch(err) {
      console.error("Error sending text message:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al enviar mensaje"
      })
    }
  }),
  */
  // Enviar mensaje de texto (DB-first)
  sendText: protectedProcedure.input(z.object({
    instanceId: z.string().uuid(),
    to: z.string(),
    message: z.string(),
    clientId: z.string().uuid(),
    conversationId: z.string().uuid().optional(),
    messageId: z.string().uuid().optional()
  })).mutation(async ({ input, ctx }) => {
    try {
      // Verificar permisos
      if (ctx.session.user.type === "CUSTOMER") {
        const userClient = await db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { clientId: true }
        })

        if (userClient?.clientId !== input.clientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para enviar mensajes en este cliente"
          })
        }
      }

      // Obtener la instancia
      const instance = await db.evolutionApiInstance.findUnique({
        where: { id: input.instanceId },
        include: {
          evolutionApi: {
            include: {
              integration: true
            }
          }
        }
      })

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instancia no encontrada"
        })
      }

      if (instance.status !== "CONNECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La instancia debe estar conectada para enviar mensajes"
        })
      }

      // Resolver conversación destino si no fue provista
      let conversationId = input.conversationId
      if (!conversationId) {
        const conv = await db.conversation.findFirst({
          where: {
            clientId: input.clientId,
            evolutionInstanceId: instance.id,
            contact: { phone: input.to }
          },
          select: { id: true }
        })
        if (!conv) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversación destino no encontrada" })
        }
        conversationId = conv.id
      }

      // 1) DB-first: crear registro con estado inicial PENDING
      const created = await db.message.create({
        data: {
          ...(input.messageId ? { id: input.messageId } : {}),
          conversationId,
          content: input.message,
          role: 'USER',
          senderType: 'USER',
          messageType: 'TEXT',
          messageStatus: 'PENDING',
          source: 'manual',
          evolutionInstanceId: instance.id,
          metadata: { source: 'manual', createdFrom: 'sendText', clientId: input.clientId }
        },
        select: { id: true }
      })

      // 2) Enviar a Evolution API
      const svc = await getEvolutionApiServiceFromDB()
      const result = await svc.sendMessage({
        instanceName: instance.instanceName,
        number: input.to,
        text: input.message,
        clientId: input.clientId
      })

      // 3) Actualizar mensaje con whatsappId/estado según resultado
      if (result.success) {
        await db.message.update({
          where: { id: created.id },
          data: {
            whatsappId: result.messageId,
            messageStatus: 'SENT',
            sentAt: new Date()
          }
        })
        return { success: true, id: created.id, whatsappId: result.messageId }
      }

      // Fallo Evolution API
      await db.message.update({
        where: { id: created.id },
        data: {
          messageStatus: 'FAILED',
          metadata: { error: result.error ?? 'unknown_error' }
        }
      })
      throw new TRPCError({ code: "BAD_REQUEST", message: result.error || "Error al enviar mensaje" })
      } catch (error) {
        console.error("Error sending text message:", error)
        
        // Si es un error de Evolution API con código específico
        if (error instanceof Error && error.message.includes("503")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "El número de teléfono no es válido para WhatsApp. Verifica que el número esté en formato correcto (sin +)"
          })
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al enviar mensaje"
        })
      }
    }),

  // Enviar mensaje de imagen (DB-first)
  sendImage: protectedProcedure
  .input(z.object({
    instanceId: z.string().uuid(),
    to: z.string(),
    imageUrl: z.string().url(),
    caption: z.string().optional(),
    clientId: z.string().uuid(),
    conversationId: z.string().uuid().optional(),
    messageId: z.string().uuid().optional()
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Verificar permisos
      if (ctx.session.user.type === "CUSTOMER") {
        const userClient = await db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { clientId: true }
        })

        if (userClient?.clientId !== input.clientId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "No tienes permisos para enviar mensajes en este cliente"
            })
          }
        }

        // Obtener la instancia
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: input.instanceId }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        if (instance.status !== "CONNECTED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La instancia debe estar conectada para enviar mensajes"
          })
        }

        // Resolver conversación destino si no fue provista
        let conversationId = input.conversationId
        if (!conversationId) {
          const conv = await db.conversation.findFirst({
            where: { clientId: input.clientId, evolutionInstanceId: instance.id, contact: { phone: input.to } },
            select: { id: true }
          })
          if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversación destino no encontrada' })
          conversationId = conv.id
        }

        // 1) Crear registro DB PENDING
        const created = await db.message.create({
          data: {
            ...(input.messageId ? { id: input.messageId } : {}),
            conversationId,
            content: input.caption || '📷 Imagen',
            role: 'USER',
            senderType: 'USER',
            messageType: 'IMAGE',
            messageStatus: 'PENDING',
            source: 'manual',
            evolutionInstanceId: instance.id,
            mediaUrl: input.imageUrl,
            caption: input.caption || undefined,
            metadata: { source: 'manual', createdFrom: 'sendImage', clientId: input.clientId }
          },
          select: { id: true }
        })

        // 2) Enviar a Evolution API
        const svc = await getEvolutionApiServiceFromDB()
        const result = await svc.sendMessage({
          instanceName: instance.instanceName,
          number: input.to,
          text: input.caption || '',
          mediaUrl: input.imageUrl,
          clientId: input.clientId
        })

        // 3) Actualizar registro
        if (result.success) {
          await db.message.update({ where: { id: created.id }, data: { whatsappId: result.messageId, messageStatus: 'SENT', sentAt: new Date() } })
          return { success: true, id: created.id, whatsappId: result.messageId }
        }
        await db.message.update({ where: { id: created.id }, data: { messageStatus: 'FAILED', metadata: { error: result.error ?? 'unknown_error' } } })
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'Error al enviar imagen' })
      } catch (error) {
        console.error("Error sending image message:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al enviar imagen"
        })
      }
    }),

  // Enviar documento (DB-first)
  sendDocument: protectedProcedure
    .input(z.object({
      instanceId: z.string().uuid(),
      to: z.string(),
      documentUrl: z.string().url(),
      filename: z.string(),
      caption: z.string().optional(),
      clientId: z.string().uuid(),
      conversationId: z.string().uuid().optional(),
      messageId: z.string().uuid().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verificar permisos
        if (ctx.session.user.type === "CUSTOMER") {
          const userClient = await db.user.findUnique({
            where: { id: ctx.session.user.id },
            select: { clientId: true }
          })

          if (userClient?.clientId !== input.clientId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "No tienes permisos para enviar mensajes en este cliente"
            })
          }
        }

        // Obtener la instancia
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: input.instanceId }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        if (instance.status !== "CONNECTED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La instancia debe estar conectada para enviar mensajes"
          })
        }

        // Resolver conversación
        let conversationId = input.conversationId
        if (!conversationId) {
          const conv = await db.conversation.findFirst({
            where: { clientId: input.clientId, evolutionInstanceId: instance.id, contact: { phone: input.to } },
            select: { id: true }
          })
          if (!conv) throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversación destino no encontrada' })
          conversationId = conv.id
        }

        // 1) DB-first create
        const created = await db.message.create({
          data: {
            ...(input.messageId ? { id: input.messageId } : {}),
            conversationId,
            content: input.caption || `📄 ${input.filename}`,
            role: 'USER',
            senderType: 'USER',
            messageType: 'DOCUMENT',
            messageStatus: 'PENDING',
            source: 'manual',
            evolutionInstanceId: instance.id,
            mediaUrl: input.documentUrl,
            mediaFileName: input.filename,
            caption: input.caption || undefined,
            metadata: { source: 'manual', createdFrom: 'sendDocument', clientId: input.clientId }
          },
          select: { id: true }
        })

        // 2) Enviar
        const svc = await getEvolutionApiServiceFromDB()
        const result = await svc.sendMessage({
          instanceName: instance.instanceName,
          number: input.to,
          text: input.caption || '',
          mediaUrl: input.documentUrl,
          fileName: input.filename,
          clientId: input.clientId
        })

        // 3) Actualizar estado
        if (result.success) {
          await db.message.update({ where: { id: created.id }, data: { whatsappId: result.messageId, messageStatus: 'SENT', sentAt: new Date() } })
          return { success: true, id: created.id, whatsappId: result.messageId }
        }
        await db.message.update({ where: { id: created.id }, data: { messageStatus: 'FAILED', metadata: { error: result.error ?? 'unknown_error' } } })
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error al enviar documento' })
      } catch (error) {
        console.error("Error sending document:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al enviar documento"
        })
      }
    }),

  // Obtener historial de mensajes
  getMessageHistory: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }) => {
      try {
        const messages = await db.message.findMany({
          where: { conversationId: input.conversationId },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset
        })

        const total = await db.message.count({
          where: { conversationId: input.conversationId }
        })

        return {
          messages: messages.reverse(),
          total,
          hasMore: input.offset + input.limit < total
        }
      } catch (error) {
        console.error("Error getting message history:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener historial de mensajes"
        })
      }
    }),

  // Obtener estado de un mensaje
  getMessageStatus: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      instanceId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      try {
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: input.instanceId }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        // TODO: Implementar getMessageStatus en EvolutionAPIService
        // const result = await evolutionAPIService.getMessageStatus({
        //   instanceName: instance.instanceName,
        //   messageId: input.messageId
        // })

        // Por ahora retornamos un estado mock
        return {
          success: true,
          status: "sent",
          messageId: input.messageId
        }
      } catch (error) {
        console.error("Error getting message status:", error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener estado del mensaje"
        })
      }
    }),

  // Reintentar envío de un mensaje existente (DB-first)
  retry: protectedProcedure
    .input(z.object({ messageId: z.string().uuid(), clientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Permisos
        if (ctx.session.user.type === 'CUSTOMER') {
          const userClient = await db.user.findUnique({ where: { id: ctx.session.user.id }, select: { clientId: true } })
          if (userClient?.clientId !== input.clientId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Sin permisos' })
        }

        const message = await db.message.findUnique({
          where: { id: input.messageId },
          include: { conversation: { select: { clientId: true, contact: { select: { phone: true } }, evolutionInstanceId: true } } }
        })
        if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Mensaje no encontrado' })
        if (message.conversation.clientId !== input.clientId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Sin permisos' })

        const instanceId = message.conversation.evolutionInstanceId
        if (!instanceId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Instancia no asociada' })
        const instance = await db.evolutionApiInstance.findUnique({ where: { id: instanceId } })
        if (!instance) throw new TRPCError({ code: 'NOT_FOUND', message: 'Instancia no encontrada' })
        if (instance.status !== 'CONNECTED') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Instancia desconectada' })

        // Poner en PENDING
        await db.message.update({ where: { id: message.id }, data: { messageStatus: 'PENDING', updatedAt: new Date() } })

        const svc = await getEvolutionApiServiceFromDB()
        const number = message.conversation.contact?.phone ?? ''
        const result = await svc.sendMessage({
          instanceName: instance.instanceName,
          number,
          text: message.content ?? '',
          mediaUrl: message.mediaUrl ?? undefined,
          fileName: message.mediaFileName ?? undefined,
          clientId: input.clientId
        })

        if (result.success) {
          await db.message.update({
            where: { id: message.id },
            data: { whatsappId: result.messageId ?? message.whatsappId ?? undefined, messageStatus: 'SENT', sentAt: new Date() }
          })
          return { success: true, id: message.id, whatsappId: result.messageId }
        }
        await db.message.update({ where: { id: message.id }, data: { messageStatus: 'FAILED', updatedAt: new Date(), metadata: { ...(message.metadata as any), retryError: result.error ?? 'unknown_error' } } })
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.error || 'Error al reenviar' })
      } catch (error) {
        throw error instanceof TRPCError ? error : new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error al reintentar' })
      }
    }),

  // Eliminar mensaje (solo si corresponde)
  delete: protectedProcedure
    .input(z.object({ messageId: z.string().uuid(), clientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.session.user.type === 'CUSTOMER') {
          const userClient = await db.user.findUnique({ where: { id: ctx.session.user.id }, select: { clientId: true } })
          if (userClient?.clientId !== input.clientId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Sin permisos' })
        }
        const message = await db.message.findUnique({
          where: { id: input.messageId },
          include: { conversation: { select: { clientId: true } } }
        })
        if (!message) throw new TRPCError({ code: 'NOT_FOUND', message: 'Mensaje no encontrado' })
        if (message.conversation.clientId !== input.clientId) throw new TRPCError({ code: 'FORBIDDEN', message: 'Sin permisos' })
        await db.message.delete({ where: { id: input.messageId } })
        return { success: true }
      } catch (error) {
        throw error instanceof TRPCError ? error : new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error al eliminar' })
      }
    })
}) 
