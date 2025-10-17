import { z } from "zod"
import { CrmTaskStatus, CrmTaskPriority } from "@prisma/client"

// Re-export the Prisma enums for consistency
export { CrmTaskStatus, CrmTaskPriority } from "@prisma/client"

// Schema for CRM tasks
export const CrmTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(CrmTaskStatus).default("PENDING"),
  priority: z.nativeEnum(CrmTaskPriority).default("MEDIUM"),
  dueDate: z.date().nullable().optional(),
  ownerId: z.string().uuid(),
  relatedContactId: z.string().uuid().nullable().optional(),
  relatedConversationId: z.string().uuid().nullable().optional(),
  relatedOpportunityId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CrmTask = z.infer<typeof CrmTaskSchema>

// Schema for creating a new task
export const CreateCrmTaskSchema = CrmTaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateCrmTask = z.infer<typeof CreateCrmTaskSchema>

// Schema for updating a task
export const UpdateCrmTaskSchema = CreateCrmTaskSchema.partial()

export type UpdateCrmTask = z.infer<typeof UpdateCrmTaskSchema>

// Props for task modal
export interface CrmTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: CrmTask | null
  onSave: (task: CreateCrmTask | UpdateCrmTask) => void
}

// Filters for task search
export interface CrmTaskFilters {
  status?: CrmTaskStatus
  priority?: CrmTaskPriority
  ownerId?: string
  relatedContactId?: string
  relatedConversationId?: string
  relatedOpportunityId?: string
  search?: string
  dueDateFrom?: Date
  dueDateTo?: Date
  clientId?: string
}

// Constants for forms
export const CRM_TASK_STATUSES = [
  { value: CrmTaskStatus.PENDING, label: "Pendiente", color: "text-yellow-600" },
  { value: CrmTaskStatus.IN_PROGRESS, label: "En Progreso", color: "text-blue-600" },
  { value: CrmTaskStatus.COMPLETED, label: "Completada", color: "text-green-600" },
  { value: CrmTaskStatus.ARCHIVED, label: "Archivada", color: "text-gray-600" },
]

export const CRM_TASK_PRIORITIES = [
  { value: CrmTaskPriority.LOW, label: "Baja", color: "text-gray-600" },
  { value: CrmTaskPriority.MEDIUM, label: "Media", color: "text-yellow-600" },
  { value: CrmTaskPriority.HIGH, label: "Alta", color: "text-red-600" },
  { value: CrmTaskPriority.URGENT, label: "Urgente", color: "text-red-700" },
]

// Extended task with relations for display
export interface CrmTaskWithRelations extends CrmTask {
  owner?: {
    id: string
    name: string | null
    email: string | null
  }
  relatedContact?: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
  }
  relatedConversation?: {
    id: string
    title: string | null
  }
  relatedOpportunity?: {
    id: string
    title: string
  }
}
