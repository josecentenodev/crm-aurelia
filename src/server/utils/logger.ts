// Sistema de logging estructurado para el servidor
class ServerLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development'
  private static isProduction = process.env.NODE_ENV === 'production'

  static log(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.log(`[SERVER] ${message}`, data || '')
    }
  }

  static error(message: string, error?: unknown) {
    if (this.isDevelopment) {
      console.error(`[SERVER] ERROR: ${message}`, error || '')
    }
    // En producción, podríamos enviar a un servicio de logging
    if (this.isProduction) {
      // TODO: Integrar con servicio de logging como Sentry, LogRocket, etc.
      console.error(`[SERVER] ERROR: ${message}`, error || '')
    }
  }

  static warn(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.warn(`[SERVER] WARN: ${message}`, data || '')
    }
  }

  static debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.debug(`[SERVER] DEBUG: ${message}`, data || '')
    }
  }

  static info(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.info(`[SERVER] INFO: ${message}`, data || '')
    }
  }

  // Métodos específicos para diferentes contextos
  static auth(message: string, data?: unknown) {
    this.log(`[AUTH] ${message}`, data)
  }

  static db(message: string, data?: unknown) {
    this.log(`[DB] ${message}`, data)
  }

  static api(message: string, data?: unknown) {
    this.log(`[API] ${message}`, data)
  }

  static trpc(message: string, data?: unknown) {
    this.log(`[TRPC] ${message}`, data)
  }

  static middleware(message: string, data?: unknown) {
    this.log(`[MIDDLEWARE] ${message}`, data)
  }
}

export { ServerLogger as Logger } 