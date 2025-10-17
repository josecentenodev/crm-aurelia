import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CrmTaskStatus, CrmTaskPriority, CrmTaskFilters } from '@/domain/Tareas'

type TaskCategory = 'all' | 'my-tasks' | 'pending' | 'in-progress' | 'completed' | 'overdue'

interface TasksStoreState {
  // Filtros básicos
  searchTerm: string
  selectedCategory: TaskCategory

  // Filtros avanzados
  statusFilter?: CrmTaskStatus
  priorityFilter?: CrmTaskPriority
  ownerFilter?: string
  relatedContactFilter?: string
  relatedConversationFilter?: string
  relatedOpportunityFilter?: string
  dueDateFromFilter?: Date
  dueDateToFilter?: Date

  // Tarea seleccionada
  selectedTaskId?: string

  // Acciones
  setSearchTerm: (term: string) => void
  setSelectedCategory: (category: TaskCategory) => void
  setStatusFilter: (status?: CrmTaskStatus) => void
  setPriorityFilter: (priority?: CrmTaskPriority) => void
  setOwnerFilter: (owner?: string) => void
  setRelatedContactFilter: (contactId?: string) => void
  setRelatedConversationFilter: (conversationId?: string) => void
  setRelatedOpportunityFilter: (opportunityId?: string) => void
  setDueDateFromFilter: (date?: Date) => void
  setDueDateToFilter: (date?: Date) => void
  setSelectedTaskId: (taskId?: string) => void
  clearFilters: () => void
  resetToDefaults: () => void

  // Nueva función para obtener filtros en formato tRPC
  getTrpcFilters: () => CrmTaskFilters
}

const defaultFilters = {
  searchTerm: '',
  selectedCategory: 'all' as TaskCategory,
  statusFilter: undefined,
  priorityFilter: undefined,
  ownerFilter: undefined,
  relatedContactFilter: undefined,
  relatedConversationFilter: undefined,
  relatedOpportunityFilter: undefined,
  dueDateFromFilter: undefined,
  dueDateToFilter: undefined,
  selectedTaskId: undefined,
}

export const useTasksStore = create<TasksStoreState>()(
  persist(
    (set, get) => ({
      ...defaultFilters,

      setSearchTerm: (term) => set({ searchTerm: term }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setPriorityFilter: (priority) => set({ priorityFilter: priority }),
      setOwnerFilter: (owner) => set({ ownerFilter: owner }),
      setRelatedContactFilter: (contactId) => set({ relatedContactFilter: contactId }),
      setRelatedConversationFilter: (conversationId) => set({ relatedConversationFilter: conversationId }),
      setRelatedOpportunityFilter: (opportunityId) => set({ relatedOpportunityFilter: opportunityId }),
      setDueDateFromFilter: (date) => set({ dueDateFromFilter: date }),
      setDueDateToFilter: (date) => set({ dueDateToFilter: date }),
      setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

      clearFilters: () => set({
        searchTerm: '',
        statusFilter: undefined,
        priorityFilter: undefined,
        ownerFilter: undefined,
        relatedContactFilter: undefined,
        relatedConversationFilter: undefined,
        relatedOpportunityFilter: undefined,
        dueDateFromFilter: undefined,
        dueDateToFilter: undefined,
      }),

      resetToDefaults: () => set(defaultFilters),

      // Función optimizada para combinar todos los filtros en formato tRPC
      getTrpcFilters: () => {
        const state = get()
        const filters: CrmTaskFilters = {}

        // Filtro de búsqueda
        if (state.searchTerm.trim()) {
          filters.search = state.searchTerm.trim()
        }

        // Filtros avanzados (solo aplicar si no hay conflicto con categorías)
        const hasCategoryFilter = state.selectedCategory !== 'all' && state.selectedCategory !== 'my-tasks'

        if (state.statusFilter && !hasCategoryFilter) {
          filters.status = state.statusFilter
        }

        if (state.priorityFilter) {
          filters.priority = state.priorityFilter
        }

        if (state.ownerFilter) {
          filters.ownerId = state.ownerFilter
        }

        if (state.relatedContactFilter) {
          filters.relatedContactId = state.relatedContactFilter
        }

        if (state.relatedConversationFilter) {
          filters.relatedConversationId = state.relatedConversationFilter
        }

        if (state.relatedOpportunityFilter) {
          filters.relatedOpportunityId = state.relatedOpportunityFilter
        }

        if (state.dueDateFromFilter) {
          filters.dueDateFrom = state.dueDateFromFilter
        }

        if (state.dueDateToFilter) {
          filters.dueDateTo = state.dueDateToFilter
        }

        // Filtros de categoría (tienen prioridad sobre filtros avanzados)
        switch (state.selectedCategory) {
          case 'my-tasks':
            // This will be handled by using the myTasks endpoint instead
            break
          case 'pending':
            filters.status = 'PENDING'
            break
          case 'in-progress':
            filters.status = 'IN_PROGRESS'
            break
          case 'completed':
            filters.status = 'COMPLETED'
            break
          case 'overdue':
            filters.dueDateTo = new Date()
            filters.status = 'PENDING' // Only show overdue tasks that are still pending
            break
          case 'all':
          default:
            // No aplicar filtros adicionales de categoría
            break
        }

        return filters
      }
    }),
    {
      name: 'tasks-filters',
      partialize: (state) => ({
        searchTerm: state.searchTerm,
        selectedCategory: state.selectedCategory,
        statusFilter: state.statusFilter,
        priorityFilter: state.priorityFilter,
        ownerFilter: state.ownerFilter,
        relatedContactFilter: state.relatedContactFilter,
        relatedConversationFilter: state.relatedConversationFilter,
        relatedOpportunityFilter: state.relatedOpportunityFilter,
        selectedTaskId: state.selectedTaskId,
      }),
    }
  )
)
