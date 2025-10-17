// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Formatea un número como moneda
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (!amount) return "$0"
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return "$0"
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (!value) return "0"
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return "0"
  
  return new Intl.NumberFormat('es-AR').format(numValue)
}

/**
 * Formatea una fecha en formato local
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return "N/A"
  
  return dateObj.toLocaleDateString('es-AR')
}

/**
 * Formatea una fecha y hora en formato local
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return "N/A"
  
  return dateObj.toLocaleString('es-AR')
}

/**
 * Formatea un período de tiempo relativo
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return "N/A"
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "Hace un momento"
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return formatDate(dateObj)
}

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un número de teléfono
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Valida una URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valida que un string no esté vacío
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0
}

/**
 * Valida que un número sea positivo
 */
export function isPositiveNumber(value: number | string): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Obtiene el color para un estado de integración
 */
export function getIntegrationStatusColor(isActive: boolean, isAvailable: boolean): string {
  if (!isAvailable) return "bg-gray-100 text-gray-600"
  return isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
}

/**
 * Obtiene el texto para un estado de integración
 */
export function getIntegrationStatusText(isActive: boolean, isAvailable: boolean): string {
  if (!isAvailable) return "No disponible"
  return isActive ? "Activa" : "Inactiva"
}

/**
 * Obtiene el color para un estado de instancia
 */
export function getInstanceStatusColor(status: string): string {
  switch (status) {
    case "CONNECTED":
      return "bg-green-100 text-green-800"
    case "CONNECTING":
      return "bg-yellow-100 text-yellow-800"
    case "ERROR":
      return "bg-red-100 text-red-800"
    case "MAINTENANCE":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

/**
 * Obtiene el texto para un estado de instancia
 */
export function getInstanceStatusText(status: string): string {
  switch (status) {
    case "CONNECTED":
      return "Conectada"
    case "CONNECTING":
      return "Conectando"
    case "ERROR":
      return "Error"
    case "MAINTENANCE":
      return "Mantenimiento"
    default:
      return "Desconectada"
  }
}

/**
 * Obtiene el color para un tipo de usuario
 */
export function getUserTypeColor(type: string): string {
  switch (type) {
    case 'ADMIN':
      return 'bg-blue-100 text-blue-800'
    case 'CUSTOMER':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Obtiene el color para un estado de usuario
 */
export function getUserStatusColor(active: boolean): string {
  return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}

// ============================================================================
// ICON HELPERS
// ============================================================================

/**
 * Obtiene el nombre de un tipo de integración
 */
export function getIntegrationTypeName(type: string): string {
  switch (type) {
    case "EVOLUTION_API":
      return "WhatsApp API"
    case "WHATSAPP_BUSINESS":
      return "WhatsApp Business"
    case "TELEGRAM_BOT":
      return "Telegram Bot"
    case "EMAIL_SMTP":
      return "Email SMTP"
    case "SMS_TWILIO":
      return "SMS Twilio"
    default:
      return "Integración con servicio externo"
  }
}

/**
 * Obtiene la descripción de un tipo de integración
 */
export function getIntegrationTypeDescription(type: string): string {
  switch (type) {
    case "EVOLUTION_API":
      return "Conexión con WhatsApp a través de WhatsApp API"
    case "WHATSAPP_BUSINESS":
      return "API oficial de WhatsApp Business"
    case "TELEGRAM_BOT":
      return "Bot de Telegram para mensajería"
    case "EMAIL_SMTP":
      return "Envío de emails a través de SMTP"
    case "SMS_TWILIO":
      return "Envío de SMS a través de Twilio"
    default:
      return "Integración con servicio externo"
  }
}

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

/**
 * Crea una función debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Extrae el mensaje de error de una excepción
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Ha ocurrido un error inesperado'
}

/**
 * Crea un objeto de error de validación
 */
export function createValidationError(field: string, message: string) {
  return { field, message }
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Agrupa un array por una clave específica
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Ordena un array por una clave específica
 */
export function sortBy<T, K extends keyof T>(array: T[], key: K, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Verifica si un objeto está vacío
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Obtiene un valor anidado de un objeto de forma segura
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convierte una cadena a slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Trunca una cadena a una longitud específica
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
