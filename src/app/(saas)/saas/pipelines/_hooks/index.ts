/**
 * Exportaciones centralizadas de hooks del módulo Pipelines
 */
export { useDebounce } from './use-debounce'
export { useDragAndDrop } from './use-drag-and-drop'
export { useKanbanTotals } from './use-kanban-totals'
export { useOpportunityMutations } from './use-opportunity-mutations'
export { usePipelineData } from './use-pipeline-data'
export { useSellerUsers } from './use-seller-users'

// Hooks de mensajería (arquitectura modular)
export { 
  useMessages,
  useMessagesQuery,
  useOptimisticMessages,
  useMessagesRealtime
} from './messages'

