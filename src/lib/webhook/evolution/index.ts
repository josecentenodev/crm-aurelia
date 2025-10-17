// ============================================
// WEBHOOK EVOLUTION MODULE - Main Exports
// ============================================

// Core processors
export { WebhookProcessor } from './webhook-processor'
export { MessageProcessor } from './message-processor'
export { ContactManager } from './contact-manager'
export { ConversationManager } from './conversation-manager'
export { MessageStorage } from './message-storage'

// Validation and security
export { WebhookValidator } from './webhook-validator'

// Status management
export { StatusMapper } from './status-mapper'

// Performance optimization
export { QueryOptimizer } from './query-optimizer'
export { ConversationCache, ConversationCacheManager } from './conversation-cache'

// Media processing
export { MediaFileProcessor } from './media-file-processor'

// Utilities
export { ClientCacheManager } from './client-cache'

// Types
export type {
  ProcessedMessage,
  WebhookResult,
  ProcessedMessageResult
} from './types'

// Re-export Prisma types for consistency
export type {
  Contact,
  Conversation,
  Message,
  ContactStatus,
  ConversationStatus,
  ConversationType,
  ContactChannel,
  MessageRole,
  MessageSenderType
} from './types'
