import { db } from "@/server/db"
import { NotificationType, NotificationPriority } from "@/domain/Notificaciones"
import type { CreateNotification } from "@/domain/Notificaciones"
import { logger } from "@/lib/utils/server-logger"

/**
 * Servicio para la gestión de notificaciones del sistema
 *
 * Este servicio proporciona métodos para crear notificaciones
 * relacionadas con eventos del sistema (conversaciones, agentes, contactos, etc.)
 */
export class NotificationService {
  /**
   * Crear una notificación genérica
   */
  static async create(data: CreateNotification) {
    try {
      const notification = await db.notification.create({
        data: {
          ...data,
          metadata: data.metadata ?? undefined
        }
      })

      logger.info(`Notification created: ${notification.id}`, {
        type: notification.type,
        clientId: notification.clientId,
        userId: notification.userId
      })

      return notification
    } catch (error) {
      logger.error("Error creating notification:", error)
      throw error
    }
  }

  /**
   * Notificar sobre una nueva conversación
   */
  static async notifyNewConversation(params: {
    clientId: string
    userId?: string | null
    contactName: string
    conversationId: string
    channel?: string
  }) {
    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      category: "conversation",
      title: "Nueva conversación",
      message: `Nueva conversación iniciada con ${params.contactName}`,
      metadata: {
        conversationId: params.conversationId,
        channel: params.channel,
        contactName: params.contactName
      }
    })
  }

  /**
   * Notificar sobre un nuevo mensaje no leído
   */
  static async notifyNewMessage(params: {
    clientId: string
    userId?: string | null
    contactName: string
    conversationId: string
    messagePreview: string
  }) {
    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      category: "message",
      title: `Nuevo mensaje de ${params.contactName}`,
      message: params.messagePreview.substring(0, 100),
      metadata: {
        conversationId: params.conversationId,
        contactName: params.contactName
      }
    })
  }

  /**
   * Notificar sobre una conversación asignada
   */
  static async notifyConversationAssigned(params: {
    clientId: string
    userId: string
    contactName: string
    conversationId: string
    assignedByName?: string
  }) {
    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.INFO,
      priority: NotificationPriority.HIGH,
      category: "conversation",
      title: "Conversación asignada",
      message: `Se te asignó la conversación con ${params.contactName}${params.assignedByName ? ` por ${params.assignedByName}` : ""}`,
      metadata: {
        conversationId: params.conversationId,
        contactName: params.contactName,
        assignedByName: params.assignedByName
      }
    })
  }

  /**
   * Notificar sobre una instancia de WhatsApp desconectada
   */
  static async notifyInstanceDisconnected(params: {
    clientId: string
    instanceName: string
    phoneNumber?: string | null
  }) {
    return this.create({
      clientId: params.clientId,
      userId: null, // Notificación a nivel de cliente
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      category: "instance",
      title: "Instancia desconectada",
      message: `La instancia ${params.instanceName}${params.phoneNumber ? ` (${params.phoneNumber})` : ""} se ha desconectado`,
      metadata: {
        instanceName: params.instanceName,
        phoneNumber: params.phoneNumber
      }
    })
  }

  /**
   * Notificar sobre una instancia de WhatsApp reconectada
   */
  static async notifyInstanceConnected(params: {
    clientId: string
    instanceName: string
    phoneNumber?: string | null
  }) {
    return this.create({
      clientId: params.clientId,
      userId: null,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.MEDIUM,
      category: "instance",
      title: "Instancia conectada",
      message: `La instancia ${params.instanceName}${params.phoneNumber ? ` (${params.phoneNumber})` : ""} se ha conectado`,
      metadata: {
        instanceName: params.instanceName,
        phoneNumber: params.phoneNumber
      }
    })
  }

  /**
   * Notificar sobre un nuevo contacto
   */
  static async notifyNewContact(params: {
    clientId: string
    userId?: string | null
    contactName: string
    contactId: string
    source?: string
  }) {
    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
      category: "contact",
      title: "Nuevo contacto",
      message: `Se agregó el contacto ${params.contactName}${params.source ? ` desde ${params.source}` : ""}`,
      metadata: {
        contactId: params.contactId,
        contactName: params.contactName,
        source: params.source
      }
    })
  }

  /**
   * Notificar sobre una tarea vencida
   */
  static async notifyTaskOverdue(params: {
    clientId: string
    userId: string
    taskTitle: string
    taskId: string
    dueDate: Date
  }) {
    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.WARNING,
      priority: NotificationPriority.URGENT,
      category: "task",
      title: "Tarea vencida",
      message: `La tarea "${params.taskTitle}" está vencida desde ${params.dueDate.toLocaleDateString()}`,
      metadata: {
        taskId: params.taskId,
        taskTitle: params.taskTitle,
        dueDate: params.dueDate.toISOString()
      }
    })
  }

  /**
   * Notificar sobre una oportunidad ganada
   */
  static async notifyOpportunityWon(params: {
    clientId: string
    userId?: string | null
    opportunityTitle: string
    opportunityId: string
    amount?: number
    currency?: string
  }) {
    const amountText = params.amount && params.currency
      ? ` por ${params.currency} ${params.amount}`
      : ""

    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      category: "opportunity",
      title: "Oportunidad ganada",
      message: `¡Felicitaciones! Se ganó la oportunidad "${params.opportunityTitle}"${amountText}`,
      metadata: {
        opportunityId: params.opportunityId,
        opportunityTitle: params.opportunityTitle,
        amount: params.amount,
        currency: params.currency
      }
    })
  }

  /**
   * Notificar sobre una oportunidad perdida
   */
  static async notifyOpportunityLost(params: {
    clientId: string
    userId?: string | null
    opportunityTitle: string
    opportunityId: string
    reason?: string
  }) {
    return this.create({
      clientId: params.clientId,
      userId: params.userId,
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      category: "opportunity",
      title: "Oportunidad perdida",
      message: `Se perdió la oportunidad "${params.opportunityTitle}"${params.reason ? `: ${params.reason}` : ""}`,
      metadata: {
        opportunityId: params.opportunityId,
        opportunityTitle: params.opportunityTitle,
        reason: params.reason
      }
    })
  }

  /**
   * Notificar sobre límite del plan alcanzado
   */
  static async notifyPlanLimitReached(params: {
    clientId: string
    limitType: "users" | "contacts" | "agents" | "instances"
    currentValue: number
    maxValue: number
  }) {
    const limitNames = {
      users: "usuarios",
      contacts: "contactos",
      agents: "agentes",
      instances: "instancias"
    }

    return this.create({
      clientId: params.clientId,
      userId: null, // Notificación a nivel de cliente
      type: NotificationType.WARNING,
      priority: NotificationPriority.URGENT,
      category: "system",
      title: "Límite del plan alcanzado",
      message: `Has alcanzado el límite de ${limitNames[params.limitType]} (${params.currentValue}/${params.maxValue}). Considera actualizar tu plan.`,
      metadata: {
        limitType: params.limitType,
        currentValue: params.currentValue,
        maxValue: params.maxValue
      }
    })
  }

  /**
   * Notificar sobre un error del sistema
   */
  static async notifySystemError(params: {
    clientId: string
    errorTitle: string
    errorMessage: string
    errorContext?: Record<string, unknown>
  }) {
    return this.create({
      clientId: params.clientId,
      userId: null,
      type: NotificationType.ERROR,
      priority: NotificationPriority.URGENT,
      category: "system",
      title: params.errorTitle,
      message: params.errorMessage,
      metadata: params.errorContext
    })
  }

  /**
   * Limpiar notificaciones expiradas de un cliente
   */
  static async cleanExpiredNotifications(clientId: string) {
    try {
      const result = await db.notification.deleteMany({
        where: {
          clientId,
          expiresAt: {
            lte: new Date()
          }
        }
      })

      logger.info(`Cleaned ${result.count} expired notifications for client ${clientId}`)

      return result.count
    } catch (error) {
      logger.error("Error cleaning expired notifications:", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Marcar notificaciones antiguas como leídas automáticamente
   * (útil para limpieza de notificaciones con más de X días)
   */
  static async autoMarkOldAsRead(clientId: string, daysOld: number = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await db.notification.updateMany({
        where: {
          clientId,
          read: false,
          createdAt: {
            lte: cutoffDate
          }
        },
        data: {
          read: true,
          readAt: new Date()
        }
      })

      logger.info(`Auto-marked ${result.count} old notifications as read for client ${clientId}`)

      return result.count
    } catch (error) {
      logger.error("Error auto-marking old notifications:", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
}
