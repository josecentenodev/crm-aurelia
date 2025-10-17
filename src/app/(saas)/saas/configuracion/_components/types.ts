import type { RouterOutputs } from "@/trpc/react"
import type { Integration } from "@/domain/Integraciones"
import type { User } from "@/domain/Usuarios"
import type { Pipeline } from "@/domain/Pipelines"

// ============================================================================
// INTEGRATIONS TYPES
// ============================================================================

export type IntegrationData = RouterOutputs["integraciones"]["getClientIntegrations"]["integrations"][number]

export interface IntegrationCardProps {
  integration: IntegrationData
}

// ============================================================================
// INSTANCES TYPES
// ============================================================================

export type InstanceData = RouterOutputs["instances"]["listByClient"]["instances"][number]

export interface InstanceCardProps {
  instance: InstanceData
  onUpdate: () => void
}

export interface InstanceCreateFormData {
  instanceName: string
  phoneNumber: string
  description: string
}

export interface InstanceCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationId?: string
  maxInstances?: number
  currentInstances?: number
  onSuccess: () => void
}

export interface InstancesListProps {
  integrationId?: string
  maxInstances?: number
  currentInstances?: number
}

// ============================================================================
// USERS TYPES
// ============================================================================

export type UserData = RouterOutputs["usuarios"]["listByClient"]["users"][number]
export type RoleData = RouterOutputs["permisos"]["listRoles"][number]

export interface UserCardProps {
  user: UserData
  onUpdate: () => void
}

export interface RoleCardProps {
  role: RoleData
  onUpdate: () => void
}

export interface UserCreateFormData {
  name: string
  email: string
  type: "ADMIN" | "CUSTOMER"
  active: boolean
}

export interface UsersTabFilters {
  search: string
  typeFilter: string
  activeFilter: string
}

// ============================================================================
// PIPELINES TYPES
// ============================================================================

export type PipelineData = RouterOutputs["pipelines"]["listByClient"][number]

export interface PipelineCardProps {
  pipeline: PipelineData
  expanded: boolean
  onToggleExpanded: () => void
  newStage: StageCreateFormData
  onChangeNewStage: (next: StageCreateFormData) => void
  onCreateStage: () => void
  onUpdateStage: (args: {
    id: string
    name?: string
    color?: string
    slaMinutes?: number | undefined
    isWon?: boolean
    isLost?: boolean
  }) => void
  onDeletePipeline: () => void
  onDeleteStage: (stageId: string, stageName: string) => void
  onToggleDefault: (next: boolean) => void
}

export interface PipelineCreateFormData {
  name: string
  description: string
  isDefault: boolean
}

export interface StageCreateFormData {
  name: string
  color?: string
  slaMinutes?: number | ""
  isWon: boolean
  isLost: boolean
}

// ============================================================================
// PLAN TYPES
// ============================================================================

export type PlanUsageData = RouterOutputs["planes"]["getClientUsage"]

export interface PlanUsageCardProps {
  clientId: string
}

// ============================================================================
// TAB TYPES
// ============================================================================

export interface IntegrationsTabProps {
  clientId: string
}

export interface UsersTabProps {
  clientId: string
}

export interface PipelinesTabProps {
  clientId: string
}

export interface PlanTabProps {
  clientId: string
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface ConfiguracionPageState {
  activeTab: "integraciones" | "usuarios" | "pipelines" | "plan"
}

export interface ConfiguracionPageProps {
  clientId: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type IntegrationType = "EVOLUTION_API" | "WHATSAPP_BUSINESS" | "TELEGRAM_BOT" | "EMAIL_SMTP" | "SMS_TWILIO"

export type InstanceStatus = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "ERROR" | "MAINTENANCE"

export type UserType = "ADMIN" | "CUSTOMER"

export type UserStatus = "ACTIVE" | "INACTIVE"

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}