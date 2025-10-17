import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Devuelve la clase de color para un estado de conversación/contacto
export function getEstadoColor(estado: string) {
  switch (estado) {
    case "ACTIVA":
      return "bg-blue-100 text-blue-800"
    case "PAUSADA":
      return "bg-purple-100 text-purple-800"
    case "FINALIZADA":
      return "bg-green-100 text-green-800"
    case "ARCHIVADA":
      return "bg-gray-100 text-gray-800"
    case "prospecto":
      return "bg-blue-100 text-blue-800"
    case "calificado":
      return "bg-green-100 text-green-800"
    case "propuesta":
      return "bg-yellow-100 text-yellow-800"
    case "cerrado":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Logger mejorado para desarrollo
class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  static log(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.log(`[AURELIA] ${message}`, data || '')
    }
  }

  static error(message: string, error?: unknown) {
    if (this.isDevelopment) {
      console.error(`[AURELIA] ERROR: ${message}`, error || '')
    }
  }

  static warn(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.warn(`[AURELIA] WARN: ${message}`, data || '')
    }
  }

  static debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.debug(`[AURELIA] DEBUG: ${message}`, data || '')
    }
  }
}

export { Logger }