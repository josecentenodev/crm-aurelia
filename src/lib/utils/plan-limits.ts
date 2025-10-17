import { type PlanLimits, type PlanUsageInfo, type LimitValidation } from '@/domain/Planes'

/**
 * Valida si un cliente puede crear una nueva instancia WhatsApp
 */
export function validateInstanceLimit(
  currentUsage: number,
  planLimits: PlanLimits
): LimitValidation {
  const remaining = planLimits.maxInstances - currentUsage
  const isValid = remaining > 0
  const exceededLimits: string[] = []
  const suggestions: string[] = []

  if (!isValid) {
    exceededLimits.push('INSTANCES')
    suggestions.push('Actualiza tu plan para obtener más instancias')
  } else if (remaining <= 2) {
    suggestions.push('Te quedan pocas instancias disponibles. Considera actualizar tu plan.')
  }

  return {
    isValid,
    exceededLimits,
    remainingCapacity: {
      instances: Math.max(0, remaining)
    },
    suggestions
  }
}

/**
 * Valida si un cliente puede crear un nuevo agente
 */
export function validateAgentLimit(
  currentUsage: number,
  planLimits: PlanLimits
): LimitValidation {
  const remaining = planLimits.maxAgents - currentUsage
  const isValid = remaining > 0
  const exceededLimits: string[] = []
  const suggestions: string[] = []

  if (!isValid) {
    exceededLimits.push('AGENTS')
    suggestions.push('Actualiza tu plan para obtener más agentes')
  } else if (remaining <= 2) {
    suggestions.push('Te quedan pocos agentes disponibles. Considera actualizar tu plan.')
  }

  return {
    isValid,
    exceededLimits,
    remainingCapacity: {
      agents: Math.max(0, remaining)
    },
    suggestions
  }
}

/**
 * Valida si un cliente puede crear un nuevo contacto
 */
export function validateContactLimit(
  currentUsage: number,
  planLimits: PlanLimits
): LimitValidation {
  const remaining = planLimits.maxContacts - currentUsage
  const isValid = remaining > 0
  const exceededLimits: string[] = []
  const suggestions: string[] = []

  if (!isValid) {
    exceededLimits.push('CONTACTS')
    suggestions.push('Actualiza tu plan para obtener más contactos')
  } else if (remaining <= 10) {
    suggestions.push('Te quedan pocos contactos disponibles. Considera actualizar tu plan.')
  }

  return {
    isValid,
    exceededLimits,
    remainingCapacity: {
      contacts: Math.max(0, remaining)
    },
    suggestions
  }
}

/**
 * Valida si un cliente puede crear un nuevo usuario
 */
export function validateUserLimit(
  currentUsage: number,
  planLimits: PlanLimits
): LimitValidation {
  const remaining = planLimits.maxUsers - currentUsage
  const isValid = remaining > 0
  const exceededLimits: string[] = []
  const suggestions: string[] = []

  if (!isValid) {
    exceededLimits.push('USERS')
    suggestions.push('Actualiza tu plan para obtener más usuarios')
  } else if (remaining <= 2) {
    suggestions.push('Te quedan pocos usuarios disponibles. Considera actualizar tu plan.')
  }

  return {
    isValid,
    exceededLimits,
    remainingCapacity: {
      users: Math.max(0, remaining)
    },
    suggestions
  }
}

/**
 * Calcula el uso actual vs límites del plan
 */
export function calculatePlanUsage(
  planLimits: PlanLimits,
  currentUsage: {
    users: number
    contacts: number
    agents: number
    instances: number
  }
): PlanUsageInfo {
  const remaining = {
    users: Math.max(0, planLimits.maxUsers - currentUsage.users),
    contacts: Math.max(0, planLimits.maxContacts - currentUsage.contacts),
    agents: Math.max(0, planLimits.maxAgents - currentUsage.agents),
    instances: Math.max(0, planLimits.maxInstances - currentUsage.instances)
  }

  const exceededLimits: string[] = []
  
  if (currentUsage.users > planLimits.maxUsers) {
    exceededLimits.push('USERS')
  }
  if (currentUsage.contacts > planLimits.maxContacts) {
    exceededLimits.push('CONTACTS')
  }
  if (currentUsage.agents > planLimits.maxAgents) {
    exceededLimits.push('AGENTS')
  }
  if (currentUsage.instances > planLimits.maxInstances) {
    exceededLimits.push('INSTANCES')
  }

  return {
    planId: '', // Se debe proporcionar desde el contexto
    planName: '', // Se debe proporcionar desde el contexto
    currentUsage,
    limits: planLimits,
    remaining,
    isWithinLimits: exceededLimits.length === 0,
    exceededLimits
  }
}

/**
 * Calcula el costo total del plan basado en el uso actual
 */
export function calculatePlanCost(
  planLimits: PlanLimits,
  currentUsage: {
    users: number
    contacts: number
    agents: number
    instances: number
  }
): number {
  return currentUsage.instances * planLimits.costPerInstance
}

/**
 * Verifica si el uso está cerca del límite (80% o más)
 */
export function isUsageNearLimit(
  currentUsage: number,
  limit: number,
  threshold: number = 0.8
): boolean {
  return currentUsage >= limit * threshold
}

/**
 * Obtiene el porcentaje de uso de un recurso
 */
export function getUsagePercentage(
  currentUsage: number,
  limit: number
): number {
  if (limit === 0) return 0
  return Math.min(100, (currentUsage / limit) * 100)
}

/**
 * Genera un mensaje de alerta cuando el uso está cerca del límite
 */
export function generateUsageAlert(
  resourceType: string,
  currentUsage: number,
  limit: number
): string {
  const percentage = getUsagePercentage(currentUsage, limit)
  
  if (percentage >= 100) {
    return `Has alcanzado el límite máximo de ${resourceType} (${currentUsage}/${limit}). Actualiza tu plan para continuar.`
  } else if (percentage >= 80) {
    return `Estás cerca del límite de ${resourceType} (${currentUsage}/${limit}, ${percentage.toFixed(1)}%). Considera actualizar tu plan.`
  }
  
  return ''
} 