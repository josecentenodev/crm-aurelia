/**
 * Utilidad centralizada para formateo de fechas en conversaciones
 * Evita duplicación y mantiene consistencia
 */

/**
 * Helper para parsear fechas con zona horaria implícita UTC si falta
 */
export function parseAsUtcIfMissingZone(value: string | Date): Date | null {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value !== 'string') return null
  
  // Fast path: ISO con timezone
  if (/Z|[+-]\d{2}:?\d{2}$/.test(value)) {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  
  // Si parece ISO sin zona, tratar como UTC agregando Z
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?$/.test(value)) {
    const d = new Date(value + 'Z')
    return isNaN(d.getTime()) ? null : d
  }
  
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Formatea la hora de un mensaje para la lista de mensajes
 * Formato: HH:mm en timezone Argentina
 */
export function formatMessageTime(createdAt: string | Date): string {
  try {
    const date = parseAsUtcIfMissingZone(createdAt)
    if (!date) return 'Hora no disponible'
    
    const fmt = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Argentina/Buenos_Aires'
    })
    return fmt.format(date)
  } catch {
    return 'Hora no disponible'
  }
}

/**
 * Formatea la fecha/hora para la lista de conversaciones
 * - Últimas 24h: solo hora
 * - Última semana: día de semana + hora
 * - Más antiguo: fecha corta
 */
export function formatConversationTime(date: Date | string | null | undefined): string {
  if (!date) return ""
  
  try {
    const messageDate = new Date(date)
    if (isNaN(messageDate.getTime())) return ""
    
    const now = new Date()
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 168) { // 7 días
      return messageDate.toLocaleDateString('es-ES', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return messageDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      })
    }
  } catch {
    return ""
  }
}

/**
 * Formatea fecha completa para detalles de conversación
 */
export function formatFullDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  try {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) return 'N/A'
    
    return parsedDate.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    })
  } catch {
    return 'N/A'
  }
}

