/*
"use client"
*/
import { Plus, Bot } from "lucide-react"
import AgentStats from "./_components/AgentStats"
import AgentCardsGrid from "./_components/AgentCardsGrid"
import { SectionHeader } from "../../../../components/ui/section-header"
import Link from "next/link";

/*
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAgentesProvider } from "@/providers/AgentesProvider"
*/

export default function AgentesPage() {
  /*
  const router = useRouter()
  const agentesProvider = useAgentesProvider()
  
  // Mostrar loading si está cargando
  if (agentesProvider.isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Agentes IA" description="Cargando agentes..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-200 border-t-violet-600 mx-auto mb-6"></div>
            <p className="text-gray-500 text-lg">Cargando agentes...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar error si hay error
  if (agentesProvider.error) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Agentes IA" description="Error al cargar agentes" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar agentes</h3>
            <p className="text-gray-500 mb-6">{typeof agentesProvider.error === 'string' ? agentesProvider.error : agentesProvider.error?.message ?? 'Error desconocido'}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }
  */

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Agentes IA" 
        description="Gestiona y configura tus agentes de inteligencia artificial"
      >
        <Link 
          href="/saas/agentes/crear"
          className="bg-violet-600 hover:bg-violet-700 px-6 py-3 h-12 text-base font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo 
        </Link>
        {/*
        <Button 
          className="bg-violet-600 hover:bg-violet-700 px-6 py-3 h-12 text-base font-medium"
          onClick={() => router.push('/saas/agentes/crear')}
        >
        </Button>
        */}
      </SectionHeader>

      {/* Stats */}
      <AgentStats />

      {/* Agents Grid */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agentes</h2>
            <p className="text-gray-500 text-sm">Gestiona y prueba tus agentes</p>
          </div>
        </div>
        <AgentCardsGrid />
      </div>
    </div>
  )
}
