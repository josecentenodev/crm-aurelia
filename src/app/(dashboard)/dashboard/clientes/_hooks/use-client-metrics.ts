import { useState } from "react"
import { api } from "@/trpc/react"

export type MetricsPeriod = "7d" | "30d" | "90d"
export type MetricsType = "conversations" | "contacts" | "messages"
export type GroupByType = "day" | "week" | "month"

interface UseClientMetricsOptions {
  clientId: string
  period?: MetricsPeriod
  enabled?: boolean
}

export function useClientMetrics({ 
  clientId, 
  period = "30d", 
  enabled = true 
}: UseClientMetricsOptions) {
  const [selectedPeriod, setSelectedPeriod] = useState<MetricsPeriod>(period)

  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = api.clientes.getClientMetrics.useQuery(
    {
      clientId,
      period: selectedPeriod
    },
    {
      enabled: enabled && !!clientId,
      refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
      staleTime: 2 * 60 * 1000 // Considerar datos frescos por 2 minutos
    }
  )

  const {
    data: detailedMetrics,
    isLoading: isLoadingDetailed,
    error: errorDetailed
  } = api.clientes.getClientDetailedMetrics.useQuery(
    {
      clientId,
      metric: "conversations",
      period: selectedPeriod,
      groupBy: "day"
    },
    {
      enabled: enabled && !!clientId,
      refetchInterval: 5 * 60 * 1000,
      staleTime: 2 * 60 * 1000
    }
  )

  const updatePeriod = (newPeriod: MetricsPeriod) => {
    setSelectedPeriod(newPeriod)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return "trending-up"
    if (growth < 0) return "trending-down"
    return "minus"
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  return {
    // Data
    metrics,
    detailedMetrics,
    
    // State
    selectedPeriod,
    isLoading,
    isLoadingDetailed,
    error,
    errorDetailed,
    
    // Actions
    updatePeriod,
    refetch,
    
    // Utils
    getGrowthColor,
    getGrowthIcon,
    formatPercentage,
    formatNumber
  }
}

export function useClientDetailedMetrics(
  clientId: string,
  metric: MetricsType = "conversations",
  period: MetricsPeriod = "30d",
  groupBy: GroupByType = "day"
) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = api.clientes.getClientDetailedMetrics.useQuery(
    {
      clientId,
      metric,
      period,
      groupBy
    },
    {
      enabled: !!clientId,
      refetchInterval: 5 * 60 * 1000,
      staleTime: 2 * 60 * 1000
    }
  )

  return {
    data,
    isLoading,
    error,
    refetch
  }
}

