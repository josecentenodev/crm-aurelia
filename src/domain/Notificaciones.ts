import { z } from "zod"

export enum NotificationType {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  SYSTEM = "SYSTEM"
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  type: z.nativeEnum(NotificationType).default(NotificationType.INFO),
  title: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  priority: z.nativeEnum(NotificationPriority).default(NotificationPriority.MEDIUM),
  category: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  expiresAt: z.date().optional().nullable(),
  createdAt: z.date(),
  readAt: z.date().optional().nullable()
})

export type Notification = z.infer<typeof NotificationSchema>

export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  createdAt: true,
  readAt: true,
  read: true
})

export type CreateNotification = z.infer<typeof CreateNotificationSchema>

export const UpdateNotificationSchema = CreateNotificationSchema.partial()

export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>

export const NotificationFiltersSchema = z.object({
  clientId: z.string().uuid().optional(),
  userId: z.string().uuid().optional().nullable(),
  type: z.nativeEnum(NotificationType).optional(),
  read: z.boolean().optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),
  category: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  limit: z.number().int().positive().default(50).optional(),
  offset: z.number().int().min(0).default(0).optional()
})

export type NotificationFilters = z.infer<typeof NotificationFiltersSchema>

export interface NotificationWithUser extends Notification {
  user?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

export const MarkAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1)
})

export const MarkAllAsReadSchema = z.object({
  clientId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable()
}) 