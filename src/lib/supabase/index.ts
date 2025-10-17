import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/env.js'

// Tipo temporal hasta que se defina Database en types/supabase
type Database = any

function getRealtimeConfig() {
  return {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 3000, 30000)
  }
}

// Persist instances across HMR and multiple imports using globalThis
declare global {
  // eslint-disable-next-line no-var
  var __supabase_browser_instance__: SupabaseClient<Database> | undefined
  // eslint-disable-next-line no-var
  var __supabase_server_instance__: SupabaseClient<Database> | undefined
  // eslint-disable-next-line no-var
  var __supabase_admin_instance__: SupabaseClient<Database> | undefined
}

class SupabaseClientManager {
  private static getBrowserGlobal() {
    return (globalThis as any).__supabase_browser_instance__ as SupabaseClient<Database> | undefined
  }
  private static setBrowserGlobal(client: SupabaseClient<Database>) {
    ;(globalThis as any).__supabase_browser_instance__ = client
  }

  private static getServerGlobal() {
    return (globalThis as any).__supabase_server_instance__ as SupabaseClient<Database> | undefined
  }
  private static setServerGlobal(client: SupabaseClient<Database>) {
    ;(globalThis as any).__supabase_server_instance__ = client
  }

  static getClient(): SupabaseClient<Database> {
    // Browser singleton
    if (typeof window !== 'undefined') {
      const existing = this.getBrowserGlobal()
      if (existing) return existing

      const client = createClient<Database>(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          },
          realtime: getRealtimeConfig()
        }
      )
      this.setBrowserGlobal(client)
      return client
    }

    // Server: cache per process
    const existingServer = this.getServerGlobal()
    if (existingServer) return existingServer

    const serverClient = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    this.setServerGlobal(serverClient)
    return serverClient
  }

  static getServerClient(): SupabaseClient<Database> {
    if (typeof window !== 'undefined') {
      console.warn('getServerClient() called from browser — returning browser client for compatibility.')
      return this.getClient()
    }
    return this.getClient()
  }

  static getBrowserClient(): SupabaseClient<Database> {
    if (typeof window === 'undefined') {
      throw new Error('getBrowserClient() can only be called in browser environment')
    }
    return this.getClient()
  }

  static getAdminClient(): SupabaseClient<Database> {
    if (typeof window !== 'undefined') {
      throw new Error('Admin client can only be used in server environment')
    }

    const key = '__supabase_admin_instance__'
    if ((globalThis as any)[key]) return (globalThis as any)[key]

    const admin = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    ;(globalThis as any)[key] = admin
    return admin
  }
}

// Exportar funciones de conveniencia
export const getSupabaseClient = () => SupabaseClientManager.getClient()
export const getServerSupabase = () => SupabaseClientManager.getServerClient()
export const getAdminSupabase = () => SupabaseClientManager.getAdminClient()
export { SupabaseClientManager }
// Configuración de storage (mantenida por compatibilidad)
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'media',
  WHATSAPP_IMAGES_PATH: 'whatsapp-images',
  WHATSAPP_VIDEOS_PATH: 'whatsapp-videos',
  WHATSAPP_AUDIOS_PATH: 'whatsapp-audios',
  WHATSAPP_DOCUMENTS_PATH: 'whatsapp-documents',
  CACHE_CONTROL: '31536000', // 1 año
} as const
// Helper para generar rutas de storage (LEGACY - mantener por compatibilidad)
export function getStoragePath(type: 'image' | 'video' | 'audio' | 'document', messageId: string, extension?: string): string {
  const basePath = type === 'image' ? STORAGE_CONFIG.WHATSAPP_IMAGES_PATH :
                  type === 'video' ? STORAGE_CONFIG.WHATSAPP_VIDEOS_PATH :
                  type === 'audio' ? STORAGE_CONFIG.WHATSAPP_AUDIOS_PATH :
                  STORAGE_CONFIG.WHATSAPP_DOCUMENTS_PATH

  const ext = extension ?? (type === 'image' ? '.jpg' : type === 'video' ? '.mp4' : type === 'audio' ? '.mp3' : '.pdf')
  return `${basePath}/${messageId}${ext}`
}
// Helper para generar rutas de storage con clientId (NUEVA ESTRUCTURA CONSISTENTE)
export function getClientStoragePath(type: 'image' | 'video' | 'audio' | 'document', clientId: string, messageId: string, extension?: string): string {
  const folder = type === 'image' ? 'images' :
                type === 'video' ? 'videos' :
                type === 'audio' ? 'audios' :
                'documents'

  const ext = extension ?? (type === 'image' ? '.jpg' : type === 'video' ? '.mp4' : type === 'audio' ? '.mp3' : '.pdf')
  return `uploads/${clientId}/${folder}/${messageId}${ext}`
}
// Helper para obtener URL pública de Supabase Storage
export function getPublicUrl(bucket: string, path: string): string {
  return `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
// Helper para obtener URL firmada (para contenido privado)
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const client = SupabaseClientManager.getBrowserClient()
  const { data, error } = await client.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Error creating signed URL: ${error.message}`)
  }

  return data.signedUrl
}
// Funciones de utilidad para realtime (mantenidas por compatibilidad)
export interface ConversationEvent {
  type: 'message:new' | 'message:update' | 'conversation:update' | 'conversation:new' | 'conversation:delete'
  conversationId: string
  messageId?: string
  clientId: string
  data?: any
}
/**
 * Validate client access permissions using RLS
 */
async function validateClientAccess(clientId: string): Promise<void> {
  const client = SupabaseClientManager.getClient()

  try {
    const { data, error } = await client
      .from('Client')
      .select('id')
      .eq('id', clientId)
      .single()

    if (error) {
      throw SupabaseErrorHandler.handleRealtimeError(error, `validating client access for ${clientId}`)
    }

    if (!data) {
      throw new Error(`Client ${clientId} not found or access denied`)
    }
  } catch (error) {
    throw SupabaseErrorHandler.handleRealtimeError(error, `RLS validation for client ${clientId}`)
  }
}
/**
 * Validate user access permissions
 */
async function validateUserAccess(userId: string, clientId?: string): Promise<void> {
  const client = SupabaseClientManager.getClient()

  try {
    let query = client
      .from('User')
      .select('id')
      .eq('id', userId)

    if (clientId) {
      // Validate user belongs to client
      query = query.eq('clientId', clientId)
    }

    const { data, error } = await query.single()

    if (error) {
      throw SupabaseErrorHandler.handleRealtimeError(error, `validating user access for ${userId}`)
    }

    if (!data) {
      throw new Error(`User ${userId} not found or access denied`)
    }
  } catch (error) {
    throw SupabaseErrorHandler.handleRealtimeError(error, `RLS validation for user ${userId}`)
  }
}
/**
 * Enhanced error handling for Supabase operations
 */
export class SupabaseErrorHandler {
  static handleRealtimeError(error: any, context: string): Error {
    console.error(`[Supabase Realtime Error] ${context}:`, error)

    if (error?.code === 'PGRST116') {
      return new Error('Permisos insuficientes para acceder a los datos')
    }

    if (error?.code === 'PGRST301') {
      return new Error('Conexión a la base de datos perdida')
    }

    if (error?.message?.includes('JWT')) {
      return new Error('Sesión expirada, por favor vuelve a iniciar sesión')
    }

    return new Error(`Error de conexión: ${error?.message || 'Error desconocido'}`)
  }

  static handleSubscriptionError(error: any, subscriptionName: string): void {
    console.warn(`[Supabase Subscription Error] ${subscriptionName}:`, error)
  }
}

