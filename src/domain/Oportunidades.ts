import { z } from "zod"
import { OpportunityStatus as PrismaOpportunityStatus, Prisma } from "@prisma/client"

// Align enum with Prisma
export const OpportunityStatusSchema = z.nativeEnum(PrismaOpportunityStatus)

// Custom schema for Decimal fields
const DecimalSchema = z.union([
  z.number(),
  z.string().transform((val) => parseFloat(val)),
  z.instanceof(Prisma.Decimal).transform((val) => val.toNumber()),
])

export const CreateOpportunitySchema = z.object({
  clientId: z.string().uuid(),
  contactId: z.string().uuid(),
  title: z.string().min(1),
  amount: DecimalSchema.optional(),
  currency: z.string().length(3).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  assignedUserId: z.string().uuid().optional(),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  expectedCloseDate: z.date().optional(),
})

export const UpdateOpportunitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  amount: DecimalSchema.nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
  probability: z.number().int().min(0).max(100).nullable().optional(),
  source: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  pipelineId: z.string().uuid().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
  status: OpportunityStatusSchema.optional(),
  expectedCloseDate: z.date().nullable().optional(),
  actualCloseDate: z.date().nullable().optional(),
})

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  amount: DecimalSchema.nullable().optional(),
  currency: z.string().nullable().optional(),
  probability: z.number().int().nullable().optional(),
  status: OpportunityStatusSchema,
  source: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  expectedCloseDate: z.date().nullable().optional(),
  actualCloseDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  clientId: z.string().uuid(),
  contactId: z.string().uuid(),
  assignedUserId: z.string().uuid().nullable().optional(),
  pipelineId: z.string().uuid().nullable().optional(),
  stageId: z.string().uuid().nullable().optional(),
})

export const MoveOpportunityToStageSchema = z.object({
  opportunityId: z.string().uuid(),
  toStageId: z.string().uuid(),
  reason: z.string().optional(),
})

export const OpportunityFiltersSchema = z.object({
  clientId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().optional(),
  status: OpportunityStatusSchema.optional(),
  pipelineId: z.string().uuid().optional(),
  stageId: z.string().uuid().optional(),
  search: z.string().optional(),
}).strict()

export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>
export type CreateOpportunity = z.infer<typeof CreateOpportunitySchema>
export type UpdateOpportunity = z.infer<typeof UpdateOpportunitySchema>
export type Opportunity = z.infer<typeof OpportunitySchema>
export type MoveOpportunityToStage = z.infer<typeof MoveOpportunityToStageSchema>
export type OpportunityFilters = z.infer<typeof OpportunityFiltersSchema>


