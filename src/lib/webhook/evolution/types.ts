// ============================================
// WEBHOOK TYPES - CENTRALIZED TYPE DEFINITIONS
// ============================================

import { 
  type Contact, 
  type Conversation, 
  type ContactStatus, 
  type ConversationStatus, 
  type ConversationType, 
  type ContactChannel, 
  type MessageRole, 
  type MessageSenderType, 
  type MessageType, 
  type MessageStatus 
} from '@prisma/client'

// Importar tipos unificados desde el dominio
import { 
  type BaseMessage, 
  type ProcessedMessage as DomainProcessedMessage,
  type EvolutionAPIMessage 
} from '@/domain/Conversaciones'

// ============================================
// PROCESSED MESSAGE TYPES (Webhook-specific)
// ============================================

// Extender ProcessedMessage del dominio con campos específicos del webhook
export interface ProcessedMessage extends DomainProcessedMessage {
  // Campos específicos del procesamiento de webhook
  instanceName: string            // instance del payload
  instanceId: string              // data.instanceId
  isGroupMessage: boolean
  event: string
  reason?: string
}

// ============================================
// WEBHOOK RESULT TYPES
// ============================================

export interface WebhookResult {
  success: boolean
  messageType: string
  data?: any
  error?: string
}

export interface ProcessedMessageResult {
  contactId: string
  conversationId: string
  messageId: string
  phoneNumber?: string
  pushName?: string
}

// ============================================
// RE-EXPORT PRISMA TYPES FOR CONSISTENCY
// ============================================

export type {
  Contact,
  Conversation,
  ContactStatus,
  ConversationStatus,
  ConversationType,
  ContactChannel,
  MessageRole,
  MessageSenderType,
  MessageType,
  MessageStatus
}

// Re-export tipos unificados del dominio
export type {
  BaseMessage,
  EvolutionAPIMessage
} from '@/domain/Conversaciones'
