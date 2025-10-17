import { logger } from '@/lib/utils/server-logger'
import { webhookAccessCache } from './auto-cleanup-cache'

export interface WebhookValidationResult {
  isValid: boolean
  errorType?: string
  errorMessage?: string
  clientId?: string
  instanceName?: string
}

export class WebhookValidator {
  /**
   * Validación rápida de UUID sin regex
   */
  private static isValidUUID(str: string): boolean {
    if (!str || str.length !== 36) return false
    return str[8] === '-' && str[13] === '-' && str[18] === '-' && str[23] === '-'
  }

  /**
   * Validación rápida de instanceName sin regex
   */
  private static isValidInstanceName(str: string): boolean {
    if (!str || str.length > 50) return false
    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      if (!/[a-zA-Z0-9-_]/.test(char)) return false
    }
    return true
  }

  /**
   * Valida la autenticación y estructura básica del webhook
   */
  static async validateWebhook(
    request: Request,
    clientId: string,
    instanceName: string
  ): Promise<WebhookValidationResult> {
    try {
      // 1. Validar método HTTP
      if (request.method !== 'POST') {
        return {
          isValid: false,
          errorType: 'method_not_allowed',
          errorMessage: 'Solo se permiten requests POST'
        }
      }

      // 2. Validar parámetros básicos
      if (!clientId || !instanceName) {
        return {
          isValid: false,
          errorType: 'invalid_url_params',
          errorMessage: 'Parámetros de URL requeridos'
        }
      }

      // 3. Validación rápida de formato UUID
      if (!this.isValidUUID(clientId)) {
        return {
          isValid: false,
          errorType: 'invalid_client_id',
          errorMessage: 'ClientId debe ser un UUID válido'
        }
      }

      // 4. Validación rápida de instanceName
      if (!this.isValidInstanceName(instanceName)) {
        return {
          isValid: false,
          errorType: 'invalid_instance_name',
          errorMessage: 'InstanceName contiene caracteres inválidos'
        }
      }

      logger.debug('Webhook validado exitosamente', {
        clientId,
        instanceName
      })

      return {
        isValid: true,
        clientId,
        instanceName
      }

    } catch (error) {
      logger.webhookError('Error validando webhook', error as Error, {
        clientId,
        instanceName
      })

      return {
        isValid: false,
        errorType: 'validation_error',
        errorMessage: 'Error interno validando webhook'
      }
    }
  }

  /**
   * Valida el payload JSON del webhook
   */
  static validatePayload(payload: any): WebhookValidationResult {
    try {
      // Validación básica de estructura
      if (!payload || typeof payload !== 'object') {
        return {
          isValid: false,
          errorType: 'invalid_payload_structure',
          errorMessage: 'Payload debe ser un objeto JSON válido'
        }
      }

      // Validar campos críticos
      if (!payload.event || !payload.data) {
        return {
          isValid: false,
          errorType: 'missing_required_fields',
          errorMessage: 'Campos "event" y "data" son requeridos'
        }
      }

      return {
        isValid: true
      }

    } catch (error) {
      return {
        isValid: false,
        errorType: 'payload_parse_error',
        errorMessage: 'Error parseando payload JSON'
      }
    }
  }

  /**
   * Valida que el cliente tenga acceso a la instancia con cache automático
   */
  static async validateClientInstanceAccess(
    clientId: string,
    instanceName: string
  ): Promise<WebhookValidationResult> {
    const cacheKey = `${clientId}:${instanceName}`
    
    // Verificar cache automático
    const cached = webhookAccessCache.get(cacheKey)
    if (cached !== undefined) {
      if (!cached) {
        return {
          isValid: false,
          errorType: 'access_denied',
          errorMessage: 'Acceso denegado'
        }
      }
      return {
        isValid: true,
        clientId,
        instanceName
      }
    }

    // Consulta DB solo si no está en cache
    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { db } = await import('@/server/db')
      
      // Verificar que el cliente existe
      const client = await db.client.findUnique({
        where: { id: clientId },
        select: { id: true, name: true }
      })

      if (!client) {
        webhookAccessCache.set(cacheKey, false)
        return {
          isValid: false,
          errorType: 'client_not_found',
          errorMessage: 'Cliente no encontrado'
        }
      }

      // Verificar que la instancia existe y pertenece al cliente
      const instance = await db.evolutionApiInstance.findFirst({
        where: {
          instanceName: instanceName,
          evolutionApi: {
            integration: {
              clientId: clientId
            }
          }
        },
        select: { id: true, instanceName: true, status: true }
      })

      const isValid = !!instance
      
      // Actualizar cache automático
      webhookAccessCache.set(cacheKey, isValid)
      
      if (!isValid) {
        return {
          isValid: false,
          errorType: 'instance_not_found',
          errorMessage: 'Instancia no encontrada o no pertenece al cliente'
        }
      }

      logger.debug('Acceso a instancia validado', {
        clientId,
        clientName: client.name,
        instanceName,
        instanceStatus: instance.status
      })

      return {
        isValid: true,
        clientId,
        instanceName
      }

    } catch (error) {
      logger.webhookError('Error validando acceso a instancia', error as Error, {
        clientId,
        instanceName
      })

      return {
        isValid: false,
        errorType: 'access_validation_error',
        errorMessage: 'Error validando acceso a la instancia'
      }
    }
  }

  /**
   * Limpiar cache expirado (DEPRECATED - ahora se maneja automáticamente)
   * @deprecated El cache ahora se limpia automáticamente
   */
  static cleanupCache(): void {
    // El cache ahora se limpia automáticamente con AutoCleanupCache
    logger.debug('cleanupCache() llamado pero el cache se limpia automáticamente')
  }
}
