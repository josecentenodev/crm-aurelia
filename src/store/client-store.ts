import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Logger } from '@/lib/utils/client-utils'

interface ClientState {
  selectedClientId: string | null
  lastUpdated: number | null
  isInitialized: boolean
  isHydrated: boolean // Estado para tracking de hidratación
  setSelectedClientId: (clientId: string | null) => void
  clearSelectedClient: () => void
  markAsInitialized: () => void
  markAsHydrated: () => void // Función para marcar como hidratado
}

interface PersistedClientState {
  selectedClientId: string | null
  lastUpdated: number | null
}

export const useClientStore = create<ClientState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        selectedClientId: null,
        lastUpdated: null,
        isInitialized: false,
        isHydrated: false, // Inicialmente no hidratado
        setSelectedClientId: (clientId) => set({ 
          selectedClientId: clientId, 
          lastUpdated: Date.now() 
        }),
        clearSelectedClient: () => set({ 
          selectedClientId: null, 
          lastUpdated: Date.now() 
        }),
        markAsInitialized: () => set({ isInitialized: true }),
        markAsHydrated: () => set({ isHydrated: true }), // Marcar como hidratado
      }),
      {
        name: 'aurelia-client-storage',
        storage: {
          getItem: (name) => {
            if (typeof window === 'undefined') return null
            try {
              const value = sessionStorage.getItem(name)
              return value ? JSON.parse(value) as { state: PersistedClientState } : null
            } catch (error) {
              console.error('Error reading client store from sessionStorage:', error)
              return null
            }
          },
          setItem: (name, value) => {
            if (typeof window === 'undefined') return
            try {
              sessionStorage.setItem(name, JSON.stringify(value))
            } catch (error) {
              console.error('Error writing client store to sessionStorage:', error)
            }
          },
          removeItem: (name) => {
            if (typeof window === 'undefined') return
            try {
              sessionStorage.removeItem(name)
            } catch (error) {
              console.error('Error removing client store from sessionStorage:', error)
            }
          },
        },
        // Solo persistir estos campos
        partialize: (state): PersistedClientState => ({
          selectedClientId: state.selectedClientId,
          lastUpdated: state.lastUpdated,
        }),
        onRehydrateStorage: () => (state) => {
          // Callback cuando se rehidrata el store
          if (state) {
            state.markAsHydrated()
            if (process.env.NODE_ENV === 'development') {
              Logger.log('🔄 Client store rehydrated:', {
                selectedClientId: state.selectedClientId,
                lastUpdated: state.lastUpdated
              })
            }
          }
        },
      }
    )
  )
)

// Suscripción para logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  useClientStore.subscribe(
    (state) => state.selectedClientId,
    (selectedClientId) => {
      Logger.log('🔄 Client store updated:', selectedClientId)
    }
  )
} 