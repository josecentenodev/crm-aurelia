import type {
  // Common
  APIError,
  
  // Backend Management
  HealthCheckResponse,
  DeployContainerRequest,
  DeployContainerResponse,
  Container,
  ContainerActionRequest,
  ContainerActionResponse,
  
  // Client Tags
  ClientTag,
  CreateClientTagRequest,
  UpdateClientTagRequest,
  
  // Instance Management
  CreateInstanceRequest,
  CreateInstanceResponse,
  Instance,
  ConnectionState,
  ConnectInstanceResponse,
  
  // Message Management
  SendTextMessageRequest,
  SendMediaMessageRequest,
  MessageResponse,
  
  // Chat Management
  Chat,
  Message,
  FindChatsQuery,
  FindMessagesQuery,
  
  // Webhook Management
  SetWebhookRequest,
  SetWebhookResponse,
  
  // Users
  User,
  CreateUserRequest,
  UpdateUserRequest,
  
  // Legacy compatibility
  SendMessageResult,
  SendMessagesResult,
  WhatsAppInstanceInfo,
  BasicClientContainerInfo
} from './evolution-api-types'

import { EvolutionWebhookEvent } from './evolution-api-types'

import { env } from '@/env'


export class EvolutionAPIService {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor(baseUrl?: string, apiKey?: string, timeout = 30000) {
    this.baseUrl = baseUrl ?? env.EVOLUTION_API_URL
    this.apiKey = apiKey ?? env.EVOLUTION_API_KEY
    this.timeout = timeout
  }

  // ============================================
  // PRIVATE UTILITIES
  // ============================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      this.logRequest(endpoint, response, options.method ?? 'GET')

      if (!response.ok) {
        const error = await this.parseError(response)
        console.log("error request EvolutionAPI: ", error)
        // Mejorar mensajes de error específicos
        if (response.status === 503) {
          throw new Error(`Evolution API no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos. Si el problema persiste, contacta al soporte técnico.`)
        } else if (response.status === 401) {
          throw new Error(`Error de autenticación con Evolution API. Verifica que la API Key esté configurada correctamente.`)
        } else if (response.status === 404) {
          throw new Error(`Endpoint de Evolution API no encontrado. Verifica la configuración del servidor.`)
        } else if (response.status === 429) {
          throw new Error(`Demasiadas solicitudes a Evolution API. Espera un momento antes de intentar nuevamente.`)
        } else if (response.status >= 500) {
          throw new Error(`Error interno del servidor Evolution API (${response.status}). Contacta al soporte técnico.`)
        }
        
        throw new Error(`${endpoint}: ${error}`)
      }

