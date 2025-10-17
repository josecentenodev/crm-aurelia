import { env } from '@/env'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  clientId?: string
  instanceName?: string
  whatsappId?: string
  messageId?: string
  conversationId?: string
  contactId?: string
  event?: string
  [key: string]: unknown
}

class Logger {
  private level: LogLevel

  constructor() {
    this.level = env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level}: ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context))
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorInfo = error ? ` | Error: ${error.message} | Stack: ${error.stack}` : ''
      console.error(this.formatMessage('ERROR', message + errorInfo, context))
    }
  }

  // Método específico para webhooks con contexto completo
  webhook(event: string, message: string, data?: any, context?: LogContext): void {
    const webhookContext = {
      ...context,
      event,
      payload: data ? JSON.stringify(data).substring(0, 500) + '...' : undefined
    }
    this.info(`🌐 WEBHOOK: ${message}`, webhookContext)
  }

  // Método para mensajes procesados
  messageProcessed(message: string, context?: LogContext): void {
    this.info(`💬 MESSAGE: ${message}`, context)
  }

  // Método para contactos
  contact(message: string, context?: LogContext): void {
    this.info(`👤 CONTACT: ${message}`, context)
  }

  // Método para conversaciones
  conversation(message: string, context?: LogContext): void {
    this.info(`💬 CONVERSATION: ${message}`, context)
  }

  // Método para almacenamiento
  storage(message: string, context?: LogContext): void {
    this.info(`💾 STORAGE: ${message}`, context)
  }

  // Método para errores de webhook
  webhookError(message: string, error?: Error, context?: LogContext): void {
    this.error(`❌ WEBHOOK ERROR: ${message}`, error, context)
  }

  aiError(message: string, error?: Error, context?: LogContext): void {
    this.error(`❌ AI ERROR: ${message}`, error, context)
  }
}

export const logger = new Logger()
