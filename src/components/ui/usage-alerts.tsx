"use client";

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Bell, BellOff, ChevronDown, ChevronUp, AlertTriangle, X } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"

// Tipos específicos para alertas
interface AlertData {
  id: string
  type: "usage" | "limit" | "warning"
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  usagePercentage?: number
  limit?: number
  current?: number
  resource?: string
  createdAt: Date
  dismissedAt?: Date
}

interface UsageAlert {
  alert: AlertData
  clientId: string
  planId: string
}

interface UsageAlertsProps {
  clientId?: string;
  planId?: string;
  showAll?: boolean;
  maxAlerts?: number;
  autoRefresh?: boolean;
}

export function UsageAlerts({ 
  clientId, 
  planId, 
  showAll = false, 
  maxAlerts = 5, 
  autoRefresh = true 
}: UsageAlertsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { toast } = useToast()

  const { data: alerts = [], isLoading, refetch } = api.planes.getUsageAlerts.useQuery(
    { clientId, planId },
    {
      enabled: !!clientId || !!planId,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 segundos
    }
  )

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      void refetch()
    }, 60000) // 1 minuto

    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  const dismissAlertMutation = api.planes.dismissUsageAlert.useMutation({
    onSuccess: () => {
      toast({
        title: "Alerta descartada",
        description: "La alerta se ha descartado temporalmente",
      });
    },
  });

  const dismissAlert = (clientId: string) => {
    dismissAlertMutation.mutate({ clientId })
  }

  // Filtrar alertas visibles
  const visibleAlerts = alerts
    .filter((alert: UsageAlert) => !alert.alert.dismissedAt)
    .slice(0, showAll ? undefined : maxAlerts)

  const getAlertSeverity = (alert: UsageAlert) => {
    const percentage = alert.alert.usagePercentage || 0;
    if (percentage >= 95) return "critical";
    if (percentage >= 85) return "high";
    return "medium";
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Alertas de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-4 w-4 text-muted-foreground" />
            Alertas de Uso
          </CardTitle>
          <CardDescription>
            No hay alertas de uso activas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <CardTitle>Alertas de Uso</CardTitle>
            <Badge variant="secondary">{visibleAlerts.length}</Badge>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CardDescription>
          Monitoreo de uso de recursos y límites de plan
        </CardDescription>
      </CardHeader>
      
      <CollapsibleContent>
        <CardContent className="space-y-3">
          {visibleAlerts.map((alert, index) => {
            const severity = getAlertSeverity(alert);
            const variant = getAlertVariant(severity) as "default" | "destructive";
            
            return (
              <SingleAlert
                key={`${alert.clientId}-${index}`}
                alert={alert}
                onDismiss={() => dismissAlert(alert.clientId)}
                showDetails={!isCollapsed}
              />
            );
          })}
        </CardContent>
      </CollapsibleContent>
    </Card>
  );
}

interface SingleAlertProps {
  alert: UsageAlert;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export function SingleAlert({ alert, onDismiss, showDetails = false }: SingleAlertProps) {
  const severity = alert.alert.severity;
  const variant = getAlertVariant(severity) as "default" | "destructive";
  
  return (
    <Alert variant={variant}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {getAlertIcon(severity)}
          <div className="flex-1">
            <AlertDescription className="font-medium">
              {alert.alert.title}
            </AlertDescription>
            {showDetails && (
              <div className="mt-1 text-sm text-muted-foreground">
                {alert.alert.message}
                {alert.alert.usagePercentage && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Uso actual</span>
                      <span>{alert.alert.usagePercentage}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          alert.alert.usagePercentage >= 95
                            ? "bg-red-500"
                            : alert.alert.usagePercentage >= 85
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${Math.min(alert.alert.usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
} 