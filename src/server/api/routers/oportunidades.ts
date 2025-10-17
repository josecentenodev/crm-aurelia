import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { TRPCError } from "@trpc/server"
import { CreateOpportunitySchema, UpdateOpportunitySchema, MoveOpportunityToStageSchema, OpportunityStatusSchema, OpportunityFiltersSchema } from "@/domain/Oportunidades"

export const oportunidadesRouter = createTRPCRouter({
  listByClient: protectedProcedure
    .input(OpportunityFiltersSchema)
    .query(async ({ input, ctx }) => {
      const { clientId, contactId, assignedUserId, status, pipelineId, stageId, search } = input
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) throw new TRPCError({ code: "FORBIDDEN" })
      return db.opportunity.findMany({
        where: {
          clientId,
          ...(contactId && { contactId }),
          ...(status && { status }),
          ...(assignedUserId && { assignedUserId }),
          ...(pipelineId && { pipelineId }),
          ...(stageId && { stageId }),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { source: { contains: search, mode: 'insensitive' } },
            ]
          })
        },
        include: {
          stage: { select: { id: true, name: true, color: true, pipelineId: true } },
          pipeline: { select: { id: true, name: true } },
          contact: { select: { id: true, name: true, phone: true, email: true, clientId: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    }),

  listByContact: protectedProcedure
    .input(z.object({ contactId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const contact = await db.contact.findUnique({ where: { id: input.contactId } })
      if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "Contacto no encontrado" })
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== contact.clientId) throw new TRPCError({ code: "FORBIDDEN" })
      return db.opportunity.findMany({ where: { contactId: contact.id }, orderBy: { createdAt: "desc" } })
    }),

  create: protectedProcedure
    .input(CreateOpportunitySchema)
    .mutation(async ({ input, ctx }) => {
      const { clientId, contactId, pipelineId, stageId, assignedUserId, ...rest } = input
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== clientId) throw new TRPCError({ code: "FORBIDDEN" })
      // Validate foreign keys
      const contact = await db.contact.findUnique({ where: { id: contactId } })
      if (!contact || contact.clientId !== clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Contacto inválido" })
      if (assignedUserId) {
        const user = await db.user.findUnique({ where: { id: assignedUserId } })
        if (!user || user.clientId !== clientId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Vendedor asignado inválido' })
      }
      if (pipelineId) {
        const pipeline = await db.pipeline.findUnique({ where: { id: pipelineId } })
        if (!pipeline || pipeline.clientId !== clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Pipeline inválido" })
      }
      let status: "OPEN" | "WON" | "LOST" = "OPEN"
      let finalPipelineId: string | null = pipelineId ?? null
      if (stageId) {
        const stage = await db.pipelineStage.findUnique({ where: { id: stageId }, include: { pipeline: true } })
        if (!stage || stage.pipeline.clientId !== clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Etapa inválida" })
        status = stage.isWon ? "WON" : stage.isLost ? "LOST" : "OPEN"
        finalPipelineId = stage.pipelineId
      }
      return db.opportunity.create({
        data: { clientId, contactId, pipelineId: finalPipelineId, stageId: stageId ?? null, status, assignedUserId: assignedUserId ?? null, ...rest },
      })
    }),

  update: protectedProcedure
    .input(UpdateOpportunitySchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      const opp = await db.opportunity.findUnique({ where: { id } })
      if (!opp) throw new TRPCError({ code: "NOT_FOUND" })
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: "FORBIDDEN" })
      if (data.status && data.status !== "ARCHIVED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Para WON/LOST usa closeAsWon/closeAsLost o moveToStage" })
      }
      const updateData: any = { ...data }
      if (data.assignedUserId !== undefined) {
        if (data.assignedUserId === null) {
          updateData.assignedUserId = null
        } else {
          const user = await db.user.findUnique({ where: { id: data.assignedUserId } })
          if (!user || user.clientId !== opp.clientId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Vendedor asignado inválido' })
        }
      }
      if (data.stageId !== undefined) {
        if (data.stageId === null) {
          updateData.stageId = null
          updateData.status = "OPEN"
          if (data.pipelineId === null) updateData.pipelineId = null
        } else {
          const stage = await db.pipelineStage.findUnique({ where: { id: data.stageId }, include: { pipeline: true } })
          if (!stage || stage.pipeline.clientId !== opp.clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Etapa inválida" })
          updateData.status = stage.isWon ? "WON" : stage.isLost ? "LOST" : "OPEN"
          updateData.pipelineId = stage.pipelineId
        }
      } else if (data.pipelineId) {
        const pipeline = await db.pipeline.findUnique({ where: { id: data.pipelineId } })
        if (!pipeline || pipeline.clientId !== opp.clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Pipeline inválido" })
      }
      return db.opportunity.update({ where: { id }, data: updateData })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const opp = await db.opportunity.findUnique({ where: { id: input.id } })
      if (!opp) throw new TRPCError({ code: "NOT_FOUND" })
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: "FORBIDDEN" })
      await db.opportunity.delete({ where: { id: opp.id } })
      return { success: true }
    }),

  assignToPipeline: protectedProcedure
    .input(z.object({ id: z.string().uuid(), pipelineId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const opp = await db.opportunity.findUnique({ where: { id: input.id } })
      if (!opp) throw new TRPCError({ code: 'NOT_FOUND' })
      if (ctx.session.user.type !== 'AURELIA' && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: 'FORBIDDEN' })
      const pipeline = await db.pipeline.findUnique({ where: { id: input.pipelineId } })
      if (!pipeline || pipeline.clientId !== opp.clientId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pipeline inválido' })
      return db.opportunity.update({ where: { id: opp.id }, data: { pipelineId: pipeline.id, stageId: null, status: 'OPEN' } })
    }),

  moveToStage: protectedProcedure
    .input(MoveOpportunityToStageSchema)
    .mutation(async ({ input, ctx }) => {
      const { opportunityId, toStageId, reason } = input
      const opp = await db.opportunity.findUnique({ where: { id: opportunityId } })
      if (!opp) throw new TRPCError({ code: "NOT_FOUND", message: "Oportunidad no encontrada" })
      const toStage = await db.pipelineStage.findUnique({ where: { id: toStageId }, include: { pipeline: true } })
      if (!toStage) throw new TRPCError({ code: "NOT_FOUND", message: "Etapa destino no encontrada" })
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: "FORBIDDEN" })
      if (toStage.pipeline.clientId !== opp.clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "La etapa destino pertenece a otro cliente" })

      const history = await db.opportunityStageHistory.create({
        data: {
          opportunityId: opp.id,
          fromStageId: opp.stageId,
          toStageId,
          changedById: ctx.session.user.id,
          reason,
        }
      })
      const status = toStage.isWon ? "WON" : toStage.isLost ? "LOST" : "OPEN"
      await db.opportunity.update({ where: { id: opp.id }, data: { stageId: toStageId, pipelineId: toStage.pipelineId, status } })
      return { success: true, historyId: history.id }
    }),

  setStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: OpportunityStatusSchema }))
    .mutation(async ({ input, ctx }) => {
      const opp = await db.opportunity.findUnique({ where: { id: input.id } })
      if (!opp) throw new TRPCError({ code: "NOT_FOUND" })
      if (ctx.session.user.type !== "AURELIA" && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: "FORBIDDEN" })
      if (input.status !== 'ARCHIVED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Solo se permite setear ARCHIVED directamente' })
      }
      return db.opportunity.update({ where: { id: opp.id }, data: { status: 'ARCHIVED' } })
    }),

  closeAsWon: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().optional(), toStageId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const opp = await db.opportunity.findUnique({ where: { id: input.id } })
      if (!opp) throw new TRPCError({ code: 'NOT_FOUND' })
      if (ctx.session.user.type !== 'AURELIA' && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: 'FORBIDDEN' })
      let toStageId = input.toStageId
      if (!toStageId) {
        const pipelineId = opp.pipelineId
        if (!pipelineId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Se requiere toStageId si la oportunidad no tiene pipeline asignado' })
        const winners = await db.pipelineStage.findMany({ where: { pipelineId, isWon: true } })
        if (winners.length !== 1) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Especifique toStageId: no hay una única etapa WON en el pipeline' })
        toStageId = winners[0]!.id
      }
      const toStage = await db.pipelineStage.findUnique({ where: { id: toStageId }, include: { pipeline: true } })
      if (!toStage || toStage.pipeline.clientId !== opp.clientId || !toStage.isWon) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Etapa destino inválida para WON' })
      if (opp.stageId !== toStage.id) {
        await db.opportunityStageHistory.create({ data: { opportunityId: opp.id, fromStageId: opp.stageId, toStageId: toStage.id, changedById: ctx.session.user.id, reason: input.reason } })
      }
      return db.opportunity.update({ where: { id: opp.id }, data: { status: 'WON', stageId: toStage.id, pipelineId: toStage.pipelineId } })
    }),

  closeAsLost: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().optional(), toStageId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const opp = await db.opportunity.findUnique({ where: { id: input.id } })
      if (!opp) throw new TRPCError({ code: 'NOT_FOUND' })
      if (ctx.session.user.type !== 'AURELIA' && ctx.session.user.clientId !== opp.clientId) throw new TRPCError({ code: 'FORBIDDEN' })
      let toStageId = input.toStageId
      if (!toStageId) {
        const pipelineId = opp.pipelineId
        if (!pipelineId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Se requiere toStageId si la oportunidad no tiene pipeline asignado' })
        const losts = await db.pipelineStage.findMany({ where: { pipelineId, isLost: true } })
        if (losts.length !== 1) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Especifique toStageId: no hay una única etapa LOST en el pipeline' })
        toStageId = losts[0]!.id
      }
      const toStage = await db.pipelineStage.findUnique({ where: { id: toStageId }, include: { pipeline: true } })
      if (!toStage || toStage.pipeline.clientId !== opp.clientId || !toStage.isLost) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Etapa destino inválida para LOST' })
      if (opp.stageId !== toStage.id) {
        await db.opportunityStageHistory.create({ data: { opportunityId: opp.id, fromStageId: opp.stageId, toStageId: toStage.id, changedById: ctx.session.user.id, reason: input.reason } })
      }
      return db.opportunity.update({ where: { id: opp.id }, data: { status: 'LOST', stageId: toStage.id, pipelineId: toStage.pipelineId } })
    }),
})


