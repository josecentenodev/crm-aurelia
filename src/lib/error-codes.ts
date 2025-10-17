export enum ErrorCode {
  // Errores de autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  CLIENT_ID_REQUIRED = 'CLIENT_ID_REQUIRED',
  
  // Errores de instancias
  INSTANCE_NOT_FOUND = 'INSTANCE_NOT_FOUND',
  INSTANCE_ALREADY_EXISTS = 'INSTANCE_ALREADY_EXISTS',
  INSTANCE_NEEDS_DISCONNECT = 'INSTANCE_NEEDS_DISCONNECT',
  INSTANCE_CONNECTION_FAILED = 'INSTANCE_CONNECTION_FAILED',
  INSTANCE_DELETE_FAILED = 'INSTANCE_DELETE_FAILED',
  INSTANCE_CREATE_FAILED = 'INSTANCE_CREATE_FAILED',
  
  // Errores de conectividad
  EVOLUTION_API_UNAVAILABLE = 'EVOLUTION_API_UNAVAILABLE',
  ADAPTER_UNAVAILABLE = 'ADAPTER_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Errores de permisos
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CLIENT_ACCESS_DENIED = 'CLIENT_ACCESS_DENIED',
  
  // Errores de configuración
  INVALID_CONFIG = 'INVALID_CONFIG',
  WEBHOOK_CONFIG_FAILED = 'WEBHOOK_CONFIG_FAILED',
  
  // Errores de QR
  QR_GENERATION_FAILED = 'QR_GENERATION_FAILED',
  QR_EXPIRED = 'QR_EXPIRED',
  
  // Errores de base de datos
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Errores desconocidos
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  retryable: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const ERROR_MESSAGES: Record<ErrorCode, ErrorDetails> = {
  [ErrorCode.UNAUTHORIZED]: {
    code: ErrorCode.UNAUTHORIZED,
    message: 'Unauthorized access',
    userMessage: 'No tienes permisos para realizar esta acción',
    retryable: false,
    severity: 'HIGH'
  },
  
  [ErrorCode.INVALID_API_KEY]: {
    code: ErrorCode.INVALID_API_KEY,
    message: 'Invalid API key',
    userMessage: 'La clave de API no es válida',
    retryable: false,
    severity: 'HIGH'
  },
  
  [ErrorCode.CLIENT_ID_REQUIRED]: {
    code: ErrorCode.CLIENT_ID_REQUIRED,
    message: 'ClientId requerido',
    userMessage: 'Se requiere el ID del cliente para esta operación',
    retryable: false,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INSTANCE_NOT_FOUND]: {
    code: ErrorCode.INSTANCE_NOT_FOUND,
    message: 'Instancia no encontrada',
    userMessage: 'La instancia especificada no existe',
    retryable: false,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INSTANCE_ALREADY_EXISTS]: {
    code: ErrorCode.INSTANCE_ALREADY_EXISTS,
    message: 'Instancia ya existe',
    userMessage: 'Ya existe una instancia con este nombre',
    retryable: false,
    severity: 'LOW'
  },
  
  [ErrorCode.INSTANCE_NEEDS_DISCONNECT]: {
    code: ErrorCode.INSTANCE_NEEDS_DISCONNECT,
    message: 'Instance needs to be disconnected',
    userMessage: 'La instancia debe estar desconectada antes de eliminarla',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INSTANCE_CONNECTION_FAILED]: {
    code: ErrorCode.INSTANCE_CONNECTION_FAILED,
    message: 'Failed to connect instance',
    userMessage: 'No se pudo conectar la instancia. Inténtalo de nuevo',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INSTANCE_DELETE_FAILED]: {
    code: ErrorCode.INSTANCE_DELETE_FAILED,
    message: 'Failed to delete instance',
    userMessage: 'No se pudo eliminar la instancia. Inténtalo de nuevo',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INSTANCE_CREATE_FAILED]: {
    code: ErrorCode.INSTANCE_CREATE_FAILED,
    message: 'Failed to create instance',
    userMessage: 'No se pudo crear la instancia. Inténtalo de nuevo',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.EVOLUTION_API_UNAVAILABLE]: {
    code: ErrorCode.EVOLUTION_API_UNAVAILABLE,
    message: 'Whatsapp unavailable',
    userMessage: 'El servicio de Whatsapp no está disponible',
    retryable: true,
    severity: 'HIGH'
  },
  
  [ErrorCode.ADAPTER_UNAVAILABLE]: {
    code: ErrorCode.ADAPTER_UNAVAILABLE,
    message: 'Evolution Adapter unavailable',
    userMessage: 'El servicio de Evolution Adapter no está disponible',
    retryable: true,
    severity: 'HIGH'
  },
  
  [ErrorCode.NETWORK_ERROR]: {
    code: ErrorCode.NETWORK_ERROR,
    message: 'Network error',
    userMessage: 'Error de conexión. Verifica tu internet',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.TIMEOUT_ERROR]: {
    code: ErrorCode.TIMEOUT_ERROR,
    message: 'Request timeout',
    userMessage: 'La operación tardó demasiado. Inténtalo de nuevo',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
    message: 'Insufficient permissions',
    userMessage: 'No tienes permisos suficientes para esta acción',
    retryable: false,
    severity: 'HIGH'
  },
  
  [ErrorCode.CLIENT_ACCESS_DENIED]: {
    code: ErrorCode.CLIENT_ACCESS_DENIED,
    message: 'Client access denied',
    userMessage: 'Acceso denegado para este cliente',
    retryable: false,
    severity: 'HIGH'
  },
  
  [ErrorCode.INVALID_CONFIG]: {
    code: ErrorCode.INVALID_CONFIG,
    message: 'Invalid configuration',
    userMessage: 'La configuración no es válida',
    retryable: false,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.WEBHOOK_CONFIG_FAILED]: {
    code: ErrorCode.WEBHOOK_CONFIG_FAILED,
    message: 'Webhook configuration failed',
    userMessage: 'No se pudo configurar el webhook',
    retryable: true,
    severity: 'LOW'
  },
  
  [ErrorCode.QR_GENERATION_FAILED]: {
    code: ErrorCode.QR_GENERATION_FAILED,
    message: 'QR code generation failed',
    userMessage: 'No se pudo generar el código QR',
    retryable: true,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.QR_EXPIRED]: {
    code: ErrorCode.QR_EXPIRED,
    message: 'QR code expired',
    userMessage: 'El código QR ha expirado. Genera uno nuevo',
    retryable: true,
    severity: 'LOW'
  },
  
  [ErrorCode.DATABASE_ERROR]: {
    code: ErrorCode.DATABASE_ERROR,
    message: 'Database error',
    userMessage: 'Error en la base de datos',
    retryable: true,
    severity: 'HIGH'
  },
  
  [ErrorCode.DUPLICATE_ENTRY]: {
    code: ErrorCode.DUPLICATE_ENTRY,
    message: 'Duplicate entry',
    userMessage: 'Ya existe un registro con estos datos',
    retryable: false,
    severity: 'LOW'
  },
  
  [ErrorCode.UNKNOWN_ERROR]: {
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'Unknown error',
    userMessage: 'Ocurrió un error inesperado',
    retryable: false,
    severity: 'MEDIUM'
  },
  
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    userMessage: 'Error interno del servidor',
    retryable: true,
    severity: 'HIGH'
  }
};

