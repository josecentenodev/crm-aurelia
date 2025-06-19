export interface Agent {
  id: string
  name: string
  description: string | null
  instructions: string | null
  model: string
  temperature: number
  max_tokens: number
  is_active: boolean
  is_principal?: boolean
  etapas?: string[]
  canales?: string[]
  personalidad?: string
  conversaciones_mes?: number
  created_at: string
  updated_at: string
}