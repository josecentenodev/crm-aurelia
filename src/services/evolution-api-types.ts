// ============================================
// EVOLUTION API BACKEND - TYPE DEFINITIONS
// Based on Postman documentation
// ============================================

// ============================================
// COMMON TYPES
// ============================================

export interface EvolutionAPIServiceConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
}

export interface APIResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// BACKEND MANAGEMENT
// ============================================

export interface HealthCheckResponse {
  ok: boolean;
  status: string;
  uptime?: number;
  timestamp?: string;
}

export interface DeployContainerRequest {
  client_name: string;
  container_name?: string;
  auto_create_instance?: boolean;
}

export interface DeployContainerResponse {
  container_name: string;
  host_port: string;
  evolution_api_url: string;
  manager_url: string;
  status?: 'running' | 'created';
}

export interface Container {
  name: string;
  status: 'running' | 'stopped' | 'restarting' | 'paused' | 'exited' | 'dead' | 'created' | 'removing';
  port?: string;
  image?: string;
  created_at?: string;
  client_name?: string;
}

export interface ContainerActionRequest {
  container_name: string;
  action: 'start' | 'stop' | 'restart';
}

export interface ContainerActionResponse {
  success: boolean;
  container_name: string;
  action: string;
  status: string;
  message?: string;
}

// ============================================
// CLIENT TAGS MANAGEMENT
// ============================================

export interface ClientTag {
  id: number;
  name: string;
  label: string;
  color: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClientTagRequest {
  name: string;
  label: string;
  color: string;
  description?: string;
}

export interface UpdateClientTagRequest {
  label?: string;
  color?: string;
  description?: string;
}

// ============================================
// EVOLUTION API MIDDLEWARE - INSTANCES
// ============================================

export interface CreateInstanceRequest {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  webhook_url?: string;
  integration?: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  events?: string[];
}

export interface CreateInstanceResponse {
  instance: {
    instanceName: string;
    status: string;
  };
  hash?: {
    instanceName: string;
  };
  webhook?: {
    webhook: string;
    events: string[];
  };
  qrcode?: {
    code?: string;
    base64?: string;
  };
}

export interface Instance {
  instanceName: string;
  status: 'open' | 'connecting' | 'disconnected' | 'closed';
  serverUrl?: string;
  apikey?: string;
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string;
  integration?: string;
  number?: string;
  token?: string;
  clientId?: string;
  lastConnected?: string;
}

export interface ConnectionState {
  instance: InstanceStatus
}

export interface InstanceStatus {
  instanceName: string;
  state: 'open' | 'connecting' | 'close';
}

export interface ConnectInstanceResponse {
  base64?: string;
  code?: string;
  count?: number;
}

// ============================================
// EVOLUTION API MIDDLEWARE - MESSAGES
// ============================================

export interface SendTextMessageRequest {
  number: string;
  text: string;
  linkPreview?: boolean;
  quoted?: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
  };
}

export interface SendMediaMessageRequest {
  number: string;
  mediatype: 'image' | 'video' | 'audio' | 'document';
  media: string; // URL or base64
  caption?: string;
  filename?: string;
}

export interface MessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: unknown;
  messageTimestamp: number;
  status: string;
}

// ============================================
// EVOLUTION API MIDDLEWARE - CHAT
// ============================================

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  isReadOnly: boolean;
  isAnnounce: boolean;
  participant?: unknown[];
  messages?: EvolutionAPIMessage[];
  unreadCount?: number;
  lastMessage?: EvolutionAPIMessage;
}

// Re-export EvolutionAPIMessage desde el dominio unificado
export type { EvolutionAPIMessage as Message } from '@/domain/Conversaciones'

export interface FindChatsQuery {
  where?: {
    owner?: string;
  };
}

export interface FindMessagesQuery {
  number?: string;
  where?: {
    key?: {
      remoteJid?: string;
      fromMe?: boolean;
      id?: string;
    };
  };
  limit?: number;
}

// ============================================
// EVOLUTION API MIDDLEWARE - WEBHOOKS
// ============================================

export interface SetWebhookRequest {
  url: string;
  enabled?: boolean;
  events?: EvolutionWebhookEvent[];
}

export interface SetWebhookResponse {
  id: string
  instanceId: string
  url: string
  enabled: boolean
  events: string[] // o EvolutionWebhookEvent[] si lo querés tipado fuerte con el enum
  headers: Record<string, string> | null
  webhookBase64: boolean
  webhookByEvents: boolean
  createdAt: string // ISO date
  updatedAt: string // ISO date
}

