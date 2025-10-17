"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

interface PlanUsageCardProps {
  clientId: string;
}

export function PlanUsageCard({ clientId }: PlanUsageCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data: usageData, refetch, isLoading } = api.planes.getClientUsage.useQuery(
    { clientId },
    {
      refetchInterval: 30000, // Refrescar cada 30 segundos
      staleTime: 10000, // Considerar datos frescos por 10 segundos
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Datos actualizados",
        description: "La información de uso se ha actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de uso",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Uso del Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso del Plan</CardTitle>
          <CardDescription>No se pudo cargar la información de uso</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { usage, limits, alerts, totalCost, planName } = usageData;

  const getUsagePercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "destructive";
    if (percentage >= 75) return "warning";
    return "default";
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (percentage >= 75) return <Info className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const whatsappPercentage = getUsagePercentage(usage.whatsappInstances, limits.maxWhatsAppInstances);
  const agentsPercentage = getUsagePercentage(usage.agents, limits.maxAgents);
  const contactsPercentage = getUsagePercentage(usage.contacts, limits.maxContacts);
  const usersPercentage = getUsagePercentage(usage.users, limits.maxUsers);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uso del Plan: {planName}</CardTitle>
            <CardDescription>
              Monitoreo de recursos y límites de tu plan actual
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WhatsApp Instances */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getUsageIcon(whatsappPercentage)}
              <span className="font-medium">Instancias WhatsApp</span>
            </div>
            <Badge variant={getUsageColor(whatsappPercentage) as any}>
              {usage.whatsappInstances} / {limits.maxWhatsAppInstances}
            </Badge>
          </div>
          <Progress value={whatsappPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Costo por instancia: ${limits.costPerWhatsAppInstance}
          </p>
        </div>

        {/* Agents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getUsageIcon(agentsPercentage)}
              <span className="font-medium">Agentes</span>
            </div>
            <Badge variant={getUsageColor(agentsPercentage) as any}>
              {usage.agents} / {limits.maxAgents}
            </Badge>
          </div>
          <Progress value={agentsPercentage} className="h-2" />
        </div>

        {/* Contacts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getUsageIcon(contactsPercentage)}
              <span className="font-medium">Contactos</span>
            </div>
            <Badge variant={getUsageColor(contactsPercentage) as any}>
              {usage.contacts} / {limits.maxContacts}
            </Badge>
          </div>
          <Progress value={contactsPercentage} className="h-2" />
        </div>

        {/* Users */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getUsageIcon(usersPercentage)}
              <span className="font-medium">Usuarios</span>
            </div>
            <Badge variant={getUsageColor(usersPercentage) as any}>
              {usage.users} / {limits.maxUsers}
            </Badge>
          </div>
          <Progress value={usersPercentage} className="h-2" />
        </div>

        {/* Cost Summary */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Costo Total Mensual</span>
            <span className="text-lg font-bold">${totalCost.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Basado en el uso actual de recursos
          </p>
        </div>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Alertas</h4>
            {alerts.map((alert, index) => (
              <Alert key={index} variant={alert.severity === "high" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Usage Tips */}
        <div className="rounded-lg bg-muted p-4">
          <h4 className="font-medium text-sm mb-2">Consejos de Uso</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Las instancias de WhatsApp se cobran por mes</li>
            <li>• Considera eliminar instancias no utilizadas para reducir costos</li>
            <li>• Contacta soporte si necesitas aumentar los límites de tu plan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 