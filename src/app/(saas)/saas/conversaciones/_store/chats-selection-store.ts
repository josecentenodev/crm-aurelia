import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatsSelectionState {
  selectedConversationId: string | null
  setSelectedConversationId: (id: string | null) => void
}

export const useChatsSelectionStore = create<ChatsSelectionState>()(
  persist(
    (set) => ({
      selectedConversationId: null,
      setSelectedConversationId: (id) => set({ selectedConversationId: id })
    }),
    {
      name: 'chats-selection-store',
      partialize: (state) => ({ selectedConversationId: state.selectedConversationId })
    }
  )
)


