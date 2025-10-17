/**
 * Store para estado UI del módulo de conversaciones
 * Maneja estado efímero como grupos colapsados, tabs activos, etc.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStateStore {
  // Conjunto de IDs de instancias colapsadas
  collapsedInstances: Set<string>
  
  // Acciones
  toggleInstanceCollapse: (instanceId: string) => void
  collapseInstance: (instanceId: string) => void
  expandInstance: (instanceId: string) => void
  collapseAll: () => void
  expandAll: () => void
  isInstanceCollapsed: (instanceId: string) => boolean
}

export const useUIStateStore = create<UIStateStore>()(
  persist(
    (set, get) => ({
      collapsedInstances: new Set<string>(),

      toggleInstanceCollapse: (instanceId: string) => {
        set(state => {
          const newSet = new Set(state.collapsedInstances)
          if (newSet.has(instanceId)) {
            newSet.delete(instanceId)
          } else {
            newSet.add(instanceId)
          }
          return { collapsedInstances: newSet }
        })
      },

      collapseInstance: (instanceId: string) => {
        set(state => {
          const newSet = new Set(state.collapsedInstances)
          newSet.add(instanceId)
          return { collapsedInstances: newSet }
        })
      },

      expandInstance: (instanceId: string) => {
        set(state => {
          const newSet = new Set(state.collapsedInstances)
          newSet.delete(instanceId)
          return { collapsedInstances: newSet }
        })
      },

      collapseAll: () => {
        // Nota: No podemos colapsar todos sin saber qué instancias existen
        // Esta función se implementará cuando tengamos el contexto de instancias
        set({ collapsedInstances: new Set<string>() })
      },

      expandAll: () => {
        set({ collapsedInstances: new Set<string>() })
      },

      isInstanceCollapsed: (instanceId: string) => {
        return get().collapsedInstances.has(instanceId)
      }
    }),
    {
      name: 'conversations-ui-state',
      // Serializar Set como Array para localStorage
      partialize: (state) => ({
        collapsedInstances: Array.from(state.collapsedInstances)
      }),
      // Deserializar Array como Set al rehidratar
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.collapsedInstances)) {
          state.collapsedInstances = new Set(state.collapsedInstances as unknown as string[])
        }
      },
    }
  )
)

