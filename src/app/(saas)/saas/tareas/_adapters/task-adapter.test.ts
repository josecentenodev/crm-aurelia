import { describe, it, expect } from 'vitest'
import { CrmTaskStatus, CrmTaskPriority } from '@prisma/client'
import {
  formatTaskDueDate,
  isTaskOverdue,
  getTaskStatusText,
  getTaskPriorityText,
  getTaskStatusColor,
  getTaskPriorityColor,
  adaptTaskForDisplay,
  sortTasksByPriority,
} from './task-adapter'
import { mockTasks, mockTaskWithRelations } from '../_tests/mocks/task-data'

describe('task-adapter', () => {
  describe('formatTaskDueDate', () => {
    it('should return "Hoy" for today date', () => {
      const today = new Date()
      const formatted = formatTaskDueDate(today)

      expect(formatted).toBe('Hoy')
    })

    it('should return "Mañana" for tomorrow date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const formatted = formatTaskDueDate(tomorrow)

      expect(formatted).toBe('Mañana')
    })

    it('should return "En X días" for dates within 7 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      const formatted = formatTaskDueDate(futureDate)

      expect(formatted).toMatch(/En \d+ días?/)
    })

    it('should return formatted date for dates beyond 7 days', () => {
      const farFutureDate = new Date()
      farFutureDate.setDate(farFutureDate.getDate() + 30)
      const formatted = formatTaskDueDate(farFutureDate)

      expect(formatted).toMatch(/\d{1,2}\s+\w+\s+\d{4}/)
    })

    it('should return "Vencida hace X días" for overdue dates', () => {
      const pastDate = new Date('2020-01-15T10:00:00Z')
      const formatted = formatTaskDueDate(pastDate)

      expect(formatted).toMatch(/Vencida hace \d+ días?/)
    })

    it('should return "Sin fecha" for null date', () => {
      const formatted = formatTaskDueDate(null)
      expect(formatted).toBe('Sin fecha')
    })
  })

  describe('isTaskOverdue', () => {
    it('should return true for overdue task', () => {
      const overdueTask = {
        ...mockTasks.overdue,
        dueDate: new Date('2020-01-01T10:00:00Z'), // Fecha pasada
        status: CrmTaskStatus.PENDING,
      }

      expect(isTaskOverdue(overdueTask)).toBe(true)
    })

    it('should return false for future task', () => {
      const futureTask = {
        ...mockTasks.pending,
        dueDate: new Date('2030-12-31T10:00:00Z'), // Fecha futura
        status: CrmTaskStatus.PENDING,
      }

      expect(isTaskOverdue(futureTask)).toBe(false)
    })

    it('should return false for completed task even if past due date', () => {
      const completedTask = {
        ...mockTasks.completed,
        dueDate: new Date('2020-01-01T10:00:00Z'),
        status: CrmTaskStatus.COMPLETED,
      }

      expect(isTaskOverdue(completedTask)).toBe(false)
    })

    it('should return false for archived task even if past due date', () => {
      const archivedTask = {
        ...mockTasks.pending,
        dueDate: new Date('2020-01-01T10:00:00Z'),
        status: CrmTaskStatus.ARCHIVED,
      }

      expect(isTaskOverdue(archivedTask)).toBe(false)
    })

    it('should return false for task without due date', () => {
      const taskWithoutDueDate = {
        ...mockTasks.pending,
        dueDate: null,
      }

      expect(isTaskOverdue(taskWithoutDueDate)).toBe(false)
    })
  })

  describe('getTaskStatusText', () => {
    it('should return correct Spanish text for PENDING', () => {
      expect(getTaskStatusText(CrmTaskStatus.PENDING)).toBe('Pendiente')
    })

    it('should return correct Spanish text for IN_PROGRESS', () => {
      expect(getTaskStatusText(CrmTaskStatus.IN_PROGRESS)).toBe('En Progreso')
    })

    it('should return correct Spanish text for COMPLETED', () => {
      expect(getTaskStatusText(CrmTaskStatus.COMPLETED)).toBe('Completada')
    })

    it('should return correct Spanish text for ARCHIVED', () => {
      expect(getTaskStatusText(CrmTaskStatus.ARCHIVED)).toBe('Archivada')
    })
  })

  describe('getTaskPriorityText', () => {
    it('should return correct Spanish text for LOW', () => {
      expect(getTaskPriorityText(CrmTaskPriority.LOW)).toBe('Baja')
    })

    it('should return correct Spanish text for MEDIUM', () => {
      expect(getTaskPriorityText(CrmTaskPriority.MEDIUM)).toBe('Media')
    })

    it('should return correct Spanish text for HIGH', () => {
      expect(getTaskPriorityText(CrmTaskPriority.HIGH)).toBe('Alta')
    })

    it('should return correct Spanish text for URGENT', () => {
      expect(getTaskPriorityText(CrmTaskPriority.URGENT)).toBe('Urgente')
    })
  })

  describe('getTaskStatusColor', () => {
    it('should return yellow classes for PENDING', () => {
      const color = getTaskStatusColor(CrmTaskStatus.PENDING)
      expect(color).toContain('yellow')
    })

    it('should return blue classes for IN_PROGRESS', () => {
      const color = getTaskStatusColor(CrmTaskStatus.IN_PROGRESS)
      expect(color).toContain('blue')
    })

    it('should return green classes for COMPLETED', () => {
      const color = getTaskStatusColor(CrmTaskStatus.COMPLETED)
      expect(color).toContain('green')
    })

    it('should return gray classes for ARCHIVED', () => {
      const color = getTaskStatusColor(CrmTaskStatus.ARCHIVED)
      expect(color).toContain('gray')
    })
  })

  describe('getTaskPriorityColor', () => {
    it('should return gray classes for LOW', () => {
      const color = getTaskPriorityColor(CrmTaskPriority.LOW)
      expect(color).toContain('gray')
    })

    it('should return yellow classes for MEDIUM', () => {
      const color = getTaskPriorityColor(CrmTaskPriority.MEDIUM)
      expect(color).toContain('yellow')
    })

    it('should return red classes for HIGH', () => {
      const color = getTaskPriorityColor(CrmTaskPriority.HIGH)
      expect(color).toContain('red')
    })

    it('should return red classes for URGENT', () => {
      const color = getTaskPriorityColor(CrmTaskPriority.URGENT)
      expect(color).toContain('red')
    })
  })

  describe('adaptTaskForDisplay', () => {
    it('should adapt task with all properties', () => {
      const adapted = adaptTaskForDisplay(mockTaskWithRelations)

      expect(adapted).toHaveProperty('dueDateFormatted')
      expect(adapted).toHaveProperty('isOverdue')
      expect(adapted).toHaveProperty('statusText')
      expect(adapted).toHaveProperty('statusColor')
      expect(adapted).toHaveProperty('priorityText')
      expect(adapted).toHaveProperty('priorityColor')
      expect(adapted).toHaveProperty('ownerName')
    })

    it('should format due date correctly', () => {
      const adapted = adaptTaskForDisplay(mockTaskWithRelations)

      // formatTaskDueDate has logic for relative dates, just verify it's not "Sin fecha"
      expect(adapted.dueDateFormatted).toBeTruthy()
      expect(adapted.dueDateFormatted).not.toBe('Sin fecha')
    })

    it('should detect overdue status', () => {
      const overdueTask = {
        ...mockTaskWithRelations,
        dueDate: new Date('2020-01-01T10:00:00Z'),
      }
      const adapted = adaptTaskForDisplay(overdueTask)

      expect(adapted.isOverdue).toBe(true)
    })

    it('should use owner name if available', () => {
      const adapted = adaptTaskForDisplay(mockTaskWithRelations)

      expect(adapted.ownerName).toBe('Juan Pérez')
    })

    it('should fallback to owner email if name is null', () => {
      const taskWithoutOwnerName = {
        ...mockTaskWithRelations,
        owner: {
          id: 'user-1',
          name: null,
          email: 'juan@example.com',
        },
      }
      const adapted = adaptTaskForDisplay(taskWithoutOwnerName)

      expect(adapted.ownerName).toBe('juan@example.com')
    })

    it('should display contact name when related contact exists', () => {
      const adapted = adaptTaskForDisplay(mockTaskWithRelations)

      expect(adapted.relatedEntityName).toContain('María González')
    })

    it('should return null for relatedEntityName when no relations', () => {
      const taskWithoutRelations = {
        ...mockTaskWithRelations,
        relatedContact: null,
        relatedConversation: null,
        relatedOpportunity: null,
      }
      const adapted = adaptTaskForDisplay(taskWithoutRelations)

      expect(adapted.relatedEntityName).toBeNull()
    })
  })

  describe('sortTasksByPriority', () => {
    it('should sort by status first (PENDING > IN_PROGRESS > COMPLETED)', () => {
      const tasks = [
        { ...mockTasks.completed, priority: CrmTaskPriority.URGENT },
        { ...mockTasks.inProgress, priority: CrmTaskPriority.LOW },
        { ...mockTasks.pending, priority: CrmTaskPriority.LOW },
      ]

      const sorted = sortTasksByPriority(tasks)

      expect(sorted[0]!.status).toBe(CrmTaskStatus.PENDING)
      expect(sorted[1]!.status).toBe(CrmTaskStatus.IN_PROGRESS)
      expect(sorted[2]!.status).toBe(CrmTaskStatus.COMPLETED)
    })

    it('should sort by priority within same status', () => {
      const tasks = [
        { ...mockTasks.pending, id: '1', priority: CrmTaskPriority.LOW },
        { ...mockTasks.pending, id: '2', priority: CrmTaskPriority.URGENT },
        { ...mockTasks.pending, id: '3', priority: CrmTaskPriority.MEDIUM },
        { ...mockTasks.pending, id: '4', priority: CrmTaskPriority.HIGH },
      ]

      const sorted = sortTasksByPriority(tasks)

      expect(sorted[0]!.priority).toBe(CrmTaskPriority.URGENT)
      expect(sorted[1]!.priority).toBe(CrmTaskPriority.HIGH)
      expect(sorted[2]!.priority).toBe(CrmTaskPriority.MEDIUM)
      expect(sorted[3]!.priority).toBe(CrmTaskPriority.LOW)
    })

    it('should sort by due date within same status and priority', () => {
      const tasks = [
        { ...mockTasks.pending, id: '1', dueDate: new Date('2025-10-25T10:00:00Z') },
        { ...mockTasks.pending, id: '2', dueDate: new Date('2025-10-20T10:00:00Z') },
        { ...mockTasks.pending, id: '3', dueDate: new Date('2025-10-22T10:00:00Z') },
      ]

      const sorted = sortTasksByPriority(tasks)

      expect(sorted[0]!.dueDate!.getDate()).toBe(20)
      expect(sorted[1]!.dueDate!.getDate()).toBe(22)
      expect(sorted[2]!.dueDate!.getDate()).toBe(25)
    })

    it('should handle tasks without due date (put at end)', () => {
      const tasks = [
        { ...mockTasks.pending, id: '1', dueDate: null },
        { ...mockTasks.pending, id: '2', dueDate: new Date('2025-10-20T10:00:00Z') },
        { ...mockTasks.pending, id: '3', dueDate: null },
      ]

      const sorted = sortTasksByPriority(tasks)

      expect(sorted[0]!.dueDate).not.toBeNull()
      expect(sorted[1]!.dueDate).toBeNull()
      expect(sorted[2]!.dueDate).toBeNull()
    })

    it('should return empty array when input is empty', () => {
      const sorted = sortTasksByPriority([])

      expect(sorted).toEqual([])
    })
  })
})
