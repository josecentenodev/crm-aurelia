import type { TRPCUtils } from '@/trpc/react'
import type { ConversationFilters } from '@/domain/Conversaciones'

/**
 * Helper centralizado para invalidar queries relacionadas con conversaciones
 * 
 * Esto garantiza consistencia en las invalidaciones de cache después de mutaciones
 * y evita código duplicado en múltiples hooks.
 * 
 * @param utils - Instancia de tRPC utils
 * @param clientId - ID del cliente
 * @param conversationId - ID de la conversación (opcional)
 * @param currentFilters - Filtros actuales de conversaciones
 */
export function invalidateConversationData(
  utils: TRPCUtils,
  clientId: string,
  conversationId: string | null,
  currentFilters: ConversationFilters
): void {
  // Invalidar lista de conversaciones con filtros actuales
  void utils.conversaciones.list.invalidate({ 
    clientId, 
    filters: currentFilters 
  })

  // Invalidar datos completos de la página (incluye stats e instancias)
  void utils.conversaciones.getPageData.invalidate({
    clientId,
    includeInstances: true,
    includeStats: true,
    filters: currentFilters
  })

  // Invalidar conversación específica si se proporciona el ID
  if (conversationId) {
    void utils.conversaciones.byId.invalidate({ id: conversationId })
  }

  // Invalidar estadísticas de conversaciones
  void utils.conversaciones.stats.invalidate({ clientId })
}

/**
 * Helper para invalidar solo la conversación actual sin afectar la lista
 * Útil para actualizaciones menores que no afectan la posición en la lista
 */
export function invalidateConversationById(
  utils: TRPCUtils,
  conversationId: string
): void {
  void utils.conversaciones.byId.invalidate({ id: conversationId })
}

/**
 * Helper para invalidar toda la data de conversaciones
 * Útil después de operaciones que pueden afectar múltiples conversaciones
 */
export function invalidateAllConversationData(
  utils: TRPCUtils,
  clientId: string
): void {
  // Invalidar todas las listas sin importar filtros
  void utils.conversaciones.list.invalidate()
  void utils.conversaciones.getPageData.invalidate()
  void utils.conversaciones.stats.invalidate({ clientId })
}