export class EvolutionError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public readonly technicalDetails?: string;
  public readonly originalError?: unknown;

  constructor(
    code: ErrorCode,
    technicalDetails?: string,
    originalError?: unknown
  ) {
    const errorDetails = ERROR_MESSAGES[code];
    super(errorDetails.message);
    
    this.code = code;
    this.userMessage = errorDetails.userMessage;
    this.retryable = errorDetails.retryable;
    this.severity = errorDetails.severity;
    this.technicalDetails = technicalDetails;
    this.originalError = originalError;
    
    // Mantener el stack trace
    if (originalError && typeof originalError === 'object' && 'stack' in originalError) {
      this.stack = (originalError as Error).stack;
    }
  }

  static fromAxiosError(error: unknown): EvolutionError {
    const axiosError = error as { 
      response?: { 
        status?: number; 
        data?: { message?: string } 
      }; 
      message?: string;
      code?: string;
    };
    
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;
    const message = data?.message || axiosError.message;
    
    // Mapear códigos de estado HTTP a nuestros códigos de error
    switch (status) {
      case 401:
        return new EvolutionError(ErrorCode.UNAUTHORIZED, message, error);
      case 403:
        return new EvolutionError(ErrorCode.INSUFFICIENT_PERMISSIONS, message, error);
      case 404:
        return new EvolutionError(ErrorCode.INSTANCE_NOT_FOUND, message, error);
      case 409:
        return new EvolutionError(ErrorCode.INSTANCE_ALREADY_EXISTS, message, error);
      case 400:
        if (message?.includes('ClientId requerido')) {
          return new EvolutionError(ErrorCode.CLIENT_ID_REQUIRED, message, error);
        }
        if (message?.includes('needs to be disconnected')) {
          return new EvolutionError(ErrorCode.INSTANCE_NEEDS_DISCONNECT, message, error);
        }
        return new EvolutionError(ErrorCode.INVALID_CONFIG, message, error);
      case 500:
        return new EvolutionError(ErrorCode.INTERNAL_SERVER_ERROR, message, error);
      case 502:
      case 503:
      case 504:
        return new EvolutionError(ErrorCode.EVOLUTION_API_UNAVAILABLE, message, error);
      default:
        if (axiosError.code === 'ECONNREFUSED') {
          return new EvolutionError(ErrorCode.ADAPTER_UNAVAILABLE, message, error);
        }
        if (axiosError.code === 'ETIMEDOUT') {
          return new EvolutionError(ErrorCode.TIMEOUT_ERROR, message, error);
        }
        if (axiosError.code === 'ENOTFOUND') {
          return new EvolutionError(ErrorCode.NETWORK_ERROR, message, error);
        }
        return new EvolutionError(ErrorCode.UNKNOWN_ERROR, message, error);
    }
  }
} 