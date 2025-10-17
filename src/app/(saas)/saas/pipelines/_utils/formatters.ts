/**
 * Funciones de formateo para el módulo de Pipelines
 * Manejo de monedas, fechas, y utilidades de conversión
 */

import type { DeadlineStatus } from '../_types'

// ============================================================================
// CURRENCY & AMOUNT FORMATTERS
// ============================================================================

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "$0"
  const numAmount = Number(amount)
  if (isNaN(numAmount)) return "$0"
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

export function formatAmount(amount?: number | string | null, currency?: string | null): string | null {
  if (amount == null) return null
  const numAmount = Number(amount)
  if (isNaN(numAmount)) return null
  
  try {
    return new Intl.NumberFormat(undefined, { 
      style: "currency", 
      currency: currency ?? "USD" 
    }).format(numAmount)
  } catch {
    return `${numAmount} ${currency ?? ""}`.trim()
  }
}

// ============================================================================
// DATE FORMATTERS
// ============================================================================

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""
    
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj)
  } catch {
    return ""
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ""
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ""
    
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  } catch {
    return ""
  }
}

// ============================================================================
// DEADLINE UTILITIES
// ============================================================================

export function getDaysUntilDeadline(expectedCloseDate: Date | string | null | undefined): number | null {
  if (!expectedCloseDate) return null
  
  try {
    const deadline = typeof expectedCloseDate === 'string' ? new Date(expectedCloseDate) : expectedCloseDate
    if (isNaN(deadline.getTime())) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadline.setHours(0, 0, 0, 0)
    
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch {
    return null
  }
}

export function getDeadlineStatus(expectedCloseDate: Date | string | null | undefined): DeadlineStatus {
  try {
    const days = getDaysUntilDeadline(expectedCloseDate)
    
    if (days === null) {
      return {
        status: 'no-deadline',
        days: null,
        label: 'Sin fecha límite'
      }
    }
    
    if (days < 0) {
      return {
        status: 'overdue',
        days,
        label: `Vencida hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`
      }
    }
    
    if (days <= 3) {
      return {
        status: 'due-soon',
        days,
        label: days === 0 ? 'Vence hoy' : `Vence en ${days} día${days !== 1 ? 's' : ''}`
      }
    }
    
    return {
      status: 'on-time',
      days,
      label: `Vence en ${days} día${days !== 1 ? 's' : ''}`
    }
  } catch {
    return {
      status: 'no-deadline',
      days: null,
      label: 'Sin fecha límite'
    }
  }
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

export function convertRemToPixels(rem: number): number {
  return rem * 16 // 1rem = 16px estándar
}

