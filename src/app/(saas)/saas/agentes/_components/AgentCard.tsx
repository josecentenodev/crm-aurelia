"use client";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot, Settings, MessageSquare, Crown, Play } from 'lucide-react';
import type { Agent } from '@/domain/Agentes';
import { useRouter } from 'next/navigation';

interface AgentCardProps {
  agente: Agent;
}

export default function AgentCard({ agente }: AgentCardProps) {
  const router = useRouter();

  // Verificar que el agente tenga los campos necesarios
  const isValidAgent = agente?.id && agente?.name && agente?.templateId;

  if (!isValidAgent) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-600 text-sm font-medium">Error: Datos del agente incompletos</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-violet-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
              <Bot className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900">
                {agente.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {agente.isPrincipal && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Principal
                  </Badge>
                )}
                {agente.isActive ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                    Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/saas/agentes/${agente.id}/editar`);
            }}
            title="Configurar agente"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MessageSquare className="w-4 h-4" />
          <span>
            <span className="font-medium text-gray-700">{agente.conversationsThisMonth}</span> conversaciones este mes
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/saas/agentes/${agente.id}/editar`);
            }}
          >
            <Settings className="w-4 h-4 mr-1" />
            Configurar
          </Button>
          <Button 
            size="sm"
            className="flex-1 bg-violet-600 hover:bg-violet-700"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/saas/agentes/playground/${agente.id}`);
            }}
          >
            <Play className="w-4 h-4 mr-1" />
            Probar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 