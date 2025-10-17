import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConversationFilters, ConversationStatus, ContactChannel } from '@/domain/Conversaciones'
import { getDateRange } from '../_utils/date-helpers'
import { debounce } from '../_utils/debounce'

type ChatCategory = 'all' | 'unassigned' | 'mine' | 'new' | 'archived'

interface ChatsFiltersState {
  // Filtros básicos
  searchTerm: string
  dateFilter: string
  selectedCategory: ChatCategory

  // Filtros avanzados
  statusFilter?: string
  channelFilter?: string
  instanceFilter?: string
  phoneNumberFilter?: string

  // UI State
  isFiltersOpen: boolean
  activeFiltersCount: number
  categoryCounts: Record<string, number>

  // Acciones
  setSearchTerm: (term: string) => void
  setDateFilter: (filter: string) => void
  setSelectedCategory: (category: ChatCategory) => void
  setStatusFilter: (status?: string) => void
  setChannelFilter: (channel?: string) => void
  setInstanceFilter: (instance?: string) => void
  setPhoneNumberFilter: (phone?: string) => void
  clearFilters: () => void
  resetToDefaults: () => void
  toggleFilters: () => void
  updateActiveFiltersCount: () => void
  setCategoryCounts: (counts: Record<string, number>) => void

  // Función pura para obtener filtros en formato tRPC
  getTrpcFilters: () => ConversationFilters
}

const defaultFilters = {
  searchTerm: '',
  dateFilter: 'today',
  selectedCategory: 'all' as ChatCategory,
  statusFilter: undefined,
  channelFilter: undefined,
  instanceFilter: undefined,
  phoneNumberFilter: undefined,
  isFiltersOpen: false,
  activeFiltersCount: 0,
  categoryCounts: {
    all: 0, unassigned: 0, mine: 0, new: 0, archived: 0
  } as Record<string, number>,
}

// Helper para calcular activeFiltersCount de forma optimizada
const calculateActiveFiltersCount = (state: ChatsFiltersState): number => {
  let count = 0
  if (state.searchTerm.trim()) count++
  if (state.statusFilter) count++
  if (state.channelFilter) count++
  if (state.instanceFilter) count++
  if (state.phoneNumberFilter) count++
  return count
}

export const useChatsFiltersStore = create<ChatsFiltersState>()(
  persist(
    (set, get) => {
      // Debounced version de updateActiveFiltersCount para evitar calls frecuentes
      const debouncedUpdateActiveFiltersCount = debounce(() => {
        const state = get()
        const count = calculateActiveFiltersCount(state)
        set({ activeFiltersCount: count })
      }, 100)

      return {
        ...defaultFilters,

        setSearchTerm: (term) => {
          set({ searchTerm: term })
          debouncedUpdateActiveFiltersCount()
        },

        setDateFilter: (filter) => {
          set({ dateFilter: filter })
          debouncedUpdateActiveFiltersCount()
        },

        setSelectedCategory: (category) => {
          set({ selectedCategory: category })
          debouncedUpdateActiveFiltersCount()
        },

        setStatusFilter: (status) => {
          set({ statusFilter: status })
          debouncedUpdateActiveFiltersCount()
        },

        setChannelFilter: (channel) => {
          set({ channelFilter: channel })
          debouncedUpdateActiveFiltersCount()
        },

        setInstanceFilter: (instance) => {
          set({ instanceFilter: instance })
          debouncedUpdateActiveFiltersCount()
        },

        setPhoneNumberFilter: (phone) => {
          set({ phoneNumberFilter: phone })
          debouncedUpdateActiveFiltersCount()
        },

        clearFilters: () => {
          set({
            searchTerm: '',
            statusFilter: undefined,
            channelFilter: undefined,
            instanceFilter: undefined,
            phoneNumberFilter: undefined,
            activeFiltersCount: 0,
          })
        },

        resetToDefaults: () => {
          set(defaultFilters)
        },

        toggleFilters: () => set(state => ({ isFiltersOpen: !state.isFiltersOpen })),

        updateActiveFiltersCount: () => {
          debouncedUpdateActiveFiltersCount()
        },

        setCategoryCounts: (counts: Record<string, number>) => {
          set({ categoryCounts: counts })
        },

        // Función pura para combinar todos los filtros en formato tRPC
        // NO actualiza estado durante lectura (evita el error de setState durante render)
        getTrpcFilters: (): ConversationFilters => {
          const state = get()

          const filters: ConversationFilters = {
            groupByInstance: true,
          }

          // Filtro de búsqueda
          if (state.searchTerm.trim()) {
            filters.search = state.searchTerm.trim()
          }

          // Filtros avanzados
          if (state.statusFilter) {
            filters.status = state.statusFilter as ConversationStatus
          }

          if (state.channelFilter) {
            filters.channel = state.channelFilter as ContactChannel
          }

          if (state.instanceFilter) {
            filters.evolutionInstanceId = state.instanceFilter
          }

          if (state.phoneNumberFilter) {
            filters.phoneNumber = state.phoneNumberFilter
          }

          // Filtro de fecha
          if (state.dateFilter && state.dateFilter !== 'all') {
            const dateRange = getDateRange(state.dateFilter as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all')
            if (dateRange) {
              filters.dateFrom = dateRange.from
              filters.dateTo = dateRange.to
            }
          }

          // NOTA: Los filtros de categoría NO se envían al backend.
          // El filtrado por categoría se hace en el cliente (useConversationsFiltering hook)
          // para poder calcular correctamente los conteos de todas las categorías.
          // Solo los filtros avanzados se envían al backend para optimizar la query inicial.

          return filters
        }
      }
    },
    {
      name: 'chats-filters-store',
      partialize: (state) => ({
        searchTerm: state.searchTerm,
        dateFilter: state.dateFilter,
        selectedCategory: state.selectedCategory,
        statusFilter: state.statusFilter,
        channelFilter: state.channelFilter,
        instanceFilter: state.instanceFilter,
        phoneNumberFilter: state.phoneNumberFilter,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalcular activeFiltersCount al rehidratar
          state.activeFiltersCount = calculateActiveFiltersCount(state)
        }
      },
    }
  )
)