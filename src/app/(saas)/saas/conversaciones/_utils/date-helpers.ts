/**
 * Helpers para cálculo de rangos de fechas
 * Usados en filtros de conversaciones
 */

export type DateFilterValue = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface DateRange {
  from: Date
  to: Date
}

/**
 * Calcula el rango de fechas basado en el filtro seleccionado
 */
export function getDateRange(filter: DateFilterValue): DateRange | null {
  if (filter === 'all') return null

  const now = new Date()
  const from = new Date(now)
  const to = new Date(now)

  // Resetear a inicio del día actual
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)

  switch (filter) {
    case 'today':
      // Ya está configurado correctamente
      break

    case 'week': {
      // Inicio de la semana (Lunes)
      const dayOfWeek = from.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Ajustar para que Lunes sea día 0
      from.setDate(from.getDate() - diff)
      
      // Fin de la semana (Domingo)
      to.setDate(from.getDate() + 6)
      break
    }

    case 'month':
      // Primer día del mes
      from.setDate(1)
      
      // Último día del mes
      to.setMonth(to.getMonth() + 1, 0)
      break

    case 'quarter': {
      // Calcular trimestre actual
      const currentMonth = now.getMonth()
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3
      
      // Primer día del trimestre
      from.setMonth(quarterStartMonth, 1)
      
      // Último día del trimestre
      to.setMonth(quarterStartMonth + 3, 0)
      break
    }

    case 'year':
      // Primer día del año
      from.setMonth(0, 1)
      
      // Último día del año
      to.setMonth(11, 31)
      break

    default:
      return null
  }

  return { from, to }
}

/**
 * Formatea un rango de fechas para mostrar en UI
 */
export function formatDateRange(filter: DateFilterValue): string {
  if (filter === 'all') return 'Todas las fechas'
  
  const range = getDateRange(filter)
  if (!range) return ''

  const options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }
  
  const fromStr = range.from.toLocaleDateString('es-AR', options)
  const toStr = range.to.toLocaleDateString('es-AR', options)
  
  return `${fromStr} - ${toStr}`
}

