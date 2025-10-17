// Configuración para Evolution API
export const EVOLUTION_CONFIG = {
  // URL base del backend de Evolution API
  BASE_URL: process.env.EVOLUTION_API_URL || 'http://localhost:5001',
  
  // API Key para autenticación
  API_KEY: process.env.EVOLUTION_API_KEY || 'supersecrettoken',
  
  // Timeout para requests
  TIMEOUT: 30000, // 30 segundos
  
  // Configuración de reintentos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  
  // Configuración de health check
  HEALTH_CHECK_INTERVAL: 30000, // 30 segundos
  
  // Configuración de contenedores
  CONTAINER: {
    IMAGE: 'evoapicloud/evolution-api:latest',
    NETWORK: 'evolution_network',
    PORTS: {
      START: 30000,
      END: 60000
    }
  },
  
  // Configuración de instancias WhatsApp
  WHATSAPP: {
    QR_CODE_EXPIRY: 300000, // 5 minutos en ms
    CONNECTION_TIMEOUT: 60000, // 1 minuto
    MAX_INSTANCES_PER_CONTAINER: 10
  },
  
  // Configuración de webhooks
  WEBHOOK: {
    EVENTS: [
      'qrcode.updated',
      'messages.set',
      'messages.upsert',
      'connection.update'
    ]
  }
} as const

// Tipos de eventos de Evolution API
export const EVOLUTION_EVENTS = {
  QRCODE_UPDATED: 'qrcode.updated',
  MESSAGES_SET: 'messages.set',
  MESSAGES_UPSERT: 'messages.upsert',
  CONNECTION_UPDATE: 'connection.update',
  INSTANCE_CREATED: 'instance.created',
  INSTANCE_DELETED: 'instance.deleted'
} as const

// Estados de conexión de WhatsApp
export const WHATSAPP_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  ERROR: 'error'
} as const

// Estados de contenedores
export const CONTAINER_STATUS = {
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
  DEPLOYING: 'DEPLOYING',
  MAINTENANCE: 'MAINTENANCE'
} as const

// Configuración de límites por defecto
export const DEFAULT_PLAN_LIMITS = {
  BASIC: {
    maxWhatsAppInstances: 1,
    maxAgents: 2,
    maxContacts: 100,
    maxUsers: 3,
    costPerWhatsAppInstance: 10.0,
    costPerAgent: 5.0,
    costPerContact: 0.1,
    costPerUser: 15.0
  },
  PREMIUM: {
    maxWhatsAppInstances: 5,
    maxAgents: 10,
    maxContacts: 1000,
    maxUsers: 10,
    costPerWhatsAppInstance: 8.0,
    costPerAgent: 4.0,
    costPerContact: 0.05,
    costPerUser: 12.0
  },
  ENTERPRISE: {
    maxWhatsAppInstances: 20,
    maxAgents: 50,
    maxContacts: 10000,
    maxUsers: 100,
    costPerWhatsAppInstance: 5.0,
    costPerAgent: 3.0,
    costPerContact: 0.02,
    costPerUser: 10.0
  }
} as const 