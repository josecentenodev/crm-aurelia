"use client"

import { api } from '@/trpc/react'
import { useCallback } from 'react'
import type { Agent, UpdateAgent } from '@/domain/Agentes'

export function useAgentCache() {
  const utils = api.useUtils()

  const invalidateAgent = useCallback((agentId: string) => {
    void utils.agentes.getAgenteById.invalidate({ id: agentId })
  }, [utils])

  const invalidateAgentsList = useCallback((clientId: string) => {
    void utils.agentes.getAgentesByClient.invalidate({ clientId })
  }, [utils])

  const updateAgentOptimistically = useCallback((
    agentId: string, 
    clientId: string, 
    updates: Partial<UpdateAgent>
  ) => {
    // Optimistic update para la lista de agentes
    utils.agentes.getAgentesByClient.setData(
      { clientId },
      (oldData) => {
        if (!oldData) return oldData
        return oldData.map(agent => 
          agent.id === agentId 
            ? { ...agent, ...updates }
            : agent
        )
      }
    )

    // Optimistic update para el agente individual
    utils.agentes.getAgenteById.setData(
      { id: agentId },
      (oldData) => {
        if (!oldData) return oldData
        return { ...oldData, ...updates }
      }
    )
  }, [utils])

  const removeAgentOptimistically = useCallback((agentId: string, clientId: string) => {
    // Optimistic update para la lista de agentes
    utils.agentes.getAgentesByClient.setData(
      { clientId },
      (oldData) => {
        if (!oldData) return oldData
        return oldData.filter(agent => agent.id !== agentId)
      }
    )

    // Invalidar el agente individual
    invalidateAgent(agentId)
  }, [utils, invalidateAgent])

  const addAgentOptimistically = useCallback((newAgent: Agent, clientId: string) => {
    // Optimistic update para la lista de agentes
    utils.agentes.getAgentesByClient.setData(
      { clientId },
      (oldData) => {
        if (!oldData) return [newAgent]
        return [...oldData, newAgent]
      }
    )
  }, [utils])

  return {
    invalidateAgent,
    invalidateAgentsList,
    updateAgentOptimistically,
    removeAgentOptimistically,
    addAgentOptimistically
  }
}

