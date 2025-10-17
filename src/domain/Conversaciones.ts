import { z } from "zod"
import { ConversationStatus, ConversationType, MessageRole, MessageSenderType, ContactChannel, type InstanceStatus, type Conversation as PrismaConversation } from "@prisma/client"

// Re-export the Prisma enums for consistency
export { ConversationStatus, ConversationType, MessageRole, MessageSenderType, ContactChannel, InstanceStatus } from "@prisma/client"

// ============================================
// TIPOS BASE UNIFICADOS PARA MENSAJES
// ============================================

// Campos base comunes a todos los tipos de mensaje
export const BaseMessageFieldsSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  content: z.string(),
  role: z.nativeEnum(MessageRole),
  senderId: z.string().nullable().optional(),
  senderName: z.string().nullable().optional(),
  senderType: z.nativeEnum(MessageSenderType).nullable().optional(),
  
  // CAMPOS DEL PAYLOAD DE EVOLUTION API
  whatsappId: z.string().nullable().optional(),
  messageType: z.string().nullable().optional(),
  messageSubType: z.string().nullable().optional(),
  messageStatus: z.string().nullable().optional(),
  sentAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
  readStatus: z.string().nullable().optional(),
  readAt: z.date().nullable().optional(),
  readByUserId: z.string().uuid().nullable().optional(),
  evolutionInstanceId: z.string().uuid().nullable().optional(),
  source: z.string().nullable().optional(),
  
  // CAMPOS ESPECÍFICOS POR TIPO DE MENSAJE
  mediaUrl: z.string().nullable().optional(),
  mediaFileName: z.string().nullable().optional(),
  mediaSize: z.number().int().nullable().optional(),
  mediaDuration: z.number().int().nullable().optional(),
  mediaWidth: z.number().int().nullable().optional(),
  mediaHeight: z.number().int().nullable().optional(),
  mediaThumbnail: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  
  // UBICACIÓN
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  locationName: z.string().nullable().optional(),
  
  // CONTACTO
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  
  // REACCIÓN Y ENCUESTA
  reaction: z.string().nullable().optional(),
  pollOptions: z.array(z.string()).nullable().optional(),
  pollResults: z.record(z.number()).nullable().optional(),
  
  metadata: z.record(z.any()).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  feedback: z.string().nullable().optional(),
})

// Schema completo para mensajes de base de datos (Prisma)
export const MessageSchema = BaseMessageFieldsSchema

// Tipo base para todos los mensajes
export type BaseMessage = z.infer<typeof BaseMessageFieldsSchema>

// Tipo principal para mensajes de base de datos
export type Message = BaseMessage

// ============================================
// TIPOS ESPECÍFICOS POR CONTEXTO
// ============================================

// Mensaje para UI (frontend) - metadata simplificada
export interface UIMessage extends Omit<BaseMessage, "metadata"> {
  metadata?: Record<string, unknown> | null
}

// Mensaje temporal para optimistic updates
export interface TemporaryMessage extends Omit<BaseMessage, "id"> {
  id: string // Formato: "temp-{timestamp}"
  isTemporary: true
}

// Mensaje procesado por webhook (antes de guardar en DB)
export interface ProcessedMessage extends Omit<BaseMessage, "id" | "createdAt" | "updatedAt"> {
  shouldProcess: boolean
  phoneNumber?: string
  pushName?: string
  isFromMe: boolean
  messageTimestamp?: number
  messageContent?: string | Record<string, unknown>
  // Campos adicionales para procesamiento
  rawPayload?: Record<string, unknown>
}

// Mensaje de Evolution API (payload del webhook)
export interface EvolutionAPIMessage {
  key: {
    remoteJid: string
    fromMe: boolean
    id: string
  }
  message: {
    conversation?: string
    imageMessage?: {
      caption?: string
      mimetype: string
      url: string
      fileName?: string
      fileLength?: string
      width?: number
      height?: number
      jpegThumbnail?: string
    }
    videoMessage?: {
      caption?: string
      mimetype: string
      url: string
      fileName?: string
      fileLength?: string
      seconds?: number
      width?: number
      height?: number
      jpegThumbnail?: string
    }
    audioMessage?: {
      mimetype: string
      url: string
      fileName?: string
      fileLength?: string
      seconds?: number
    }
    documentMessage?: {
      title?: string
      fileName?: string
      mimetype: string
      url: string
      fileLength?: string
    }
    locationMessage?: {
      degreesLatitude: number
      degreesLongitude: number
      name?: string
      address?: string
    }
    contactMessage?: {
      displayName: string
      vcard: string
    }
    stickerMessage?: {
      url: string
      mimetype: string
      fileLength?: string
      width?: number
      height?: number
      jpegThumbnail?: string
    }
    reactionMessage?: {
      key: {
        remoteJid: string
        fromMe: boolean
        id: string
      }
      text: string
    }
    [key: string]: unknown
  }
  messageTimestamp: number
  status?: 'ERROR' | 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED'
  pushName?: string
  participant?: string
}

