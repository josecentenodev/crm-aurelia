/**
 * Tipos centralizados para el módulo de Pipelines
 * Siguiendo la arquitectura modular de conversaciones
 */

import type { Opportunity } from "@/domain/Oportunidades"
import type { Contact } from "@/domain/Contactos"
import type { User } from "@/domain/Usuarios"
import type { DropResult, ResponderProvided } from "@hello-pangea/dnd"
import type { Pipeline, PipelineStage } from "@prisma/client"

// ============================================================================
// CORE TYPES - Tipos base del dominio
// ============================================================================

export interface PipelineOpportunity extends Opportunity {
  contact?: Contact | null
  assignedUser?: Pick<User, 'id' | 'name' | 'email'> | null
  expectedCloseDate?: Date | null
  actualCloseDate?: Date | null
  stageId?: string | null
  pipelineId?: string | null
}

export interface KanbanColumn {
  id: string
  name: string
  color: string
  order: number
  pipelineName?: string
  count?: number
  totalAmount?: number
}

// ============================================================================
// COMPONENT PROPS - Props de componentes principales
// ============================================================================

export interface KanbanBoardProps {
  unassigned: PipelineOpportunity[]
  columns: KanbanColumn[]
  opportunitiesByStage: Record<string, PipelineOpportunity[]>
  onDragEnd?: (result: DropResult, provided: ResponderProvided) => void
  disableUnassignedDrop?: boolean
  colWidthRem?: number
  headerHeightRem?: number
}

export interface OpportunityCardProps {
  opportunity: PipelineOpportunity
  columnColor?: string
  columnName?: string
}

export interface ContactCardProps {
  contact: PipelineContact
  columnColor?: string
  columnName?: string
  amount?: number | null
  currency?: string | null
}

export interface PipelineContact extends Contact {
  stageId?: string | null
  pipelineId?: string | null
  conversations?: Array<{
    id: string
    title: string | null
    status: string
    lastMessageAt: Date | null
    _count: {
      messages: number
    }
  }>
}

// ============================================================================
// FORM TYPES - Tipos para formularios
// ============================================================================

export interface OpportunityCreateFormData {
  contactId: string
  title: string
  amount: string
  pipelineId?: string
  stageId?: string
  assignedUserId?: string
  expectedCloseDate?: string
}

export interface OpportunityCreateFormProps {
  contacts: Contact[]
  boardPipelines: Array<{
    id: string
    name: string
    stages: Array<{
      id: string
      name: string
    }>
  }>
  sellers?: Array<Pick<User, 'id' | 'name' | 'email'>>
  onCreate: (data: OpportunityCreateFormData) => void
  onCancel: () => void
  isCreating?: boolean
}

export interface BoardCustomizationProps {
  colWidth: number
  headerHeight: number
  onColWidthChange: (value: number) => void
  onHeaderHeightChange: (value: number) => void
  onClose: () => void
}

// ============================================================================
// MODAL TYPES - Tipos para modales
// ============================================================================

export interface ConversationModalProps {
  conversationId: string
  contact: Contact
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// COLUMN TYPES - Tipos para columnas del kanban
// ============================================================================

export interface ColumnContentProps {
  opportunities: PipelineOpportunity[]
  columnColor: string
  columnId: string
  columnName: string
}

export interface ColumnHeaderProps {
  column: KanbanColumn
  count: number
  headerHeightPx: number
  totalAmount?: number
}

export interface PipelineColumnProps {
  column: KanbanColumn
  opportunities: PipelineOpportunity[]
  headerHeightRem: number
}

export interface UnassignedColumnProps {
  opportunities: PipelineOpportunity[]
  totalAmount: number
  headerHeightRem: number
  disableDrop?: boolean
}

export interface TotalSummaryPanelProps {
  totalAmount: number
}

// ============================================================================
// BOARD DATA TYPES - Tipos para datos del board desde el backend
// ============================================================================

export interface BoardPipeline extends Pipeline {
  stages: PipelineStage[]
}

export interface BoardOpportunity extends Opportunity {
  stage: { 
    id: string
    name: string
    color: string | null
    pipelineId: string 
  } | null
  pipeline: { 
    id: string
    name: string 
  } | null
  contact: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    clientId: string
  } | null
  assignedUser: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export interface BoardData {
  pipelines: BoardPipeline[]
  grouped: Record<string, BoardOpportunity[]>
}

// ============================================================================
// HOOK RETURN TYPES - Tipos de retorno de hooks
// ============================================================================

export interface UsePipelineDataReturn {
  board: BoardData | undefined
  contacts: Contact[]
  isLoading: boolean
  stageColumns: KanbanColumn[]
  typedOpportunities: PipelineOpportunity[]
  opportunitiesByStage: Record<string, PipelineOpportunity[]>
  unassigned: PipelineOpportunity[]
  clientId: string | null
}

// Usando tipos genéricos para evitar conflictos de tipo con tRPC
export interface UseOpportunityMutationsReturn {
  closeWon: {
    mutate: (input: { id: string }) => void
    status: 'idle' | 'pending' | 'success' | 'error'
    isPending: boolean
  }
  closeLost: {
    mutate: (input: { id: string; reason?: string }) => void
    status: 'idle' | 'pending' | 'success' | 'error'
    isPending: boolean
  }
  createOpportunity: {
    mutate: (input: unknown) => void
    status: 'idle' | 'pending' | 'success' | 'error'
    isPending: boolean
  }
  updateOpportunity: {
    mutate: (input: unknown) => void
    status: 'idle' | 'pending' | 'success' | 'error'
    isPending: boolean
  }
  moveToStage: {
    mutate: (input: { opportunityId: string; toStageId: string }) => void
    status: 'idle' | 'pending' | 'success' | 'error'
    isPending: boolean
  }
  invalidateBoardData: () => Promise<void>
}

export interface UseDragAndDropReturn {
  opportunitiesWithOptimism: PipelineOpportunity[]
  handleDragEnd: (result: DropResult) => void
  processedData: {
    unassigned: PipelineOpportunity[]
    opportunitiesByStage: Record<string, PipelineOpportunity[]>
  }
  clearOptimisticMove: () => void
  pendingMoves: any[]
  hasPendingMoves: boolean
  isProcessing: boolean
}

export interface UseKanbanTotalsReturn {
  unassignedTotal: number
  totalGeneral: number
  hasUnassignedTotal: boolean
  hasTotalGeneral: boolean
}

export interface UseSellerUsersReturn {
  users: Array<Pick<User, 'id' | 'name' | 'email'>>
  isLoading: boolean
}

// ============================================================================
// SELLER SELECTOR TYPES - Tipos para selector de vendedores
// ============================================================================

export interface SellerSelectorProps {
  opportunityId: string
  currentUserId: string | null
}

// ============================================================================
// DEADLINE TYPES - Tipos para manejo de fechas límite
// ============================================================================

export interface DeadlineStatus {
  status: 'overdue' | 'due-soon' | 'on-time' | 'no-deadline'
  days: number | null
  label: string
}