// Tipo completo para el webhook de EvolutionAPI
export interface EvolutionWebhookPayload {
  event: EvolutionWebhookEvent | string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    status?: string;
    message: {
      conversation?: string;
      [key: string]: unknown;
    };
    messageType: string;
    messageTimestamp: number;
    instanceId: string;
    source: string;
  };
  // Campos opcionales que Evolution API puede enviar
  apikey?: string; // API key para autenticación (opcional)
}

export enum EvolutionWebhookEvent {
  APPLICATION_STARTUP = "APPLICATION_STARTUP",
  CALL = "CALL",
  CHATS_DELETE = "CHATS_DELETE",
  CHATS_SET = "CHATS_SET",
  CHATS_UPDATE = "CHATS_UPDATE",
  CHATS_UPSERT = "CHATS_UPSERT",
  CONNECTION_UPDATE = "CONNECTION_UPDATE",
  CONTACTS_SET = "CONTACTS_SET",
  CONTACTS_UPDATE = "CONTACTS_UPDATE",
  CONTACTS_UPSERT = "CONTACTS_UPSERT",
  GROUP_PARTICIPANTS_UPDATE = "GROUP_PARTICIPANTS_UPDATE",
  GROUP_UPDATE = "GROUP_UPDATE",
  GROUPS_UPSERT = "GROUPS_UPSERT",
  LABELS_ASSOCIATION = "LABELS_ASSOCIATION",
  LABELS_EDIT = "LABELS_EDIT",
  LOGOUT_INSTANCE = "LOGOUT_INSTANCE",
  MESSAGES_DELETE = "MESSAGES_DELETE",
  MESSAGES_SET = "MESSAGES_SET",
  MESSAGES_UPDATE = "MESSAGES_UPDATE",
  MESSAGES_UPSERT = "MESSAGES_UPSERT",
  PRESENCE_UPDATE = "PRESENCE_UPDATE",
  QRCODE_UPDATED = "QRCODE_UPDATED",
  REMOVE_INSTANCE = "REMOVE_INSTANCE",
  SEND_MESSAGE = "SEND_MESSAGE",
  TYPEBOT_CHANGE_STATUS = "TYPEBOT_CHANGE_STATUS",
  TYPEBOT_START = "TYPEBOT_START",
}


// ============================================
// AUTHENTICATION & USERS
// ============================================

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  is_super_admin?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  full_name?: string;
  password?: string;
  is_active?: boolean;
  is_super_admin?: boolean;
}

// ============================================
// ERROR HANDLING
// ============================================

export interface APIError {
  error: string;
  status_code?: number;
  details?: unknown;
  timestamp?: string;
}

// ============================================
// LEGACY COMPATIBILITY (To be removed gradually)
// ============================================

export interface SendMessagesResult {
  success: boolean;
  data?: Array<{id: string, whatsappId: string}>
  error?: unknown
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: unknown;
}

export interface WhatsAppInstanceInfo {
  instanceName: string;
  status: 'open' | 'connecting' | 'disconnected' | 'closed';
  qrCode?: string;
  lastConnected?: Date;
}

// Client container info for backward compatibility
export interface BasicClientContainerInfo {
  name: string;
  host_port: string;
  connected: boolean;
}

export interface ClientContainerInfo {
  clientId: string;
  containerName: string;
  hostPort: number;
  evolutionApiUrl: string;
  managerUrl: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR' | 'DEPLOYING' | 'MAINTENANCE';
  lastDeployedAt?: Date;
  lastHealthCheck?: Date;
  isHealthy: boolean;
  errorMessage?: string;
}

export interface EvolutionContainerInfo {
  containerName: string;
  hostPort: number;
  evolutionApiUrl: string;
  managerUrl: string;
  status: 'running' | 'restarting' | 'paused' | 'exited' | 'dead' | 'created' | 'removing' | 'not_found';
}

// Session and container payloads (internal backend structures)
export interface SessionPayload {
  name: string;
  client_name: string;
  host_port: string;
  connected: boolean;
  evolution_api_url: string;
  manager_url: string;
  quick_setup_url: string;
  container_status?: string;
  api_status?: string;
}

export interface ContainerPayload {
  name: string;
  status: string;
  port?: string;
  image?: string;
}

export interface WebHookEventPayload<T = unknown> {
  event: EvolutionWebhookEvent | string
  data: T
  [key: string]: unknown // campos adicionales que puedan venir
}

export type StatusByClientResponse = BasicClientContainerInfo[];
