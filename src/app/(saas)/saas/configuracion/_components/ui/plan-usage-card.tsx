"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { PlanUsageCardProps } from "../types"
import { usePlanUsage } from "../hooks/use-plan-usage"

export function PlanUsageCard({ clientId }: PlanUsageCardProps) {
  const { usageData, usageStats, isLoading, isRefreshing, handleRefresh } = usePlanUsage()

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
    )
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
    )
  }

  const { usage, limits, alerts, totalCost, planName } = usageData

  const getUsageIcon = (iconName: string) => {
    switch (iconName) {
      case "alert-triangle":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "info":
        return <Info className="h-4 w-4 text-warning" />
      case "check-circle":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

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
              {usageStats?.whatsappIcon && getUsageIcon(usageStats.whatsappIcon)}
              <span className="font-medium">Instancias WhatsApp</span>
            </div>
            <Badge variant={usageStats?.whatsappColor as any}>
              {usage.whatsappInstances} / {limits.maxWhatsAppInstances}
            </Badge>
          </div>
          <Progress value={usageStats?.whatsappPercentage || 0} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Costo por instancia: ${limits.costPerWhatsAppInstance}
          </p>
        </div>

        {/* Agents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {usageStats?.agentsIcon && getUsageIcon(usageStats.agentsIcon)}
              <span className="font-medium">Agentes</span>
            </div>
            <Badge variant={usageStats?.agentsColor as any}>
              {usage.agents} / {limits.maxAgents}
            </Badge>
          </div>
          <Progress value={usageStats?.agentsPercentage || 0} className="h-2" />
        </div>

        {/* Contacts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {usageStats?.contactsIcon && getUsageIcon(usageStats.contactsIcon)}
              <span className="font-medium">Contactos</span>
            </div>
            <Badge variant={usageStats?.contactsColor as any}>
              {usage.contacts} / {limits.maxContacts}
            </Badge>
          </div>
          <Progress value={usageStats?.contactsPercentage || 0} className="h-2" />
        </div>

        {/* Users */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {usageStats?.usersIcon && getUsageIcon(usageStats.usersIcon)}
              <span className="font-medium">Usuarios</span>
            </div>
            <Badge variant={usageStats?.usersColor as any}>
              {usage.users} / {limits.maxUsers}
            </Badge>
          </div>
          <Progress value={usageStats?.usersPercentage || 0} className="h-2" />
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
  )
}
