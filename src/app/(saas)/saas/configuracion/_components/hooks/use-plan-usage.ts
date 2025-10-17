import { useState } from "react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import type { PlanUsageData } from "../types"

export function usePlanUsage() {
  const { clientId } = useClientContext()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { data: usageData, refetch, isLoading } = api.planes.getClientUsage.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId,
      refetchInterval: 30000, // Refrescar cada 30 segundos
      staleTime: 10000, // Considerar datos frescos por 10 segundos
    }
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      toast({
        title: "Datos actualizados",
        description: "La información de uso se ha actualizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de uso",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getUsagePercentage = (current: number, max: number) => {
    if (max === 0) return 0
    return Math.min((current / max) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "destructive"
    if (percentage >= 75) return "warning"
    return "default"
  }

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return "alert-triangle"
    if (percentage >= 75) return "info"
    return "check-circle"
  }

  const usageStats = usageData ? {
    whatsappPercentage: getUsagePercentage(usageData.usage.whatsappInstances, usageData.limits.maxWhatsAppInstances),
    agentsPercentage: getUsagePercentage(usageData.usage.agents, usageData.limits.maxAgents),
    contactsPercentage: getUsagePercentage(usageData.usage.contacts, usageData.limits.maxContacts),
    usersPercentage: getUsagePercentage(usageData.usage.users, usageData.limits.maxUsers),
    
    whatsappColor: getUsageColor(getUsagePercentage(usageData.usage.whatsappInstances, usageData.limits.maxWhatsAppInstances)),
    agentsColor: getUsageColor(getUsagePercentage(usageData.usage.agents, usageData.limits.maxAgents)),
    contactsColor: getUsageColor(getUsagePercentage(usageData.usage.contacts, usageData.limits.maxContacts)),
    usersColor: getUsageColor(getUsagePercentage(usageData.usage.users, usageData.limits.maxUsers)),
    
    whatsappIcon: getUsageIcon(getUsagePercentage(usageData.usage.whatsappInstances, usageData.limits.maxWhatsAppInstances)),
    agentsIcon: getUsageIcon(getUsagePercentage(usageData.usage.agents, usageData.limits.maxAgents)),
    contactsIcon: getUsageIcon(getUsagePercentage(usageData.usage.contacts, usageData.limits.maxContacts)),
    usersIcon: getUsageIcon(getUsagePercentage(usageData.usage.users, usageData.limits.maxUsers))
  } : null

  return {
    usageData: usageData as PlanUsageData | undefined,
    usageStats,
    isLoading,
    isRefreshing,
    clientId,
    handleRefresh,
    refetch
  }
}
