"use client"

import { api } from '@/trpc/react'
import { useClientContext } from './ClientProvider'

export function useDashboardProvider() {
  const { clientId, isAureliaUser, isLoading, error } = useClientContext()

  // Query para obtener métricas básicas
  const metricsQuery = api.dashboardCliente.getMetrics.useQuery(
    { clientId: clientId ?? undefined },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutos
    }
  )

  // Query para obtener métricas por canal
  const channelMetricsQuery = api.dashboardCliente.getChannelMetrics.useQuery(
    { clientId: clientId ?? undefined },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  )

  // Query para obtener actividad reciente
  const recentActivityQuery = api.dashboardCliente.getRecentActivity.useQuery(
    { 
      clientId: clientId ?? undefined,
      limit: 10 
    },
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1 minuto
    }
  )

  // Query para obtener métricas por status
  const statusMetricsQuery = api.dashboardCliente.getStatusMetrics.useQuery(
    undefined,
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  )

  // Query para obtener rendimiento de agentes
  const agentPerformanceQuery = api.dashboardCliente.getAgentPerformance.useQuery(
    undefined,
    {
      enabled: !!clientId && !isLoading,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  )

  // Utils para invalidar queries
  const utils = api.useUtils()

  // Función para invalidar queries del dashboard
  const invalidateDashboard = () => {
    utils.dashboardCliente.invalidate()
  }

  // Función para invalidar todo
  const invalidateAll = () => {
    utils.dashboardCliente.invalidate()
  }

  const isLoadingData = isLoading || 
    metricsQuery.isLoading || 
    channelMetricsQuery.isLoading || 
    recentActivityQuery.isLoading || 
    statusMetricsQuery.isLoading || 
    agentPerformanceQuery.isLoading

  const hasError = error || 
    metricsQuery.error || 
    channelMetricsQuery.error || 
    recentActivityQuery.error || 
    statusMetricsQuery.error || 
    agentPerformanceQuery.error

  return {
    // Estado
    clientId,
    isAureliaUser,
    isLoading: isLoadingData,
    error: hasError,

    // Datos
    metrics: metricsQuery.data,
    channelMetrics: channelMetricsQuery.data,
    recentActivity: recentActivityQuery.data,
    statusMetrics: statusMetricsQuery.data,
    agentPerformance: agentPerformanceQuery.data,

    // Funciones de invalidación
    invalidateDashboard,
    invalidateAll,
  }
} 