// ============================================
// UTILIDADES DE TIPO
// ============================================

// Type guard para identificar mensajes temporales
export function isTemporaryMessage(message: BaseMessage | TemporaryMessage): message is TemporaryMessage {
  return 'isTemporary' in message && message.isTemporary === true
}

// Type guard para identificar mensajes de UI
export function isUIMessage(message: BaseMessage | UIMessage): message is UIMessage {
  return !('isTemporary' in message)
}

// Función para convertir cualquier tipo de mensaje a UIMessage
export function toUIMessage(message: BaseMessage | TemporaryMessage | ProcessedMessage): UIMessage {
  const { metadata, ...rest } = message
  return {
    ...rest,
    metadata: typeof metadata === 'object' ? metadata as Record<string, unknown> : null
  }
}

// Schema para crear un nuevo mensaje
export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  feedback: true,
})

export type CreateMessage = z.infer<typeof CreateMessageSchema>

// Schema para conversaciones (actualizado con enums de Prisma y soporte para instancias)
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable().optional(),
  status: z.nativeEnum(ConversationStatus).default("ACTIVA"),
  type: z.nativeEnum(ConversationType).default("LEAD"),
  contactId: z.string().uuid(),
  agentId: z.string().uuid().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
  
  // CAMPOS DE CANAL E INSTANCIA ACTUALIZADOS
  channel: z.nativeEnum(ContactChannel).default("WHATSAPP"),
  channelInstance: z.string().nullable().optional(), // DEPRECATED: mantener por compatibilidad
  evolutionInstanceId: z.string().uuid().nullable().optional(), // FK principal a EvolutionApiInstance
  
  lastMessageAt: z.date().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  clientId: z.string().uuid(),
  isImportant: z.boolean().default(false),
  isAiActive: z.boolean().default(false), // FIXED: Alineado con Prisma default (false, no true)
  aiConversationId: z.string().nullable().optional(), // ID de conversación de OpenAI
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Conversation = z.infer<typeof ConversationSchema>

// Schema para crear una nueva conversación
export const CreateConversationSchema = ConversationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
})

export type CreateConversation = z.infer<typeof CreateConversationSchema>

// Schema para actualizar una conversación
export const UpdateConversationSchema = CreateConversationSchema.partial()

export type UpdateConversation = z.infer<typeof UpdateConversationSchema>

// SCHEMA PARA CREAR CONVERSACIONES CON INSTANCIA (extendido para formularios)
export const CreateConversationWithInstanceSchema = CreateConversationSchema.extend({
  initialMessage: z.string().optional(), // Mensaje inicial opcional al crear
})

export type CreateConversationWithInstance = z.infer<typeof CreateConversationWithInstanceSchema>

// SCHEMA ESPECÍFICO PARA FORMULARIO DE CREACIÓN DE CONVERSACIONES
// Solo incluye campos que el usuario puede configurar directamente
export const CreateConversationFormSchema = z.object({
  contactId: z.string().min(1, "Debes seleccionar un contacto").uuid("Contacto inválido"),
  evolutionInstanceId: z.string().uuid().nullable().optional(),
  type: z.nativeEnum(ConversationType),
  status: z.nativeEnum(ConversationStatus),
  channel: z.nativeEnum(ContactChannel),
  title: z.string().nullable().optional(),
  isAiActive: z.boolean(),
  initialMessage: z.string().optional(),
})

export type CreateConversationFormInput = z.infer<typeof CreateConversationFormSchema>

// DEFAULTS para el formulario de creación (separados del schema para mejor control de tipos)
export const CREATE_CONVERSATION_FORM_DEFAULTS = {
  contactId: "",
  evolutionInstanceId: null,
  type: "LEAD" as const,
  status: "ACTIVA" as const,
  channel: "WHATSAPP" as const,
  title: null,
  isAiActive: false,
  initialMessage: undefined,
} satisfies Partial<CreateConversationFormInput>

