import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

interface UsePlanLimitsOptions {
  clientId?: string;
  planId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function usePlanLimits(options: UsePlanLimitsOptions = {}) {
  const { clientId, planId, autoRefresh = true, refreshInterval = 30000 } = options;
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  // Query para obtener uso del cliente
  const {
    data: clientUsage,
    refetch: refetchClientUsage,
    isLoading: isLoadingClientUsage,
    error: clientUsageError
  } = api.planes.getClientUsage.useQuery(
    { clientId: clientId! },
    {
      enabled: !!clientId,
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 10000,
    }
  );

  // Query para obtener estadísticas del plan
  const {
    data: planStats,
    refetch: refetchPlanStats,
    isLoading: isLoadingPlanStats,
    error: planStatsError
  } = api.planes.getPlanUsageStats.useQuery(
    { planId },
    {
      enabled: !!planId,
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 30000,
    }
  );

  // Query para obtener alertas de uso
  const {
    data: usageAlerts,
    refetch: refetchUsageAlerts,
    isLoading: isLoadingUsageAlerts,
    error: usageAlertsError
  } = api.planes.getUsageAlerts.useQuery(
    { threshold: 80 },
    {
      refetchInterval: autoRefresh ? refreshInterval : false,
      staleTime: 15000,
    }
  );

  // Mutation para validar límites
  const validateLimitsMutation = api.planes.validateClientLimits.useMutation({
    onSuccess: (data) => {
      if (!data.isValid) {
        toast({
          title: "Límite alcanzado",
          description: data.message || "Has alcanzado el límite de recursos de tu plan",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error de validación",
        description: error.message || "No se pudo validar los límites",
        variant: "destructive",
      });
    },
  });

  // Mutation para actualizar límites del plan
  const updatePlanLimitsMutation = api.planes.updatePlanLimits.useMutation({
    onSuccess: () => {
      toast({
        title: "Límites actualizados",
        description: "Los límites del plan se han actualizado correctamente",
      });
      // Refrescar datos relacionados
      refetchClientUsage();
      refetchPlanStats();
      refetchUsageAlerts();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron actualizar los límites",
        variant: "destructive",
      });
    },
  });

  // Función para validar límites antes de crear recursos
  const validateResourceCreation = useCallback(async (
    resourceType: "whatsapp_instances" | "agents" | "contacts" | "users",
    currentCount: number
  ) => {
    if (!clientId) {
      throw new Error("ClientId es requerido para validar límites");
    }

    setIsValidating(true);
    try {
      const result = await validateLimitsMutation.mutateAsync({
        clientId,
        resourceType,
        currentCount,
      });
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [clientId, validateLimitsMutation]);

  // Función para verificar si se puede crear una instancia de WhatsApp
  const canCreateWhatsAppInstance = useCallback(() => {
    if (!clientUsage) return false;
    
    const { usage, limits } = clientUsage;
    return usage.whatsappInstances < limits.maxWhatsAppInstances;
  }, [clientUsage]);

  // Función para obtener el porcentaje de uso de un recurso
  const getUsagePercentage = useCallback((resourceType: 'whatsappInstances' | 'agents' | 'contacts' | 'users') => {
    if (!clientUsage) return 0;
    
    const { usage, limits } = clientUsage;
    const current = usage[resourceType] || 0;
    const max = limits[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}` as keyof typeof limits] || 0;
    
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  }, [clientUsage]);

  // Función para obtener el color del badge según el porcentaje de uso
  const getUsageColor = useCallback((percentage: number) => {
    if (percentage >= 90) return "destructive";
    if (percentage >= 75) return "warning";
    return "default";
  }, []);

  // Función para verificar si el uso está cerca del límite
  const isUsageNearLimit = useCallback((resourceType: 'whatsappInstances' | 'agents' | 'contacts' | 'users', threshold = 80) => {
    const percentage = getUsagePercentage(resourceType);
    return percentage >= threshold;
  }, [getUsagePercentage]);

  // Función para obtener alertas específicas del cliente
  const getClientAlerts = useCallback(() => {
    if (!clientUsage || !usageAlerts) return [];
    
    return usageAlerts.filter(alert => alert.clientId === clientId);
  }, [clientUsage, usageAlerts, clientId]);

  // Función para refrescar todos los datos
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refetchClientUsage(),
        refetchPlanStats(),
        refetchUsageAlerts(),
      ]);
      
      toast({
        title: "Datos actualizados",
        description: "La información de uso se ha actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la información",
        variant: "destructive",
      });
    }
  }, [refetchClientUsage, refetchPlanStats, refetchUsageAlerts, toast]);

  return {
    // Data
    clientUsage,
    planStats,
    usageAlerts,
    clientAlerts: getClientAlerts(),
    
    // Loading states
    isLoading: isLoadingClientUsage || isLoadingPlanStats || isLoadingUsageAlerts,
    isValidating,
    
    // Errors
    error: clientUsageError || planStatsError || usageAlertsError,
    
    // Mutations
    validateResourceCreation,
    updatePlanLimits: updatePlanLimitsMutation.mutateAsync,
    
    // Utility functions
    canCreateWhatsAppInstance,
    getUsagePercentage,
    getUsageColor,
    isUsageNearLimit,
    
    // Refresh functions
    refreshAll,
    refetchClientUsage,
    refetchPlanStats,
    refetchUsageAlerts,
  };
} 