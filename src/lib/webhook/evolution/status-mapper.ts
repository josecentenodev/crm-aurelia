// ============================================
// STATUS MAPPER - Evolution API to Prisma
// ============================================

import { type MessageStatus } from '@prisma/client'
import { logger } from '@/lib/utils/server-logger'

/**
 * Mapea los estados de mensajes de Evolution API a los valores del enum MessageStatus de Prisma
 * Basado en la documentación oficial de Evolution API y los estados de WhatsApp
 */
export class StatusMapper {
  private static readonly STATUS_MAP: Record<string, MessageStatus> = {
    // Estados básicos de WhatsApp
    'SENT': 'SENT',
    'DELIVERED': 'DELIVERED',
    'READ': 'READ',
    'FAILED': 'FAILED',
    
    // Estados de acknowledgment (ACK)
    'ACK': 'ACK',
    'ACK_DEVICE': 'ACK_DEVICE',
    'ACK_READ': 'ACK_READ',
    'ACK_READ_DEVICE': 'ACK_READ_DEVICE',
    'ACK_PENDING': 'ACK_PENDING',
    'ACK_SERVER': 'ACK_SERVER',
    'ACK_UNSENT': 'ACK_UNSENT',
    'ACK_ERROR': 'ACK_ERROR',
    'ACK_OFFLINE': 'ACK_OFFLINE',
    'ACK_PLAYED': 'ACK_PLAYED',
    'ACK_PLAYED_DEVICE': 'ACK_PLAYED_DEVICE',
    
    // Estados legacy/compatibilidad
    'DELIVERY_ACK': 'ACK',
    'READ_ACK': 'ACK_READ',
    'PLAYED_ACK': 'ACK_PLAYED',
    'PENDING': 'PENDING',
    
    // Estados de error
    'ERROR': 'FAILED',
    'TIMEOUT': 'FAILED',
    'NETWORK_ERROR': 'FAILED',
    
    // Estados desconocidos se mapean a SENT por defecto
    'UNKNOWN': 'SENT'
  }

  /**
   * Mapea un estado de Evolution API a un estado válido de Prisma
   * @param evolutionStatus - Estado recibido de Evolution API
   * @returns Estado válido de Prisma
   */
  static mapStatus(evolutionStatus: string | undefined): MessageStatus {
    if (!evolutionStatus) {
      return 'SENT'
    }

    const normalizedStatus = evolutionStatus.toUpperCase().trim()
    const mappedStatus = this.STATUS_MAP[normalizedStatus]

    if (mappedStatus) {
      logger.debug(`Mapeo directo de estado: ${normalizedStatus} → ${mappedStatus}`)
      return mappedStatus
    }

    // Si no se encuentra en el mapeo, intentar mapeo inteligente
    const intelligentStatus = this.intelligentMapping(normalizedStatus)
    logger.debug(`Mapeo inteligente de estado: ${normalizedStatus} → ${intelligentStatus}`)
    return intelligentStatus
  }

  /**
   * Mapeo inteligente para estados no mapeados explícitamente
   * @param status - Estado a mapear
   * @returns Estado mapeado
   */
  private static intelligentMapping(status: string): MessageStatus {
    // Mapeo basado en patrones usando configuración centralizada
    if (status.includes('ACK')) {
      if (status.includes('READ')) return 'ACK_READ'
      if (status.includes('PLAYED')) return 'ACK_PLAYED'
      if (status.includes('DEVICE')) return 'ACK_DEVICE'
      if (status.includes('SERVER')) return 'ACK_SERVER'
      if (status.includes('PENDING')) return 'ACK_PENDING'
      if (status.includes('ERROR')) return 'ACK_ERROR'
      if (status.includes('OFFLINE')) return 'ACK_OFFLINE'
      return 'ACK'
    }

    if (status.includes('DELIVERY')) return 'DELIVERED'
    if (status.includes('READ')) return 'READ'
    if (status.includes('FAIL') || status.includes('ERROR')) return 'FAILED'
    if (status.includes('PENDING') || status.includes('WAITING')) return 'PENDING'

    // Estado por defecto para casos desconocidos
    return 'SENT'
  }

  /**
   * Valida si un estado es válido para Prisma
   * @param status - Estado a validar
   * @returns true si es válido
   */
  static isValidStatus(status: string): boolean {
    const validStatuses = Object.values(this.STATUS_MAP)
    return validStatuses.includes(status as MessageStatus)
  }

  /**
   * Obtiene todos los estados válidos de Prisma
   * @returns Array de estados válidos
   */
  static getValidStatuses(): MessageStatus[] {
    return Object.values(this.STATUS_MAP)
  }
}