// SCHEMA PARA FILTROS EXTENDIDOS (para tRPC)
export const ConversationFiltersSchema = z.object({
  status: z.nativeEnum(ConversationStatus).optional(),
  type: z.nativeEnum(ConversationType).optional(),
  channel: z.nativeEnum(ContactChannel).optional(),
  contactId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  assignedUserId: z.string().uuid().nullable().optional(), // Allow null for unassigned filter
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
  evolutionInstanceId: z.string().uuid().optional(),
  instanceName: z.string().optional(),
  phoneNumber: z.string().optional(),
  groupByInstance: z.boolean().default(false),
  // NUEVO: Filtros de fecha
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type ConversationFiltersInput = z.infer<typeof ConversationFiltersSchema>

// Conversación con mensajes incluidos
export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

// Filtros para búsqueda de conversaciones (ACTUALIZADOS CON SOPORTE PARA INSTANCIAS)
export interface ConversationFilters {
  status?: ConversationStatus
  type?: ConversationType
  channel?: ContactChannel
  contactId?: string
  agentId?: string
  assignedUserId?: string | null // Allow null for unassigned filter
  clientId?: string
  search?: string
  
  // NUEVOS FILTROS PARA INSTANCIAS
  evolutionInstanceId?: string  // Filtrar por instancia específica
  instanceName?: string         // Filtrar por nombre de instancia  
  phoneNumber?: string          // Filtrar por número de teléfono
  groupByInstance?: boolean     // Agrupar resultados por instancia
  
  // FILTROS DE FECHA
  dateFrom?: Date               // Filtrar conversaciones desde esta fecha
  dateTo?: Date                 // Filtrar conversaciones hasta esta fecha
}

// NUEVOS TIPOS PARA SOPORTAR CONVERSACIONES CON DATOS RELACIONADOS
export interface ConversationWithDetails extends Conversation {
  contact?: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    status: string
    channel: ContactChannel
    stage?: {
      id: string
      name: string
      color?: string | null
    } | null
    pipeline?: {
      id: string
      name: string
    } | null
  } | null
  agent?: {
    id: string
    name: string
    isActive: boolean
  } | null
  assignedUser?: {
    id: string
    name?: string | null
  } | null
  evolutionInstance?: {
    id: string
    instanceName: string
    phoneNumber?: string | null
    status: InstanceStatus
  } | null
  messages?: Message[]
  _count?: {
    messages: number
  }
  // Campos de lectura/no leídos (existentes en Prisma pero ausentes en tipos FE)
  unreadCount: number
  lastReadAt: Date | null
  lastReadMessageId: string | null
  isImportant: boolean
}

// NUEVO TIPO PARA CONVERSACIONES AGRUPADAS POR INSTANCIA
export interface ConversationsByInstance {
  instanceName: string
  phoneNumber?: string | null
  instanceStatus?: InstanceStatus
  instanceId?: string
  conversations: ConversationWithDetails[]
  stats: {
    total: number
    active: number
    paused: number
    finished: number
  }
}

// TIPO PARA INSTANCIAS CON ESTADÍSTICAS
export interface EvolutionInstanceWithStats {
  id: string
  instanceName: string
  phoneNumber?: string | null
  status: InstanceStatus
  lastConnected?: Date | null
  lastMessageAt?: Date | null
  _count: {
    conversations: number
  }
}

// ============================================
// HISTORIAL DE CAMBIOS DE ESTADO
// ============================================

// Schema para historial de cambios de estado
export const ConversationStatusHistorySchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  fromStatus: z.nativeEnum(ConversationStatus).nullable().optional(),
  toStatus: z.nativeEnum(ConversationStatus),
  changedById: z.string().uuid(),
  reason: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  createdAt: z.date(),
})

export type ConversationStatusHistory = z.infer<typeof ConversationStatusHistorySchema>

// Schema para crear un registro de historial
export const CreateConversationStatusHistorySchema = ConversationStatusHistorySchema.omit({
  id: true,
  createdAt: true,
})

export type CreateConversationStatusHistory = z.infer<typeof CreateConversationStatusHistorySchema>

// Historial con información del usuario
export interface ConversationStatusHistoryWithUser extends ConversationStatusHistory {
  changedBy: {
    id: string
    name?: string | null
    email?: string | null
  }
}