import { describe, it, expect, beforeEach } from 'vitest'
import { CrmTaskStatus, CrmTaskPriority } from '@prisma/client'
import { useTasksStore } from './tasks-store'

describe('tasks-store', () => {
  beforeEach(() => {
    // Reset store before each test
    useTasksStore.getState().clearFilters()
    useTasksStore.getState().setSelectedCategory('all')
    useTasksStore.getState().setSelectedTaskId(undefined)
  })

  describe('Initial State', () => {
    it('should have empty search term by default', () => {
      const { searchTerm } = useTasksStore.getState()

      expect(searchTerm).toBe('')
    })

    it('should have "all" as default category', () => {
      const { selectedCategory } = useTasksStore.getState()

      expect(selectedCategory).toBe('all')
    })

    it('should have undefined as selectedTaskId', () => {
      const { selectedTaskId } = useTasksStore.getState()

      expect(selectedTaskId).toBeUndefined()
    })
  })

  describe('setFilter', () => {
    it('should set a single filter', () => {
      const { setStatusFilter } = useTasksStore.getState()

      setStatusFilter(CrmTaskStatus.PENDING)

      const { statusFilter } = useTasksStore.getState()
      expect(statusFilter).toBe(CrmTaskStatus.PENDING)
    })

    it('should set multiple filters', () => {
      const { setStatusFilter, setPriorityFilter, setOwnerFilter } = useTasksStore.getState()

      setStatusFilter(CrmTaskStatus.IN_PROGRESS)
      setPriorityFilter(CrmTaskPriority.HIGH)
      setOwnerFilter('user-1')

      const { statusFilter, priorityFilter, ownerFilter } = useTasksStore.getState()
      expect(statusFilter).toBe(CrmTaskStatus.IN_PROGRESS)
      expect(priorityFilter).toBe(CrmTaskPriority.HIGH)
      expect(ownerFilter).toBe('user-1')
    })

    it('should update existing filter', () => {
      const { setStatusFilter } = useTasksStore.getState()

      setStatusFilter(CrmTaskStatus.PENDING)
      setStatusFilter(CrmTaskStatus.COMPLETED)

      const { statusFilter } = useTasksStore.getState()
      expect(statusFilter).toBe(CrmTaskStatus.COMPLETED)
    })

    it('should handle search filter', () => {
      const { setSearchTerm } = useTasksStore.getState()

      setSearchTerm('cliente')

      const { searchTerm } = useTasksStore.getState()
      expect(searchTerm).toBe('cliente')
    })

    it('should handle date filters', () => {
      const { setDueDateFromFilter, setDueDateToFilter } = useTasksStore.getState()
      const fromDate = new Date('2025-10-01')
      const toDate = new Date('2025-10-31')

      setDueDateFromFilter(fromDate)
      setDueDateToFilter(toDate)

      const { dueDateFromFilter, dueDateToFilter } = useTasksStore.getState()
      expect(dueDateFromFilter).toBe(fromDate)
      expect(dueDateToFilter).toBe(toDate)
    })
  })

  describe('clearFilters', () => {
    it('should clear all filters', () => {
      const { setStatusFilter, setPriorityFilter, setSearchTerm, clearFilters } = useTasksStore.getState()

      setStatusFilter(CrmTaskStatus.PENDING)
      setPriorityFilter(CrmTaskPriority.HIGH)
      setSearchTerm('test')

      clearFilters()

      const { statusFilter, priorityFilter, searchTerm } = useTasksStore.getState()
      expect(statusFilter).toBeUndefined()
      expect(priorityFilter).toBeUndefined()
      expect(searchTerm).toBe('')
    })

    it('should not affect category', () => {
      const { setSelectedCategory, clearFilters } = useTasksStore.getState()

      setSelectedCategory('my-tasks')
      clearFilters()

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('my-tasks')
    })
  })

  describe('setCategory', () => {
    it('should set "all" category', () => {
      const { setSelectedCategory } = useTasksStore.getState()

      setSelectedCategory('all')

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('all')
    })

    it('should set "my-tasks" category', () => {
      const { setSelectedCategory } = useTasksStore.getState()

      setSelectedCategory('my-tasks')

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('my-tasks')
      // Note: my-tasks filter is applied in the component, not in the store
    })

    it('should set "pending" category', () => {
      const { setSelectedCategory } = useTasksStore.getState()

      setSelectedCategory('pending')

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('pending')
      // Filter is applied via getTrpcFilters()
    })

    it('should set "in-progress" category', () => {
      const { setSelectedCategory } = useTasksStore.getState()

      setSelectedCategory('in-progress')

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('in-progress')
      // Filter is applied via getTrpcFilters()
    })

    it('should set "completed" category', () => {
      const { setSelectedCategory } = useTasksStore.getState()

      setSelectedCategory('completed')

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('completed')
      // Filter is applied via getTrpcFilters()
    })

    it('should set "overdue" category', () => {
      const { setSelectedCategory } = useTasksStore.getState()

      setSelectedCategory('overdue')

      const { selectedCategory } = useTasksStore.getState()
      expect(selectedCategory).toBe('overdue')
      // Overdue logic is handled via getTrpcFilters()
    })

    it('should not interfere with other filters when changing category', () => {
      const { setPriorityFilter, setSearchTerm, setSelectedCategory } = useTasksStore.getState()

      setPriorityFilter(CrmTaskPriority.HIGH)
      setSearchTerm('test')

      setSelectedCategory('completed')

      const { priorityFilter, searchTerm, selectedCategory } = useTasksStore.getState()
      expect(priorityFilter).toBe(CrmTaskPriority.HIGH)
      expect(searchTerm).toBe('test')
      expect(selectedCategory).toBe('completed')
    })
  })

  describe('getTrpcFilters', () => {
    it('should return filters formatted for tRPC', () => {
      const { setStatusFilter, setPriorityFilter, getTrpcFilters } = useTasksStore.getState()

      setStatusFilter(CrmTaskStatus.PENDING)
      setPriorityFilter(CrmTaskPriority.HIGH)

      const trpcFilters = getTrpcFilters()

      expect(trpcFilters).toEqual({
        status: CrmTaskStatus.PENDING,
        priority: CrmTaskPriority.HIGH,
      })
    })

    it('should return empty filters object when no filters set', () => {
      const { getTrpcFilters } = useTasksStore.getState()

      const trpcFilters = getTrpcFilters()

      expect(trpcFilters).toEqual({})
    })

    it('should include all filter types', () => {
      const { setStatusFilter, setPriorityFilter, setOwnerFilter, setRelatedContactFilter, setSearchTerm, setDueDateFromFilter, setDueDateToFilter, getTrpcFilters } = useTasksStore.getState()

      const fromDate = new Date('2025-10-01')
      const toDate = new Date('2025-10-31')

      setStatusFilter(CrmTaskStatus.IN_PROGRESS)
      setPriorityFilter(CrmTaskPriority.MEDIUM)
      setOwnerFilter('user-1')
      setRelatedContactFilter('contact-1')
      setSearchTerm('importante')
      setDueDateFromFilter(fromDate)
      setDueDateToFilter(toDate)

      const trpcFilters = getTrpcFilters()

      expect(trpcFilters).toEqual({
        status: CrmTaskStatus.IN_PROGRESS,
        priority: CrmTaskPriority.MEDIUM,
        ownerId: 'user-1',
        relatedContactId: 'contact-1',
        search: 'importante',
        dueDateFrom: fromDate,
        dueDateTo: toDate,
      })
    })
  })

  describe('setSelectedTaskId', () => {
    it('should set selected task id', () => {
      const { setSelectedTaskId } = useTasksStore.getState()

      setSelectedTaskId('task-1')

      const { selectedTaskId } = useTasksStore.getState()
      expect(selectedTaskId).toBe('task-1')
    })

    it('should clear selected task with undefined', () => {
      const { setSelectedTaskId } = useTasksStore.getState()

      setSelectedTaskId('task-1')
      setSelectedTaskId(undefined)

      const { selectedTaskId } = useTasksStore.getState()
      expect(selectedTaskId).toBeUndefined()
    })

    it('should update selected task', () => {
      const { setSelectedTaskId } = useTasksStore.getState()

      setSelectedTaskId('task-1')
      setSelectedTaskId('task-2')

      const { selectedTaskId } = useTasksStore.getState()
      expect(selectedTaskId).toBe('task-2')
    })
  })

  describe('State Persistence', () => {
    it('should maintain filters across multiple operations', () => {
      const { setPriorityFilter, setSelectedCategory, setSearchTerm } = useTasksStore.getState()

      setPriorityFilter(CrmTaskPriority.HIGH)
      setSelectedCategory('all')
      setSearchTerm('test')

      const { priorityFilter, searchTerm } = useTasksStore.getState()
      expect(priorityFilter).toBe(CrmTaskPriority.HIGH)
      expect(searchTerm).toBe('test')
    })

    it('should reset properly after clear and set', () => {
      const { setStatusFilter, clearFilters } = useTasksStore.getState()

      setStatusFilter(CrmTaskStatus.PENDING)
      clearFilters()
      setStatusFilter(CrmTaskStatus.COMPLETED)

      const { statusFilter } = useTasksStore.getState()
      expect(statusFilter).toBe(CrmTaskStatus.COMPLETED)
    })
  })
})
