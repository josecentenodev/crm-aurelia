import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { TRPCError } from "@trpc/server"

export const pipelinesRouter = createTRPCRouter({
  listByClient: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const { clientId } = input
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        return await db.pipeline.findMany({
          where: { clientId },
          include: { stages: { orderBy: { order: "asc" } } },
          orderBy: { createdAt: "asc" },
        })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al listar pipelines" })
      }
    }),

  // Datos para tablero Kanban (oportunidades agrupadas por etapa)
  boardData: protectedProcedure
    .input(z.object({ clientId: z.string().uuid(), pipelineId: z.string().uuid().optional(), assignedUserId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const { clientId, pipelineId, assignedUserId } = input
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }
      const pipelines = await db.pipeline.findMany({
        where: { clientId, ...(pipelineId && { id: pipelineId }) },
        include: { stages: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'asc' }
      })
      const stageIds = pipelines.flatMap(p => p.stages.map(s => s.id))
      const opportunities = await db.opportunity.findMany({
        where: {
          clientId,
          OR: [
            ...(stageIds.length > 0 ? [{ stageId: { in: stageIds } }] : []),
            { stageId: null },
          ],
          ...(assignedUserId ? { assignedUserId } : {}),
        },
        include: {
          stage: { select: { id: true, name: true, color: true, pipelineId: true } },
          pipeline: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true, phone: true, email: true, clientId: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
      })
      // Agrupar por etapa
      const grouped: Record<string, typeof opportunities> = {}
      for (const sId of stageIds) grouped[sId] = []
      grouped['unassigned'] = []
      for (const opp of opportunities) {
        const key = opp.stageId ?? 'unassigned'
        if (!grouped[key]) grouped[key] = []
        grouped[key]!.push(opp)
      }
      return { pipelines, grouped }
    }),

  // Conteo de oportunidades por etapa
  opportunityStageCounts: protectedProcedure
    .input(z.object({ clientId: z.string().uuid(), pipelineId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const { clientId, pipelineId } = input
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }
      const stages = await db.pipelineStage.findMany({ where: { pipeline: { clientId, ...(pipelineId && { id: pipelineId }) } } })
      const counts = await db.opportunity.groupBy({ by: ['stageId'], where: { clientId, ...(pipelineId ? { pipelineId } : {}) }, _count: { stageId: true } })
      const map = new Map(counts.map(c => [c.stageId ?? 'unassigned', c._count.stageId]))
      const result = stages.map(s => ({ stageId: s.id, count: map.get(s.id) ?? 0 }))
      // Unassigned count
      const unassignedCount = await db.opportunity.count({ where: { clientId, stageId: null, ...(pipelineId ? { pipelineId } : {}) } })
      return [...result, { stageId: 'unassigned' as unknown as string, count: unassignedCount }]
    }),

  // Totales de montos por etapa
  opportunityStageTotals: protectedProcedure
    .input(z.object({ clientId: z.string().uuid(), pipelineId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const { clientId, pipelineId } = input
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }
      const stages = await db.pipelineStage.findMany({ where: { pipeline: { clientId, ...(pipelineId && { id: pipelineId }) } } })
      const totals = await db.opportunity.groupBy({ 
        by: ['stageId'], 
        where: { 
          clientId, 
          ...(pipelineId ? { pipelineId } : {}),
          amount: { not: null }
        }, 
        _sum: { amount: true } 
      })
      const map = new Map(totals.map(t => [t.stageId ?? 'unassigned', t._sum.amount]))
      const result = stages.map(s => ({ stageId: s.id, total: map.get(s.id) ?? 0 }))
      // Unassigned total
      const unassignedTotal = await db.opportunity.aggregate({ 
        where: { 
          clientId, 
          stageId: null, 
          ...(pipelineId ? { pipelineId } : {}),
          amount: { not: null }
        }, 
        _sum: { amount: true } 
      })
      return [...result, { stageId: 'unassigned' as unknown as string, total: unassignedTotal._sum.amount ?? 0 }]
    }),

  create: protectedProcedure
    .input(z.object({ clientId: z.string().uuid(), name: z.string().min(1), description: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { clientId, name, description, isDefault } = input
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        if (isDefault) {
          await db.pipeline.updateMany({ where: { clientId }, data: { isDefault: false } })
        }
        return await db.pipeline.create({ data: { clientId, name: name.trim(), description: description?.trim(), isDefault: !!isDefault } })
      } catch (error: any) {
        if (error instanceof TRPCError) throw error
        if (error?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Ya existe un pipeline con ese nombre" })
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el pipeline" })
      }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid(), name: z.string().min(1).optional(), description: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, clientId, isDefault, ...data } = input
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        if (isDefault) {
          await db.pipeline.updateMany({ where: { clientId }, data: { isDefault: false } })
        }
        return await db.pipeline.update({ where: { id }, data: { name: data.name?.trim(), description: data.description?.trim(), isDefault } })
      } catch (error: any) {
        if (error instanceof TRPCError) throw error
        if (error?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Ya existe un pipeline con ese nombre" })
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el pipeline" })
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, clientId } = input
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        const [hasContacts, hasOpportunities] = await Promise.all([
          db.contact.count({ where: { pipelineId: id, clientId } }),
          db.opportunity.count({ where: { pipelineId: id, clientId } }),
        ])
        if (hasContacts > 0 || hasOpportunities > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No se puede eliminar un pipeline con contactos u oportunidades asignados" })
        }
        return await db.pipeline.delete({ where: { id } })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el pipeline" })
      }
    }),

  // Stages
  createStage: protectedProcedure
    .input(z.object({ pipelineId: z.string().uuid(), name: z.string().min(1), color: z.string().optional(), slaMinutes: z.number().int().positive().optional(), isWon: z.boolean().optional(), isLost: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { pipelineId, name, color, slaMinutes, isWon, isLost } = input
        const pipeline = await db.pipeline.findUnique({ where: { id: pipelineId } })
        if (!pipeline) throw new TRPCError({ code: "NOT_FOUND", message: "Pipeline no encontrado" })
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== pipeline.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        if (isWon && isLost) throw new TRPCError({ code: "BAD_REQUEST", message: "Una etapa no puede ser ganada y perdida a la vez" })
        const maxOrder = await db.pipelineStage.aggregate({ where: { pipelineId }, _max: { order: true } })
        const nextOrder = (maxOrder._max.order ?? 0) + 1
        return await db.pipelineStage.create({ data: { pipelineId, name: name.trim(), color, slaMinutes, isWon: !!isWon, isLost: !!isLost, order: nextOrder } })
      } catch (error: any) {
        if (error instanceof TRPCError) throw error
        if (error?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Ya existe una etapa con ese nombre en este pipeline" })
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear la etapa" })
      }
    }),

  updateStage: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().min(1).optional(), color: z.string().optional(), slaMinutes: z.number().int().positive().optional(), isWon: z.boolean().optional(), isLost: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existing = await db.pipelineStage.findUnique({ where: { id: input.id }, include: { pipeline: true } })
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Etapa no encontrada" })
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== existing.pipeline.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        if (input.isWon && input.isLost) throw new TRPCError({ code: "BAD_REQUEST", message: "Una etapa no puede ser ganada y perdida a la vez" })
        return await db.pipelineStage.update({
          where: { id: input.id },
          data: {
            name: input.name?.trim(),
            color: input.color,
            slaMinutes: input.slaMinutes,
            isWon: input.isWon,
            isLost: input.isLost,
          },
        })
      } catch (error: any) {
        if (error instanceof TRPCError) throw error
        if (error?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Ya existe una etapa con ese nombre en este pipeline" })
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar la etapa" })
      }
    }),

  reorderStages: protectedProcedure
    .input(z.object({ pipelineId: z.string().uuid(), order: z.array(z.object({ id: z.string().uuid(), order: z.number().int().nonnegative() })) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { pipelineId, order } = input
        const pipeline = await db.pipeline.findUnique({ where: { id: pipelineId } })
        if (!pipeline) throw new TRPCError({ code: "NOT_FOUND", message: "Pipeline no encontrado" })
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== pipeline.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        const stages = await db.pipelineStage.findMany({ where: { pipelineId }, select: { id: true } })
        const stageIds = new Set(stages.map(s => s.id))
        // validar que todos los ids pertenezcan al pipeline y que los tamaños coincidan
        if (order.length !== stages.length || order.some(({ id }) => !stageIds.has(id))) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Orden inválido para las etapas del pipeline" })
        }
        await db.$transaction(order.map(s => db.pipelineStage.update({ where: { id: s.id }, data: { order: s.order } })))
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al reordenar las etapas" })
      }
    }),

  deleteStage: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const stage = await db.pipelineStage.findUnique({ where: { id: input.id }, include: { pipeline: true } })
        if (!stage) throw new TRPCError({ code: "NOT_FOUND", message: "Etapa no encontrada" })
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== stage.pipeline.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        const [contactCount, opportunityCount] = await Promise.all([
          db.contact.count({ where: { stageId: input.id } }),
          db.opportunity.count({ where: { stageId: input.id } }),
        ])
        if (contactCount > 0 || opportunityCount > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No se puede eliminar una etapa con contactos u oportunidades asignadas" })
        }
        return await db.pipelineStage.delete({ where: { id: input.id } })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar la etapa" })
      }
    }),

  // Contacts ops
  assignPipeline: protectedProcedure
    .input(z.object({ contactId: z.string().uuid(), pipelineId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const contact = await db.contact.findUnique({ where: { id: input.contactId } })
        if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado" })
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== contact.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        const pipeline = await db.pipeline.findUnique({ where: { id: input.pipelineId } })
        if (!pipeline || pipeline.clientId !== contact.clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Pipeline inválido para el contacto" })
        }
        return await db.contact.update({ where: { id: input.contactId }, data: { pipelineId: input.pipelineId } })
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al asignar el pipeline al contacto" })
      }
    }),

  moveToStage: protectedProcedure
    .input(z.object({ contactId: z.string().uuid(), toStageId: z.string().uuid(), reason: z.string().optional() }))
    // DEPRECATION NOTICE: mantener para compatibilidad; preferir oportunidades.moveToStage
    .mutation(async ({ input, ctx }) => {
      try {
        const contact = await db.contact.findUnique({ where: { id: input.contactId } })
        if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado" })
        const toStage = await db.pipelineStage.findUnique({ where: { id: input.toStageId }, include: { pipeline: true } })
        if (!toStage) throw new TRPCError({ code: "NOT_FOUND", message: "Etapa destino no encontrada" })
        if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== contact.clientId) {
          throw new TRPCError({ code: "FORBIDDEN" })
        }
        if (toStage.pipeline.clientId !== contact.clientId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "La etapa destino pertenece a otro cliente" })
        }
        const history = await db.contactStageHistory.create({
          data: {
            contactId: contact.id,
            fromStageId: contact.stageId,
            toStageId: input.toStageId,
            changedById: ctx.session.user.id,
            reason: input.reason,
          }
        })
        await db.contact.update({ where: { id: contact.id }, data: { stageId: input.toStageId, pipelineId: toStage.pipelineId } })
        return { success: true, historyId: history.id }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al mover el contacto de etapa" })
      }
    }),
})


