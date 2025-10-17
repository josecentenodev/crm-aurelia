import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConversationStatus, ContactChannel, ConversationFilters } from '@/domain/Conversaciones'

type ConversationCategory = 'all' | 'unassigned' | 'mine' | 'new' | 'archived'

interface ConversationsFiltersState {
  // Filtros básicos
  searchTerm: string
  dateFilter: string
  selectedCategory: ConversationCategory
  
  // Filtros avanzados
  statusFilter?: ConversationStatus
  channelFilter?: ContactChannel
  instanceFilter?: string
  phoneNumberFilter?: string
  
  // Acciones
  setSearchTerm: (term: string) => void
  setDateFilter: (filter: string) => void
  setSelectedCategory: (category: ConversationCategory) => void
  setStatusFilter: (status?: ConversationStatus) => void
  setChannelFilter: (channel?: ContactChannel) => void
  setInstanceFilter: (instance?: string) => void
  setPhoneNumberFilter: (phone?: string) => void
  clearFilters: () => void
  resetToDefaults: () => void
  
  // Nueva función para obtener filtros en formato tRPC
  getTrpcFilters: () => ConversationFilters
}

const defaultFilters = {
  searchTerm: '',
  dateFilter: 'month',
  selectedCategory: 'all' as ConversationCategory,
  statusFilter: undefined,
  channelFilter: undefined,
  instanceFilter: undefined,
  phoneNumberFilter: undefined,
}

export const useConversationsFiltersStore = create<ConversationsFiltersState>()(
  persist(
    (set, get) => ({
      ...defaultFilters,
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      setDateFilter: (filter) => set({ dateFilter: filter }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setStatusFilter: (status) => set({ statusFilter: status }),
      setChannelFilter: (channel) => set({ channelFilter: channel }),
      setInstanceFilter: (instance) => set({ instanceFilter: instance }),
      setPhoneNumberFilter: (phone) => set({ phoneNumberFilter: phone }),
      
      clearFilters: () => set({
        searchTerm: '',
        statusFilter: undefined,
        channelFilter: undefined,
        instanceFilter: undefined,
        phoneNumberFilter: undefined,
      }),
      
      resetToDefaults: () => set(defaultFilters),
      
      // Función optimizada para combinar todos los filtros en formato tRPC
      getTrpcFilters: () => {
        const state = get()
        const filters: ConversationFilters = {
          groupByInstance: true, // Siempre agrupar por instancia
        }
        
        // Filtro de búsqueda
        if (state.searchTerm.trim()) {
          filters.search = state.searchTerm.trim()
        }
        
        // Filtros avanzados (solo aplicar si no hay conflicto con categorías)
        const hasCategoryFilter = state.selectedCategory !== 'all'
        
        if (state.statusFilter && !hasCategoryFilter) {
          filters.status = state.statusFilter
        }
        
        if (state.channelFilter) {
          filters.channel = state.channelFilter
        }
        
        if (state.instanceFilter) {
          filters.evolutionInstanceId = state.instanceFilter
        }
        
        if (state.phoneNumberFilter) {
          filters.phoneNumber = state.phoneNumberFilter
        }
        
        // Filtros de categoría (tienen prioridad sobre filtros avanzados)
        switch (state.selectedCategory) {
          case 'unassigned':
            filters.assignedUserId = null // Filtrar conversaciones sin asignar
            break
          case 'mine':
            // TODO: Implementar cuando tengamos sistema de permisos
            // Por ahora, no aplicamos filtro específico
            break
          case 'new':
            filters.status = 'ACTIVA'
            break
          case 'archived':
            filters.status = 'ARCHIVADA'
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
      name: 'conversations-filters',
      partialize: (state) => ({
        searchTerm: state.searchTerm,
        dateFilter: state.dateFilter,
        selectedCategory: state.selectedCategory,
        statusFilter: state.statusFilter,
        channelFilter: state.channelFilter,
        instanceFilter: state.instanceFilter,
        phoneNumberFilter: state.phoneNumberFilter,
      }),
    }
  )
)
