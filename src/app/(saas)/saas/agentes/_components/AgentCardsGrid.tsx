"use client"
import { useAgentesProvider } from '@/providers/AgentesProvider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle, Plus } from 'lucide-react';
import AgentCard from './AgentCard';

export default function AgentCardsGrid() {
  const { agentes, isLoading, error } = useAgentesProvider();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-6 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar agentes</AlertTitle>
        <AlertDescription>
          {error ? (typeof error === 'string' ? error : error?.message ?? 'Error desconocido') : "Error desconocido"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!agentes || agentes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay agentes configurados</h3>
        <p className="text-gray-500 mb-6">Comienza creando tu primer agente para automatizar conversaciones</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Plus className="w-4 h-4" />
          <span>Haz clic en &quot;Crear Agente&quot; para comenzar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {agentes.map((agente) => (
        <AgentCard 
          key={agente.id} 
          agente={agente}
        />
      ))}
    </div>
  );
} 