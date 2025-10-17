import { z } from "zod";
import { randomUUID } from "crypto";

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";


import { Ai } from "@/lib/ai";
import { AiInfo } from "@/lib/openai";
import { Encryptor } from "@/lib/encryptor/functions";
import { logger } from "@/lib/utils/server-logger";

// Tipos para las consultas de Prisma
interface WhereClause {
  agentId?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

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

export const playgroundRouter = createTRPCRouter({
  startPlaygroundSession: protectedProcedure.input(z.object({ 
    agentId: z.string().uuid()
  })).mutation(async ({ input, ctx }) => {
    const result = await db.$transaction(async function (tx) {
      const agent = await tx.agente.findUnique({
        where: { id: input.agentId },
        include: { template: true }
      });
      if (!agent) {
        return {agent}
      }
      const aiInfo = await AiInfo.get(agent.clientId, undefined, tx);
      return {
        agent,
        aiInfo
      }
    });
    const { 
      agent,
      aiInfo
    } = result;

    if (!agent) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Agente no encontrado" 
      });
    }
    if (!aiInfo) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "AiInfo no encontrado" 
      });
    }
    // Validar permisos
    if (ctx.session.user.type !== "AURELIA" && agent.clientId !== ctx.session.user.clientId) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "No tienes permisos para este agente" 
      });
    }
    if (!agent.isActive) {
      throw new TRPCError({ 
        code: "BAD_REQUEST", 
        message: "El agente no está activo" 
      });
    }


    // Verificar que el usuario existe antes de asignarlo
    await verifyUserExists(ctx.session.user.id);

    const prompt = agent.aiPrompt || "";
    const apikey = Encryptor.decrypt(aiInfo.apiKeyValue);

    const aiConversationId = await Ai.createConversationId(
      apikey,
      prompt
    );

    // Crear sesión de playground
    const session = await db.playgroundSession.create({
      data: {
        agentId: agent.id,
        clientId: agent.clientId,
        userId: ctx.session.user.id,
        status: "ACTIVE",
        aiConversationId
      }
    });

    return {
      sessionId: session.id, 
      agent: {
        id: agent.id,
        name: agent.name,
        template: agent.template
      }
    };
  }),

  askPlayground: protectedProcedure.input(z.object({
    sessionId: z.string().uuid(),
    message: z.object({
      id: z.string().uuid(),
      content: z.string().min(1, "El mensaje no puede estar vacío")
    })
  })).mutation(async ({ input, ctx }) => {
    // Obtener sesión con mensajes y agente
    const session = await db.playgroundSession.findFirst({
      where: {
        id: input.sessionId,
        status: "ACTIVE"
      },
      include: { agent: true }
    });
    if (!session) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Sesión de playground no encontrada o inactiva" 
      });
    }
    if (!session.agent) {
      throw new TRPCError({ 
        code: "BAD_REQUEST", 
        message: "La sesión no tiene un agente asignado" 
      });
    }
    // Validar permisos
    if (ctx.session.user.type !== "AURELIA" && session.agent.clientId !== ctx.session.user.clientId) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "No tienes permisos para este agente" 
      });
    }
    // Verificar que el usuario existe antes de crear el mensaje
    await verifyUserExists(ctx.session.user.id);

    const aiInfo = await AiInfo.get(session.clientId);
    if (!aiInfo) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "AiInfo no encontrado" 
      });
    }

    const requestId = randomUUID();

    Ai.fetch({
      aiApiKey: aiInfo.apiKeyValue,
      aiModel: session.agent.aiModel as string,
      aiConversationId: session.aiConversationId as string,
      agentId: session.agent.id,
      agentName: session.agent.name,
      message: input.message.content,
      from: "playground",
      playgroundSessionId: session.id,
      requestId,
    }).catch((error: Error) => {
        logger.error(error.message, error);
    }) ;

    await db.$transaction([
      db.playgroundMessage.create({
        data: {
          id: input.message.id,
          sessionId: input.sessionId,
          content: input.message.content,
          role: "USER",
          senderType: "USER",
          senderId: ctx.session.user.id,
          senderName: ctx.session.user.name
        }
      }),
      db.playgroundSession.update({
        where: { id: input.sessionId },
        data: { lastMessageAt: new Date() }
      })
    ]);
    return {sessionId: input.sessionId, requestId};
  }),

  listPlaygroundSessions: protectedProcedure.input(z.object({ 
    agentId: z.string().uuid().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0)
  })).query(async ({ input, ctx }) => {
    const whereClause: WhereClause = {};
    if (input.agentId) {
      whereClause.agentId = input.agentId;
    }
    const sessions = await db.playgroundSession.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: input.limit,
      skip: input.offset,
      include: {
        agent: { select: { id: true, name: true, clientId: true } },
        user: { select: { id: true, name: true } },
        _count: { select: { messages: true } }
      }
    });

    // Validar permisos: solo mostrar sesiones del cliente del usuario (excepto AURELIA)
    const filtered = (
      ctx.session.user.type === "AURELIA" ? sessions
        : sessions.filter(session => session.agent?.clientId === ctx.session.user.clientId)
    );
    const total = filtered.length;
    return {
      sessions: filtered,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
        hasMore: input.offset + input.limit < total
      }
    };
  }),

  getPlaygroundMessages: protectedProcedure.input(z.object({
    sessionId: z.string().uuid()
  })).query(async ({ input, ctx }) => {
    // Obtener sesión y agente
    const session = await db.playgroundSession.findFirst({
      where: { id: input.sessionId },
      include: { agent: true }
    });
    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sesión de playground no encontrada" 
      });
    }
    // Validar permisos
    if (ctx.session.user.type !== "AURELIA" && session.agent?.clientId !== ctx.session.user.clientId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permisos para este agente"
      });
    }
    const messages = await db.playgroundMessage.findMany({
      where: { sessionId: input.sessionId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        role: true,
        senderType: true,
        senderName: true,
        createdAt: true,
        rating: true,
        feedback: true
      }
    });
    return messages;
  }),

  deletePlaygroundSession: protectedProcedure
  .input(z.object({ 
    sessionId: z.string().uuid()
  }))
  .mutation(async ({ input, ctx }) => {
    // Obtener sesión y agente
    const session = await db.playgroundSession.findFirst({
      where: { id: input.sessionId },
      include: { agent: true }
    });
    if (!session) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Sesión de playground no encontrada" 
      });
    }
    // Validar permisos
    if (ctx.session.user.type !== "AURELIA" && session.agent?.clientId !== ctx.session.user.clientId) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "No tienes permisos para este agente" 
      });
    }
    // Eliminar mensajes primero (cascade)
    await db.playgroundMessage.deleteMany({ where: { sessionId: input.sessionId } });
    // Eliminar sesión
    await db.playgroundSession.delete({ where: { id: input.sessionId } });
    return { success: true };
  }),

  // Endpoints para superadmin (pueden quedarse igual o eliminar clientId si lo tenían)
  listAllPlaygroundSessions: protectedProcedure.input(z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    agentId: z.string().uuid().optional()
  })).query(async ({ input, ctx }) => {
    if (ctx.session.user.type !== "AURELIA") {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Solo superadmins pueden acceder a este endpoint" 
      });
    }
    const whereClause: WhereClause = {};
    if (input.agentId) {
      whereClause.agentId = input.agentId;
    }
    const sessions = await db.playgroundSession.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: input.limit,
      skip: input.offset,
      include: {
        client: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true, clientId: true } },
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { messages: true } }
      }
    });
    const total = await db.playgroundSession.count({ where: whereClause });
    return {
      sessions,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
        hasMore: input.offset + input.limit < total
      }
    };
  }),

  getPlaygroundStats: protectedProcedure.input(z.object({
    dateFrom: z.date().optional(),
    dateTo: z.date().optional()
  })).query(async ({ input, ctx }) => {
    if (ctx.session.user.type !== "AURELIA") {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Solo superadmins pueden acceder a este endpoint" 
      });
    }
    const whereClause: WhereClause = {};
    if (input.dateFrom || input.dateTo) {
      whereClause.createdAt = {};
      if (input.dateFrom) {
        whereClause.createdAt.gte = input.dateFrom;
      }
      if (input.dateTo) {
        whereClause.createdAt.lte = input.dateTo;
      }
    }
    const totalSessions = await db.playgroundSession.count({ where: whereClause });
    // Obtener sesiones para calcular mensajes
    const sessions = await db.playgroundSession.findMany({ where: whereClause, select: { id: true } });
    const sessionIds = sessions.map(s => s.id);
    const totalMessages = await db.playgroundMessage.count({ where: { sessionId: { in: sessionIds } } });
    // Calcular promedio de mensajes por sesión
    const avgMessagesPerSession = totalSessions > 0 
      ? totalMessages / totalSessions 
      : 0;
    return {
      totalSessions,
      totalMessages,
      avgMessagesPerSession: Math.round(avgMessagesPerSession * 100) / 100
    };
  })
}); 
