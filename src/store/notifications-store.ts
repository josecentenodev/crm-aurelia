import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Logger } from '@/lib/utils/client-utils'
import type { NotificationFilters } from '@/domain/Notificaciones'

interface NotificationState {
  // Filtros activos
  filters: NotificationFilters

  // Estado de UI
  isNotificationPanelOpen: boolean

  // Contador de no leídas (para badge)
  unreadCount: number

  // Estado de hidratación
  isHydrated: boolean

  // Acciones
  setFilters: (filters: Partial<NotificationFilters>) => void
  clearFilters: () => void
  setIsNotificationPanelOpen: (isOpen: boolean) => void
  toggleNotificationPanel: () => void
  setUnreadCount: (count: number) => void
  incrementUnreadCount: () => void
  decrementUnreadCount: (amount?: number) => void
  markAsHydrated: () => void
}

interface PersistedNotificationState {
  filters: NotificationFilters
  unreadCount: number
}

const defaultFilters: NotificationFilters = {
  read: undefined,
  type: undefined,
  priority: undefined,
  category: undefined,
  limit: 50,
  offset: 0
}

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Estado inicial
        filters: defaultFilters,
        isNotificationPanelOpen: false,
        unreadCount: 0,
        isHydrated: false,

        // Acciones
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters }
          })),

        clearFilters: () =>
          set({ filters: defaultFilters }),

        setIsNotificationPanelOpen: (isOpen) =>
          set({ isNotificationPanelOpen: isOpen }),

        toggleNotificationPanel: () =>
          set((state) => ({
            isNotificationPanelOpen: !state.isNotificationPanelOpen
          })),

        setUnreadCount: (count) =>
          set({ unreadCount: Math.max(0, count) }),

        incrementUnreadCount: () =>
          set((state) => ({
            unreadCount: state.unreadCount + 1
          })),

        decrementUnreadCount: (amount = 1) =>
          set((state) => ({
            unreadCount: Math.max(0, state.unreadCount - amount)
          })),

        markAsHydrated: () =>
          set({ isHydrated: true })
      }),
      {
        name: 'aurelia-notification-storage',
        storage: {
          getItem: (name) => {
            if (typeof window === 'undefined') return null
            try {
              const value = localStorage.getItem(name)
              return value ? JSON.parse(value) as { state: PersistedNotificationState } : null
            } catch (error) {
              console.error('Error reading notification store from localStorage:', error)
              return null
            }
          },
          setItem: (name, value) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.setItem(name, JSON.stringify(value))
            } catch (error) {
              console.error('Error writing notification store to localStorage:', error)
            }
          },
          removeItem: (name) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.removeItem(name)
            } catch (error) {
              console.error('Error removing notification store from localStorage:', error)
            }
          }
        },
        // Solo persistir estos campos
        partialize: (state): PersistedNotificationState => ({
          filters: state.filters,
          unreadCount: state.unreadCount
        }),
        onRehydrateStorage: () => (state) => {
          // Callback cuando se rehidrata el store
          if (state) {
            state.markAsHydrated()
            if (process.env.NODE_ENV === 'development') {
              Logger.log('🔔 Notification store rehydrated:', {
                filters: state.filters,
                unreadCount: state.unreadCount
              })
            }
          }
        }
      }
    )
  )
)

// Suscripción para logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  useNotificationStore.subscribe(
    (state) => state.unreadCount,
    (unreadCount) => {
      Logger.log('🔔 Unread notifications count updated:', unreadCount)
    }
  )

  useNotificationStore.subscribe(
    (state) => state.filters,
    (filters) => {
      Logger.log('🔔 Notification filters updated:', filters)
    }
  )
}
