/**
 * Tipos específicos del módulo de conversaciones (UI Layer)
 * 
 * ESTRATEGIA DE ARQUITECTURA:
 * ===========================
 * 
 * Este archivo contiene SOLO tipos de presentación (UI):
 * - Props de componentes React
 * - Estado de hooks personalizados
 * - ViewModels optimizados para rendering
 * - Tipos derivados específicos de la interfaz
 * 
 * TIPOS DE DOMINIO:
 * =================
 * Los tipos de negocio (entidades, DTOs, validaciones) están en:
 * @domain/Conversaciones - Contratos de API, schemas Zod, entidades Prisma
 * 
 * REGLA DE ORO:
 * =============
 * - SI es un contrato de API/tRPC → @domain/
 * - SI es una entidad de base de datos → @domain/
 * - SI es un enum de Prisma → @domain/
 * - SI es un schema de validación → @domain/
 * - SI es un prop de componente → _types/ (aquí)
 * - SI es estado de hook → _types/ (aquí)
 * - SI es optimización de UI → _types/ (aquí)
 * 
 * Esto mantiene separación limpia de capas y facilita evolución independiente.
 */

import type { 
  ConversationStatus, 
  ConversationType, 
  ContactChannel,
  ConversationFilters  // ← Importar desde domain en lugar de duplicar
} from "@/domain/Conversaciones"

// ============================================
// TIPOS DE FILTROS - USAR DESDE DOMAIN
// ============================================
// NOTA: ChatFilters fue eliminado - usar ConversationFilters desde @domain/
// ConversationFilters es más completo y evita duplicación

// ============================================
// TIPOS DE DATOS OPTIMIZADOS PARA UI
// ============================================

/**
 * Representación optimizada de conversación para la interfaz de usuario.
 * 
 * NOTA: Difiere de ConversationWithDetails (@domain/) en aspectos clave:
 * 
 * 1. `assignedUser.name` es string (no nullable) - La UI siempre muestra un nombre
 * 2. `evolutionInstance.status` es string genérico - Flexibilidad para diferentes estados de UI
 * 3. Excluye campos internos como `messages`, `lastReadAt` - No necesarios en listados
 * 4. Incluye solo campos esenciales para renderizado eficiente
 * 
 * Esta separación permite:
 * - Optimizaciones de rendering sin afectar el dominio
 * - Transformaciones específicas de UI sin contaminar contratos de API
 * - Cambios de UI sin modificar tipos de backend
 * 
 * @see ConversationWithDetails para el tipo completo de dominio
 */
export interface ChatConversation {
  id: string
  title?: string | null
  status: ConversationStatus
  type: ConversationType
  channel: ContactChannel
  lastMessageAt?: Date | null
  unreadCount: number
  isAiActive: boolean
  isImportant: boolean
  createdAt: Date
  updatedAt: Date
  
  // Relaciones optimizadas
  contact: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    status: string
    stage?: {
      id: string
      name: string
      color?: string | null
    } | null
  }
  
  agent?: {
    id: string
    name: string
    isActive: boolean
  } | null
  
  assignedUser?: {
    id: string
    name: string | null
    email?: string | null
  } | null
  
  evolutionInstance?: {
    id: string
    instanceName: string
    phoneNumber?: string | null
    status: string
  } | null
  
  _count?: {
    messages: number
  }
}

/**
 * Agrupación de conversaciones por instancia de Evolution API para la UI.
 * 
 * Usa ChatConversation[] en lugar de ConversationWithDetails[] del dominio
 * para mantener consistencia con las optimizaciones de UI.
 * 
 * @see ConversationsByInstance para el tipo de dominio equivalente
 */
export interface ChatConversationsByInstance {
  instanceName: string
  phoneNumber?: string | null
  instanceStatus?: string // Hacer opcional para compatibilidad con backend
  instanceId?: string
  conversations: ChatConversation[]
  stats: {
    total: number
    active: number
    paused: number
    finished: number
  }
}

// ============================================
// TIPOS DE UTILIDADES
// ============================================

export type ConversationCategory = 'all' | 'unassigned' | 'mine' | 'new' | 'archived'

export interface CategoryCounts {
  all: number
  unassigned: number
  mine: number
  new: number
  archived: number
}

// ============================================
// TIPOS PARA EL LAYOUT PRINCIPAL
// ============================================

// Tipos para el estado de conexión avanzado
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'

export interface ConnectionState {
  status: ConnectionStatus
  isStable: boolean
  retryCount: number
  lastError: string | null
  lastConnectedAt: Date | null
  canReconnect: boolean
}

/**
 * Props para ChatsSidebar - Actualmente vacío
 * El componente obtiene todo del contexto/stores globales
 */
export type ChatsSidebarProps = Record<string, never>

export interface ContactInfoPanelProps {
  conversationId: string | null
  onConversationUpdate?: (updatedConversation: ChatConversation) => void
  onCategoryCountsUpdate?: (counts: Record<string, number>) => void
}

export interface ChatPanelProps {
  conversationId: string | null
  onClose?: () => void
  showCloseButton?: boolean
}

export interface ConversationCardProps {
  conversation: ChatConversation
  isSelected: boolean
  onClick: () => void
  showInstanceInfo?: boolean
}

export interface ComposerProps {
  disabled: boolean
  onSend: (value: string) => void
  onFileSelect?: (file: File, type: 'image' | 'document') => void
}

export interface MessageItemProps {
  message: {
    id: string
    content: string
    createdAt: Date | string
    updatedAt: Date | string
    messageType?: string | null
    messageSubType?: string | null
    messageStatus?: string | null
    role?: string | null
    senderType?: string | null
    // Campos de media: aceptan null del dominio, se convierten a undefined para MessageDisplay
    mediaUrl?: string | null | undefined
    mediaFileName?: string | null | undefined
    mediaSize?: number | null | undefined
    mediaDuration?: number | null | undefined
    mediaWidth?: number | null | undefined
    mediaHeight?: number | null | undefined
    mediaThumbnail?: string | null | undefined
    caption?: string | null | undefined
    title?: string | null | undefined
    description?: string | null | undefined
    latitude?: number | null | undefined
    longitude?: number | null | undefined
    locationName?: string | null | undefined
    contactName?: string | null | undefined
    contactPhone?: string | null | undefined
    reaction?: string | null | undefined
    pollOptions?: string[] | null | undefined
  }
  isContact: boolean
}

export interface MessageListProps {
  messages: Array<{
    id: string
    content: string
    createdAt: Date | string
    updatedAt: Date | string
    senderType?: string | null
    role?: string | null
    messageType?: string | null
    messageStatus?: string | null
    // Campos opcionales para compatibilidad con TemporaryMessage
    conversationId?: string
    isTemporary?: boolean
  }>
  isTyping: boolean
  isAiTyping?: boolean
  typingStartTime?: number | null
}

export interface ChatHeaderProps {
  conversacion: ChatConversation
  iaActiva: boolean
  onToggleIa: () => void
  onClose?: () => void
  showCloseButton?: boolean
  onMarkRead: () => void
  unreadCount?: number
}