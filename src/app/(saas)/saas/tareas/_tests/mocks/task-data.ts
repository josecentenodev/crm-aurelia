import { CrmTaskStatus, CrmTaskPriority } from '@prisma/client'
import type { CrmTaskWithRelations } from '@/domain/Tareas'

/**
 * Mock task data for testing
 */
export const mockTasks = {
  pending: {
    id: 'task-1',
    title: 'Llamar al cliente',
    description: 'Seguimiento de propuesta comercial',
    status: CrmTaskStatus.PENDING,
    priority: CrmTaskPriority.HIGH,
    dueDate: new Date('2025-10-20T10:00:00Z'),
    ownerId: 'user-1',
    relatedContactId: 'contact-1',
    relatedConversationId: null,
    relatedOpportunityId: null,
    clientId: 'client-1',
    createdAt: new Date('2025-10-14T08:00:00Z'),
    updatedAt: new Date('2025-10-14T08:00:00Z'),
  },

  inProgress: {
    id: 'task-2',
    title: 'Preparar presentación',
    description: null,
    status: CrmTaskStatus.IN_PROGRESS,
    priority: CrmTaskPriority.MEDIUM,
    dueDate: new Date('2025-10-18T14:00:00Z'),
    ownerId: 'user-1',
    relatedContactId: null,
    relatedConversationId: 'conversation-1',
    relatedOpportunityId: 'opportunity-1',
    clientId: 'client-1',
    createdAt: new Date('2025-10-13T09:00:00Z'),
    updatedAt: new Date('2025-10-14T10:00:00Z'),
  },

  completed: {
    id: 'task-3',
    title: 'Enviar cotización',
    description: 'Cotización para proyecto X',
    status: CrmTaskStatus.COMPLETED,
    priority: CrmTaskPriority.LOW,
    dueDate: new Date('2025-10-15T16:00:00Z'),
    ownerId: 'user-2',
    relatedContactId: 'contact-2',
    relatedConversationId: null,
    relatedOpportunityId: null,
    clientId: 'client-1',
    createdAt: new Date('2025-10-12T11:00:00Z'),
    updatedAt: new Date('2025-10-15T15:30:00Z'),
  },

  overdue: {
    id: 'task-4',
    title: 'Tarea vencida',
    description: 'Esta tarea ya venció',
    status: CrmTaskStatus.PENDING,
    priority: CrmTaskPriority.URGENT,
    dueDate: new Date('2025-10-10T12:00:00Z'),
    ownerId: 'user-1',
    relatedContactId: null,
    relatedConversationId: null,
    relatedOpportunityId: null,
    clientId: 'client-1',
    createdAt: new Date('2025-10-09T08:00:00Z'),
    updatedAt: new Date('2025-10-09T08:00:00Z'),
  },
}

export const mockTaskWithRelations: CrmTaskWithRelations = {
  ...mockTasks.pending,
  owner: {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
  },
  relatedContact: {
    id: 'contact-1',
    name: 'María González',
    email: 'maria@example.com',
    phone: '+54 11 1234-5678',
  },
  relatedConversation: null,
  relatedOpportunity: null,
}

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    clientId: 'client-1',
  },
  {
    id: 'user-2',
    name: 'Ana López',
    email: 'ana@example.com',
    clientId: 'client-1',
  },
]

export const mockContacts = [
  {
    id: 'contact-1',
    name: 'María González',
    email: 'maria@client.com',
    phone: '+54 11 1234-5678',
    clientId: 'client-1',
  },
  {
    id: 'contact-2',
    name: 'Pedro Rodríguez',
    email: 'pedro@client.com',
    phone: '+54 11 8765-4321',
    clientId: 'client-1',
  },
]

export const mockConversations = [
  {
    id: 'conversation-1',
    title: 'Consulta sobre servicios',
    status: 'ACTIVE' as const,
    clientId: 'client-1',
  },
]

export const mockOpportunities = [
  {
    id: 'opportunity-1',
    title: 'Proyecto X',
    amount: 50000,
    status: 'NEGOTIATION' as const,
    clientId: 'client-1',
  },
]

export const mockTasksStats = {
  total: 10,
  overdue: 2,
  byStatus: {
    PENDING: 5,
    IN_PROGRESS: 3,
    COMPLETED: 2,
    ARCHIVED: 0,
  },
  byPriority: {
    LOW: 2,
    MEDIUM: 4,
    HIGH: 3,
    URGENT: 1,
  },
}
