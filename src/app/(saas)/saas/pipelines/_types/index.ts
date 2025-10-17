/**
 * Exportaciones centralizadas de tipos del módulo Pipelines
 */

export type {
  // Core types
  PipelineOpportunity,
  KanbanColumn,
  PipelineContact,
  
  // Component props
  KanbanBoardProps,
  OpportunityCardProps,
  ContactCardProps,
  
  // Form types
  OpportunityCreateFormData,
  OpportunityCreateFormProps,
  BoardCustomizationProps,
  
  // Modal types
  ConversationModalProps,
  
  // Column types
  ColumnContentProps,
  ColumnHeaderProps,
  PipelineColumnProps,
  UnassignedColumnProps,
  TotalSummaryPanelProps,
  
  // Hook return types
  UsePipelineDataReturn,
  UseOpportunityMutationsReturn,
  UseDragAndDropReturn,
  UseKanbanTotalsReturn,
  
  // Deadline types
  DeadlineStatus,
} from './pipelines.types'

// Re-exportar tipos externos que se usan frecuentemente
export type { DropResult, ResponderProvided } from '@hello-pangea/dnd'

