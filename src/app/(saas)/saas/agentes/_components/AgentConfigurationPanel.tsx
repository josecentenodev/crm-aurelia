"use client"
import { Badge } from "@/components/ui/badge"
import { Bot, User } from "lucide-react"
import type { Agent } from "@/domain/Agentes"

interface AgentConfigurationPanelProps {
  agent: Agent
}

export default function AgentConfigurationPanel({ agent }: AgentConfigurationPanelProps) {
  // Función para renderizar el valor de un campo
  const renderFieldValue = (value: unknown) => {
    if (!value) return <span className="text-gray-400 italic">No configurado</span>
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    
    // Manejar arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400 italic">Vacío</span>
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="text-xs text-gray-700">
              • {String(item)}
            </div>
          ))}
        </div>
      )
    }
    
    // Manejar objetos
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      const keys = Object.keys(obj)
      
      if (keys.length === 0) return <span className="text-gray-400 italic">Vacío</span>
      
      // Si es un objeto simple con pocas propiedades, mostrarlas
      if (keys.length <= 3) {
        return (
          <div className="space-y-1">
            {keys.map(key => (
              <div key={key} className="text-xs text-gray-700">
                <span className="font-medium">{key}:</span> {String(obj[key])}
              </div>
            ))}
          </div>
        )
      }
      
      // Si es un objeto complejo, mostrar el número de propiedades
      return <span className="text-gray-600">{keys.length} configuraciones</span>
    }
    
    // Fallback para otros tipos
    if (typeof value === 'undefined') return <span className="text-gray-400 italic">No definido</span>
    if (value === null) return <span className="text-gray-400 italic">Nulo</span>
    return <span className="text-gray-600">Configurado</span>
  }

  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto min-h-0">
      <div className="h-16 p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
        <span className="font-semibold text-gray-900">Configuración</span>
        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
          {agent.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      
      <div className="flex-1 p-2 space-y-4">
        {/* Información Básica */}
        <div className="bg-white rounded-lg shadow-sm border-0">
          <div className="p-4 pb-3">
            <div className="flex items-center text-sm font-medium mb-3">
              <Bot className="w-4 h-4 mr-2 text-violet-600" />
              Información Básica
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Nombre</label>
                <p className="text-sm text-gray-900">{agent.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Estado</label>
                <Badge variant={agent.isActive ? "default" : "secondary"} className="text-xs">
                  {agent.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              {agent.isPrincipal && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Tipo</label>
                  <Badge variant="outline" className="text-xs">
                    Principal
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campos Personalizados */}
        {agent.customFields && Object.keys(agent.customFields).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border-0">
            <div className="p-4 pb-3">
              <div className="flex items-center text-sm font-medium mb-3">
                <User className="w-4 h-4 mr-2 text-green-600" />
                Configuración Personalizada
              </div>
              <div className="space-y-3">
                {Object.entries(agent.customFields).map(([key, value], index) => (
                  <div key={index}>
                    <label className="text-xs font-medium text-gray-500">{key}</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-700 font-mono">
                      {renderFieldValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 