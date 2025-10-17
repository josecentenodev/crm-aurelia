"use client"

import { ChatPanel, ContactInfoPanel, ChatsPageHeader, ChatsSidebar } from '../_features'
import { useChatsSelectionStore } from '../_store/chats-selection-store'

export function ChatsLayout() {
  // Store de selección: coordinación UI entre componentes
  const { selectedConversationId } = useChatsSelectionStore()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header superior con filtros y notificaciones */}
      <ChatsPageHeader />

      {/* Layout principal de 3 columnas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda - Sidebar con categorías y lista */}
        <ChatsSidebar />

        {/* Columna central - Chat activo */}
        <div className="flex-1 flex flex-col">
          <ChatPanel conversationId={selectedConversationId} />
        </div>

        {/* Columna derecha - Información del contacto */}
        <ContactInfoPanel conversationId={selectedConversationId} />
      </div>
    </div>
  )
}
