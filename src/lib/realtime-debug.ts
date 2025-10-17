/**
 * Utilidades de debugging para Supabase Realtime
 * 
 * Este módulo proporciona herramientas para diagnosticar y monitorear
 * el estado de las conexiones realtime en desarrollo.
 */

interface RealtimeDebugInfo {
  timestamp: Date
  clientId: string | null
  isConnected: boolean
  isUsingFallback: boolean
  eventCount: number
  lastEventTime: Date | null
  connectionHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  errors: string[]
}

class RealtimeDebugger {
  private static instance: RealtimeDebugger
  private eventLog: Array<{ timestamp: Date; type: string; data: any }> = []
  private errorLog: string[] = []
  private eventCount = 0
  private lastEventTime: Date | null = null

  static getInstance(): RealtimeDebugger {
    if (!RealtimeDebugger.instance) {
      RealtimeDebugger.instance = new RealtimeDebugger()
    }
    return RealtimeDebugger.instance
  }

  /**
   * Registrar un evento realtime
   */
  logEvent(type: string, data: any) {
    const timestamp = new Date()
    this.eventLog.push({ timestamp, type, data })
    this.eventCount++
    this.lastEventTime = timestamp

    // Mantener solo los últimos 100 eventos
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-100)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[RealtimeDebug] Event: ${type}`, {
        timestamp: timestamp.toISOString(),
        data,
        totalEvents: this.eventCount
      })
    }
  }

  /**
   * Registrar un error
   */
  logError(error: string) {
    const timestamp = new Date()
    const errorWithTimestamp = `[${timestamp.toISOString()}] ${error}`
    
    this.errorLog.push(errorWithTimestamp)

    // Mantener solo los últimos 50 errores
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50)
    }

    console.error(`[RealtimeDebug] Error:`, errorWithTimestamp)
  }

  /**
   * Obtener información de debugging
   */
  getDebugInfo(clientId: string | null, isConnected: boolean, isUsingFallback: boolean): RealtimeDebugInfo {
    const now = new Date()
    const connectionHealth = this.calculateConnectionHealth()

    return {
      timestamp: now,
      clientId,
      isConnected,
      isUsingFallback,
      eventCount: this.eventCount,
      lastEventTime: this.lastEventTime,
      connectionHealth,
      errors: [...this.errorLog]
    }
  }

  /**
   * Calcular salud de la conexión basada en eventos recientes
   */
  private calculateConnectionHealth(): RealtimeDebugInfo['connectionHealth'] {
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    // Contar eventos en los últimos 5 minutos
    const recentEvents = this.eventLog.filter(event => 
      event.timestamp.getTime() > fiveMinutesAgo
    )

    if (recentEvents.length === 0) {
      return 'unknown'
    }

    // Calcular frecuencia promedio
    const timeSpan = Math.max(1, now - recentEvents[0].timestamp.getTime())
    const frequency = recentEvents.length / (timeSpan / 1000 / 60) // eventos por minuto

    if (frequency > 10) return 'excellent'
    if (frequency > 5) return 'good'
    if (frequency > 1) return 'fair'
    return 'poor'
  }

  /**
   * Generar reporte de salud
   */
  generateHealthReport(clientId: string | null, isConnected: boolean, isUsingFallback: boolean): string {
    const debugInfo = this.getDebugInfo(clientId, isConnected, isUsingFallback)
    
    const report = `
=== REALTIME HEALTH REPORT ===
Timestamp: ${debugInfo.timestamp.toISOString()}
Client ID: ${debugInfo.clientId || 'null'}
Connection: ${debugInfo.isConnected ? '✅ Connected' : '❌ Disconnected'}
Fallback: ${debugInfo.isUsingFallback ? '⚠️ Active' : '✅ Inactive'}
Health: ${debugInfo.connectionHealth.toUpperCase()}
Total Events: ${debugInfo.eventCount}
Last Event: ${debugInfo.lastEventTime?.toISOString() || 'Never'}
Recent Errors: ${debugInfo.errors.length}

Recent Events (last 10):
${this.eventLog.slice(-10).map(event => 
  `  [${event.timestamp.toISOString()}] ${event.type}`
).join('\n')}

Recent Errors (last 5):
${debugInfo.errors.slice(-5).join('\n')}
===============================
    `.trim()

    return report
  }

  /**
   * Limpiar logs (útil para testing)
   */
  clearLogs() {
    this.eventLog = []
    this.errorLog = []
    this.eventCount = 0
    this.lastEventTime = null
  }

  /**
   * Exportar logs para análisis
   */
  exportLogs() {
    return {
      events: this.eventLog,
      errors: this.errorLog,
      stats: {
        totalEvents: this.eventCount,
        lastEventTime: this.lastEventTime,
        connectionHealth: this.calculateConnectionHealth()
      }
    }
  }
}

// Exportar instancia singleton
export const realtimeDebugger = RealtimeDebugger.getInstance()

// Funciones de utilidad para uso en hooks
export function logRealtimeEvent(type: string, data: any) {
  realtimeDebugger.logEvent(type, data)
}

export function logRealtimeError(error: string) {
  realtimeDebugger.logError(error)
}

export function getRealtimeDebugInfo(clientId: string | null, isConnected: boolean, isUsingFallback: boolean) {
  return realtimeDebugger.getDebugInfo(clientId, isConnected, isUsingFallback)
}

export function generateRealtimeHealthReport(clientId: string | null, isConnected: boolean, isUsingFallback: boolean) {
  return realtimeDebugger.generateHealthReport(clientId, isConnected, isUsingFallback)
}

// Hook de React para debugging (solo en desarrollo)
export function useRealtimeDebug(clientId: string | null, isConnected: boolean, isUsingFallback: boolean) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const debugInfo = getRealtimeDebugInfo(clientId, isConnected, isUsingFallback)
  
  // Log periódico en desarrollo
  if (Math.random() < 0.1) { // 10% de probabilidad
    console.log('[RealtimeDebug] Periodic status:', debugInfo)
  }

  return {
    debugInfo,
    generateReport: () => generateRealtimeHealthReport(clientId, isConnected, isUsingFallback),
    clearLogs: () => realtimeDebugger.clearLogs(),
    exportLogs: () => realtimeDebugger.exportLogs()
  }
}