      return await response.json() as unknown as T
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`${endpoint}: Request timeout after ${this.timeout}ms`)
      }
      
      // Mejorar manejo de errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`${endpoint}: Network error - Cannot connect to Evolution API at ${this.baseUrl}`)
      }
      
      throw error
    }
  }



  private async parseError(response: Response): Promise<string> {
    try {
      const text = await response.text()
      try {
        const error = JSON.parse(text) as APIError
        return error.error || `HTTP ${response.status}`
      } catch {
        return `HTTP ${response.status}: ${text || 'no body'}`
      }
    } catch {
      return `HTTP ${response.status}`
    }
  }

  private logRequest(endpoint: string, response: Response, method: string): void {
    const caller = (new Error()).stack?.split('\n')[3]?.trim() ?? 'unknown'
    console.log(
      `EvolutionAPIService.${method} [${caller}] ${endpoint}:`,
      { ok: response.ok, status: response.status }
    )
  }

  // ============================================
  // BACKEND MANAGEMENT
  // ============================================

  async healthCheck(): Promise<HealthCheckResponse> {
    // El backend devuelve "OK" como texto plano, no JSON
    // Necesitamos manejar esto especialmente
    return this.healthCheckText()
  }

  private async healthCheckText(): Promise<HealthCheckResponse> {
    const url = `${this.baseUrl}/health`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        headers: {
          'X-API-Key': this.apiKey,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      this.logRequest('/health', response, 'GET')

      if (!response.ok) {
        return {
          ok: false,
          status: `HTTP ${response.status}`,
        }
      }

      const textResponse = await response.text()
      
      // El backend devuelve "OK" como texto cuando está saludable
      const isHealthy = textResponse.trim() === 'OK'
      
      return {
        ok: isHealthy,
        status: isHealthy ? 'ok' : textResponse,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          ok: false,
          status: 'timeout'
        }
      }
      
      return {
        ok: false,
        status: error instanceof Error ? error.message : 'unknown error'
      }
    }
  }

  async deployContainer(request: DeployContainerRequest): Promise<DeployContainerResponse> {
    return this.request<DeployContainerResponse>('/deploy', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async listContainers(): Promise<Container[]> {
    return this.request<Container[]>('/containers')
  }

  async containerAction(request: ContainerActionRequest): Promise<ContainerActionResponse> {
    return this.request<ContainerActionResponse>('/containers/action', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // ============================================
  // CLIENT TAGS MANAGEMENT
  // ============================================

  async listClientTags(): Promise<ClientTag[]> {
    return this.request<ClientTag[]>('/client-tags')
  }

  async createClientTag(request: CreateClientTagRequest): Promise<ClientTag> {
    return this.request<ClientTag>('/client-tags', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async updateClientTag(id: number, request: UpdateClientTagRequest): Promise<ClientTag> {
    return this.request<ClientTag>(`/client-tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  }

  async deleteClientTag(id: number): Promise<void> {
    await this.request<void>(`/client-tags/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // EVOLUTION API MIDDLEWARE - INSTANCE MANAGEMENT
  // ============================================

  async createInstance(containerName: string, request: CreateInstanceRequest): Promise<CreateInstanceResponse> {
    return this.request<CreateInstanceResponse>(`/evolution-api/${containerName}/instance/create`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async fetchInstances(containerName: string): Promise<Instance[]> {
    return this.request<Instance[]>(`/evolution-api/${containerName}/instance/fetchInstances`)
  }

  async connectInstance(containerName: string, instanceName: string): Promise<ConnectInstanceResponse> {
    return this.request<ConnectInstanceResponse>(`/evolution-api/${containerName}/instance/connect/${instanceName}`)
  }

  async getConnectionState(containerName: string, instanceName: string): Promise<ConnectionState> {
    console.log(`🔍 DEBUG: Llamando getConnectionState para ${containerName}/${instanceName}`)
    const response = await this.request<ConnectionState>(`/evolution-api/${containerName}/instance/connectionState/${instanceName}`)
    console.log(`🔍 DEBUG: Respuesta de getConnectionState:`, response)
    return response
  }

  async getInstanceInfo(containerName: string, instanceName: string): Promise<Instance> {
    return this.request<Instance>(`/evolution-api/${containerName}/instance/${instanceName}`)
  }

  async deleteInstance(containerName: string, instanceName: string): Promise<void> {
    await this.request<void>(`/evolution-api/${containerName}/instance/delete/${instanceName}`, {
      method: 'DELETE',
    })
  }

  async logoutInstance(containerName: string, instanceName: string): Promise<any> {
    return this.request<any>(`/evolution-api/${containerName}/instance/logout/${instanceName}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private detectMediaType(url: string, fileName?: string): 'image' | 'video' | 'audio' | 'document' {
    // Detectar por extensión del archivo
    const extension = fileName?.toLowerCase().split('.').pop() || url.toLowerCase().split('.').pop()
    
    // Imágenes
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) {
      return 'image'
    }
    
    // Videos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'].includes(extension || '')) {
      return 'video'
    }
    
    // Audio
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'].includes(extension || '')) {
      return 'audio'
    }
    
    // Por defecto, tratar como documento
    return 'document'
  }

  // ============================================
  // EVOLUTION API MIDDLEWARE - MESSAGE MANAGEMENT
  // ============================================

  //TODO: change evolutio-api/${containerName} to evolution-api/${containerId}
  async sendTextMessage(
    containerName: string,
    instanceName: string,
    request: SendTextMessageRequest
  ): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/evolution-api/${containerName}/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async sendMediaMessage(
    containerName: string,
    instanceName: string,
    request: SendMediaMessageRequest
  ): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/evolution-api/${containerName}/message/sendMedia/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // ============================================
  // EVOLUTION API MIDDLEWARE - CHAT MANAGEMENT
  // ============================================

  async findChats(containerName: string, instanceName: string, query?: FindChatsQuery): Promise<Chat[]> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>).toString()}` : ''
    return this.request<Chat[]>(`/evolution-api/${containerName}/chat/findChats/${instanceName}${params}`)
  }

  async findMessages(containerName: string, instanceName: string, query?: FindMessagesQuery): Promise<Message[]> {
    const params = query ? `?${new URLSearchParams(query as Record<string, string>).toString()}` : ''
    return this.request<Message[]>(`/evolution-api/${containerName}/chat/findMessages/${instanceName}${params}`)
  }

  // ============================================
  // EVOLUTION API MIDDLEWARE - WEBHOOK MANAGEMENT
  // ============================================

  async setWebhook(containerName: string, instanceName: string, request: SetWebhookRequest): Promise<SetWebhookResponse> {
    console.log("containerName", containerName)
    console.log("instanceName", instanceName)
    console.log("request", request)
    const formattedRequest = {
      webhook: {
        url: request.url,
        events: request.events,
        enabled: request.enabled
      }
    }
    console.log("formattedRequest", formattedRequest)
    return this.request<SetWebhookResponse>(`/evolution-api/${containerName}/webhook/set/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify(formattedRequest),
    })
  }

  async findWebhook(containerName: string, instanceName: string): Promise<SetWebhookResponse> {
    return this.request<SetWebhookResponse>(`/evolution-api/${containerName}/webhook/find/${instanceName}`)
  }

  // Ensure dispatcher webhook is configured for an instance (idempotent)
  async ensureInstanceDispatcherWebhook(containerName: string, instanceName: string, dispatcherUrl: string): Promise<SetWebhookResponse> {
    try {
      const current = await this.findWebhook(containerName, instanceName)
      if (current && current.url === dispatcherUrl) {
        return current
      }
    } catch (error) {
      // continue to set
      console.log("No se encontró webhook para la instancia", instanceName)
      console.log("Error", error)
    }
    const allEvents = Object.values(EvolutionWebhookEvent)
    return this.setWebhook(containerName, instanceName, {
      url: dispatcherUrl,
      enabled: true,
      events: allEvents as EvolutionWebhookEvent[],
    })
  }

  // Configure external webhook for an instance (replaces existing webhook)
  async configureExternalWebhook(containerName: string, instanceName: string, url: string, events: EvolutionWebhookEvent[]): Promise<SetWebhookResponse> {
    console.log(`Configurando webhook externo para ${instanceName}:`, { url, events })
    return this.setWebhook(containerName, instanceName, {
      url,
      enabled: true,
      events,
    })
  }

  // Get current webhook configuration for an instance
  async getInstanceWebhook(containerName: string, instanceName: string): Promise<SetWebhookResponse | null> {
    try {
      return await this.findWebhook(containerName, instanceName)
    } catch (error) {
      console.log("No se encontró webhook para la instancia", instanceName)
      return null
    }
  }

  // ============================================
  // AUTHENTICATION & USERS
  // ============================================

  async listUsers(): Promise<User[]> {
    return this.request<User[]>('/users')
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async updateUser(id: number, request: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  }

  async deleteUser(id: number): Promise<void> {
    await this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // ============================================
// HIGH-LEVEL TAG OPERATIONS
// ============================================

async addTagToClient(clientId: string, tagName: string, color?: string): Promise<ClientTag> {
  const tags = await this.listClientTags()
  const existing = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase())

  if (existing) return existing

  return this.createClientTag({
    name: tagName,
    description: `Tag for client ${clientId}`,
    label: tagName,
    color: color ?? '#4285F4'
  })
}

async updateClientTagName(id: number, newName: string, color?: string): Promise<ClientTag> {
  return this.updateClientTag(id, { label: newName, color: color ?? '#4285F4' })
}

async removeTag(id: number): Promise<boolean> {
  try {
    await this.deleteClientTag(id)
    return true
  } catch {
    return false
  }
}

// ============================================
// HIGH-LEVEL WEBHOOK OPERATIONS
// ============================================

async configureClientWebhook(
  clientId: string,
  instanceName: string,
  url: string,
  events: EvolutionWebhookEvent[] = [EvolutionWebhookEvent.MESSAGES_UPSERT, EvolutionWebhookEvent.CONNECTION_UPDATE, EvolutionWebhookEvent.QRCODE_UPDATED]
): Promise<SetWebhookResponse> {
  const container = await this.getClientContainer(clientId)
  if (!container?.name) {
    throw new Error('No se encontró contenedor para el cliente')
  }

  return this.setWebhook(container.name, instanceName, {
    url,
    events,
    enabled: true
  })
}

async getClientWebhook(clientId: string, instanceName: string): Promise<SetWebhookResponse | null> {
  const container = await this.getClientContainer(clientId)
  if (!container?.name) return null

  try {
    return this.findWebhook(container.name, instanceName)
  } catch (error) {
    console.error('Error fetching client webhook:', error)
    return null
  }
}

  // ============================================
  // HIGH-LEVEL CLIENT OPERATIONS (Convenience methods)
  // ============================================

  async deployClientContainer(clientId: string): Promise<DeployContainerResponse> {
    return this.deployContainer({
      client_name: clientId,
      auto_create_instance: true,
    })
  }

  async getClientContainer(clientId: string): Promise<BasicClientContainerInfo | null> {
    try {
      const containers = await this.listContainers()
      const clientContainer = containers.find(c => 
        c.name.includes(`evolution_${clientId}_`) || 
        c.client_name === clientId
      )
      
      if (!clientContainer) return null

      return {
        name: clientContainer.name,
        host_port: clientContainer.port ?? '',
        connected: clientContainer.status === 'running'
      }
    } catch (error) {
      console.error('Error getting client container:', error)
      return null
    }
  }

  async createWhatsAppInstanceForClient(
    clientId: string,
    instanceName: string
  ): Promise<WhatsAppInstanceInfo> {
    const container = await this.getClientContainer(clientId)
    if (!container?.name) {
      throw new Error('No se encontró contenedor para el cliente')
    }

    const response = await this.createInstance(container.name, {
      instanceName: instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    })

    return {
      instanceName: response.instance.instanceName,
      status: this.mapInstanceStatus(response.instance.status),
      qrCode: response.qrcode?.base64 ?? response.qrcode?.code
    }
  }

  async getClientInstances(clientId: string): Promise<WhatsAppInstanceInfo[]> {
    const container = await this.getClientContainer(clientId)
    if (!container?.name) return []

    try {
      const instances = await this.fetchInstances(container.name)
      return instances.map(instance => ({
        instanceName: instance.instanceName,
        status: this.mapInstanceStatus(instance.status),
        lastConnected: instance.lastConnected ? new Date(instance.lastConnected) : undefined
      }))
    } catch (error) {
      console.error('Error getting client instances:', error)
      return []
    }
  }

  async deleteWhatsAppInstance(clientId: string, instanceName: string): Promise<void> {
    const container = await this.getClientContainer(clientId)
    if (!container?.name) {
      throw new Error('No se encontró contenedor para el cliente')
    }

    await this.deleteInstance(container.name, instanceName)
  }

  async getClientInstanceQR(clientId: string, instanceName: string): Promise<string> {
    const container = await this.getClientContainer(clientId)
    if (!container?.name) {
      throw new Error('No se encontró contenedor para el cliente')
    }

    const response = await this.connectInstance(container.name, instanceName)
    return response.base64 ?? response.code ?? ''
  }

  // 🔧 NUEVO: Método específico para obtener estado de conexión
  async getInstanceConnectionState(containerName: string, instanceName: string): Promise<ConnectionState> {
    try {
      const response = await this.request<ConnectionState>(
        `/evolution-api/${containerName}/instance/connectionState/${instanceName}`
      )
      
      console.log(`🔍 Estado de conexión para ${instanceName}:`, response)
      return response
    } catch (error) {
      console.error(`❌ Error obteniendo estado de conexión para ${instanceName}:`, error)
      // Retornar estado por defecto en caso de error
      return {
        instance: {
          instanceName: instanceName,
          state: 'close' 
        }
      }
    }
  }

  // 🔧 NUEVO: Método específico para obtener QR sin conectar
  async getInstanceQR(containerName: string, instanceName: string): Promise<string | null> {
    try {
      // 🔧 CORRECCIÓN URGENTE: Obtener QR directamente desde Evolution API
      const response = await this.request<{ qrcode?: string; base64?: string; code?: string }>(
        `/evolution-api/${containerName}/instance/connect/${instanceName}`
      )
      
      console.log(`🔍 QR obtenido para ${instanceName}:`, !!response.qrcode || !!response.base64 || !!response.code)
      console.log(`🔍 Respuesta completa de Evolution API:`, response)
      
      // Retornar el QR code desde Evolution API
      const qrCode = response.qrcode ?? response.base64 ?? response.code ?? ''
      return qrCode.length > 0 ? qrCode : null
    } catch (error) {
      console.error(`❌ Error obteniendo QR para ${instanceName}:`, error)
      
      // Si es un error 503, no devolver null inmediatamente, sino lanzar el error
      // para que el frontend pueda manejar el retry
      if (error instanceof Error && error.message.includes('503')) {
        throw error
      }
      
      return null
    }
  }

  async sendTextMessages(data: {
    instanceName: string,
    number: string,
    messages: string[],
    messageIds: string[],
    clientId: string
  }): Promise<SendMessagesResult> {
    try {
      let container: BasicClientContainerInfo | null = null
      console.log(`🔍 [sendMessage] clientId: ${data.clientId}, container:`, container)
      container = await this.getClientContainer(data.clientId)


      if (!container?.name) {
        return {
          success: false,
          error: 'No se encontró contenedor para la instancia'
        }
      }
      const responses: Array<{
        id: string,
        whatsappId: string
      }> = [];
      let i = 0;
      for (const message of data.messages) {
        const response = await this.sendTextMessage(
          container.name,
          data.instanceName,
          {
            number: data.number,
            text: message
          }
        );
        responses.push({
          id: data.messageIds[i]!,
          whatsappId: response.key.id
        });
        i += 1;
      }
      return {
        success: true,
        data: responses
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al enviar mensaje'
      }
    }
  }
  async sendMessage(data: {
    instanceName: string
    number: string
    text: string
    clientId?: string
    mediaUrl?: string
    fileName?: string
  }): Promise<SendMessageResult> {
    try {
      let container: BasicClientContainerInfo | null = null

      if (data.clientId) {
        container = await this.getClientContainer(data.clientId)
        console.log(`🔍 [sendMessage] clientId: ${data.clientId}, container:`, container)
      } else {
        const clientId = data.instanceName?.split('_')[0]
        if (clientId) {
          container = await this.getClientContainer(clientId)
          console.log(`🔍 [sendMessage] extracted clientId: ${clientId}, container:`, container)
        }
      }

      if (!container?.name) {
        return {
          success: false,
          error: 'No se encontró contenedor para la instancia'
        }
      }

      console.log(`🔍 [sendMessage] Using container: ${container.name}, instance: ${data.instanceName}`)

      // Limpiar el número de teléfono antes de enviar
      const cleanedNumber = this.cleanPhoneNumber(data.number)
      console.log(`🔍 [sendMessage] Original number: ${data.number}, Cleaned: ${cleanedNumber}`)
      let response: MessageResponse

      if (data.mediaUrl) {
        // Detectar el tipo de media basándose en la URL o tipo MIME
        const mediaType = this.detectMediaType(data.mediaUrl, data.fileName)
        response = await this.sendMediaMessage(container.name, data.instanceName, {
          number: cleanedNumber,
          mediatype: mediaType,
          media: data.mediaUrl,
          caption: data.text,
          filename: data.fileName
        })
      } else {
        response = await this.sendTextMessage(container.name, data.instanceName, {
          number: cleanedNumber,
          text: data.text,
          linkPreview: false
        })
      }

      return {
        success: true,
        messageId: response.key.id,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al enviar mensaje'
      }
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Limpia un número de teléfono para WhatsApp
   * Remueve caracteres no válidos como +, espacios, guiones, etc.
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return phoneNumber
    
    // Remover todos los caracteres no numéricos excepto el primer dígito
    let cleaned = phoneNumber.replace(/[^\d]/g, '')
    
    // Si empieza con 0, removerlo
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
    }
    
    // Si no tiene código de país, agregar el código por defecto (Argentina: 54)
    if (cleaned.length < 10) {
      cleaned = '54' + cleaned
    }
    
    return cleaned
  }

  private mapInstanceStatus(status: string): 'open' | 'connecting' | 'disconnected' | 'closed' {
    const statusMap: Record<string, 'open' | 'connecting' | 'disconnected' | 'closed'> = {
      'open': 'open',
      'connected': 'open',
      'connecting': 'connecting',
      'disconnected': 'disconnected',
      'closed': 'closed',
      'close': 'closed'
    }
    return statusMap[status.toLowerCase()] ?? 'closed'
  }

  // ============================================
  // LEGACY COMPATIBILITY METHODS (To be phased out)
  // ============================================

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await this.healthCheck()
      return response.status === 'ok'
    } catch {
      return false
    }
  }

  async checkDockerStatus(): Promise<boolean> {
    try {
      const containers = await this.listContainers()
      return containers.length >= 0 // If we can fetch containers, Docker is working
    } catch {
      return false
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let evolutionAPIServiceSingleton: EvolutionAPIService | null = null

export function getEvolutionAPIService(): EvolutionAPIService {
  evolutionAPIServiceSingleton ??= new EvolutionAPIService()
  return evolutionAPIServiceSingleton
}

export const evolutionAPIService = getEvolutionAPIService()

export default EvolutionAPIService   
