import type { TRPCClientErrorBase } from '@trpc/client'

/**
 * Convierte errores técnicos de tRPC en mensajes amigables para el usuario
 * 
 * @param error - Error de tRPC o Error estándar
 * @returns Mensaje amigable para mostrar al usuario
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // Si es string, retornar directamente
  if (typeof error === 'string') {
    return error
  }

  // Si no es un objeto, retornar mensaje genérico
  if (typeof error !== 'object' || error === null) {
    return 'Ocurrió un error inesperado'
  }

  // Si es Error estándar
  if (error instanceof Error) {
    // Mapear mensajes técnicos comunes a mensajes amigables
    const message = error.message

    if (message.includes('Network request failed') || message.includes('fetch failed')) {
      return 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'La operación tardó demasiado. Intenta nuevamente.'
    }

    if (message.includes('Unauthorized') || message.includes('unauthorized')) {
      return 'No tienes permisos para realizar esta acción.'
    }

    if (message.includes('Forbidden') || message.includes('forbidden')) {
      return 'No tienes acceso a este recurso.'
    }

    if (message.includes('Not found') || message.includes('not found')) {
      return 'El recurso solicitado no existe.'
    }

    if (message.includes('Conflict') || message.includes('conflict')) {
      return 'Esta acción entra en conflicto con el estado actual.'
    }

    if (message.includes('Bad request') || message.includes('bad request')) {
      return 'Los datos proporcionados no son válidos.'
    }

    // Si el mensaje es corto y claro, usarlo directamente
    if (message.length < 100 && !message.includes('Error:') && !message.includes('Exception')) {
      return message
    }

    // Fallback para mensajes técnicos largos
    return 'Ocurrió un error. Por favor intenta nuevamente.'
  }

  // Si es TRPCClientError
  if ('data' in error && error.data && typeof error.data === 'object') {
    const trpcError = error as TRPCClientErrorBase<unknown>

    // Código de error HTTP
    const httpStatus = (trpcError.data as { httpStatus?: number }).httpStatus

    if (httpStatus) {
      switch (httpStatus) {
        case 400:
          return 'Los datos proporcionados no son válidos.'
        case 401:
          return 'Debes iniciar sesión para continuar.'
        case 403:
          return 'No tienes permisos para realizar esta acción.'
        case 404:
          return 'El recurso solicitado no existe.'
        case 409:
          return 'Esta acción entra en conflicto con el estado actual.'
        case 429:
          return 'Demasiadas solicitudes. Espera un momento e intenta nuevamente.'
        case 500:
          return 'Error del servidor. Intenta nuevamente en unos momentos.'
        case 503:
          return 'El servicio no está disponible temporalmente.'
        default:
          break
      }
    }

    // Mensaje del error tRPC
    if (trpcError.message) {
      return getUserFriendlyErrorMessage(new Error(trpcError.message))
    }
  }

  // Fallback final
  return 'Ocurrió un error inesperado. Por favor intenta nuevamente.'
}

