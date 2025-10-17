import { z } from "zod"

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().optional().nullable(),
  oldValues: z.record(z.any()).optional().nullable(),
  newValues: z.record(z.any()).optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  createdAt: z.date()
})

export type AuditLog = z.infer<typeof AuditLogSchema>

export const CreateAuditLogSchema = AuditLogSchema.omit({
  id: true,
  createdAt: true
})

export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>

export interface AuditLogFilters {
  clientId?: string
  userId?: string
  entityType?: string
  action?: string
  startDate?: Date
  endDate?: Date
} 