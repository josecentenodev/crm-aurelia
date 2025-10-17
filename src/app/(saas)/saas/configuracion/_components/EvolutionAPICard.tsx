"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  CheckCircle,
  Settings
} from "lucide-react"
import type { Integration } from "@/domain/Integraciones"
import { EvolutionInstanceManager } from "./EvolutionInstanceManager"

interface EvolutionAPICardProps {
  integration: Integration
  onUpdate: () => void
}

export function EvolutionAPICard({ integration, onUpdate }: EvolutionAPICardProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-[#075E54]">
          <Bot className="w-5 h-5 text-[#25D366]" />
          <span>Instancias WhatsApp</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado del contenedor */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Estado</span>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {integration.clientIntegration?.evolutionApi?.containerStatus === "RUNNING" ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {/* Gestión completa de instancias */}
        <EvolutionInstanceManager 
          integration={integration} 
          onUpdate={onUpdate} 
        />
      </CardContent>
    </Card>
  )
} 