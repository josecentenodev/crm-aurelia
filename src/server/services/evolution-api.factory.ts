import { db } from "@/server/db"
import { env } from "@/env"
import { EvolutionAPIService } from "@/services/evolution-api-service"

export async function getEvolutionApiServiceFromDB(): Promise<EvolutionAPIService> {
  // Buscar configuración global para EVOLUTION_API
  const integration = await db.globalIntegration.findFirst({
    where: { type: "EVOLUTION_API", isActive: true },
    select: { backendUrl: true, apiKey: true, name: true }
  })

  const baseUrl = integration?.backendUrl ?? env.EVOLUTION_API_URL
  const apiKey = integration?.apiKey ?? env.EVOLUTION_API_KEY

  // Log de configuración para debugging
  console.log("🔧 Evolution API Configuration:", {
    hasIntegration: !!integration,
    integrationName: integration?.name,
    usingDBConfig: !!integration?.backendUrl,
    baseUrl: baseUrl ? `${baseUrl.substring(0, 30)}...` : 'undefined',
    hasApiKey: !!apiKey,
    envFallback: {
      EVOLUTION_API_URL: env.EVOLUTION_API_URL ? `${env.EVOLUTION_API_URL.substring(0, 30)}...` : 'undefined',
      EVOLUTION_API_KEY: env.EVOLUTION_API_KEY ? '***' : 'undefined'
    }
  })

  if (!baseUrl || !apiKey) {
    const errorMsg = `Configuración de Evolution API no encontrada. 
    - Integración global: ${integration ? 'encontrada' : 'no encontrada'}
    - backendUrl: ${baseUrl ? 'configurado' : 'faltante'}
    - apiKey: ${apiKey ? 'configurado' : 'faltante'}
    - Variables de entorno: ${env.EVOLUTION_API_URL ? 'EVOLUTION_API_URL configurado' : 'EVOLUTION_API_URL faltante'}, ${env.EVOLUTION_API_KEY ? 'EVOLUTION_API_KEY configurado' : 'EVOLUTION_API_KEY faltante'}`
    
    console.error("❌", errorMsg)
    throw new Error(errorMsg)
  }

  return new EvolutionAPIService(baseUrl, apiKey)
}


