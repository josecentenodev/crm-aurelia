import { db } from "@/server/db";
import { 
  validateInstanceLimit,
  calculatePlanUsage,
  calculatePlanCost,
  generateUsageAlert
} from "@/lib/utils/plan-limits";
import { TRPCError } from "@trpc/server";
import { type Client, type ClientPlan } from "@prisma/client";

// Definir interfaces específicas para eliminar el uso de 'any'
export interface PlanUsage {
  users: number;
  contacts: number;
  agents: number;
  instances: number;
  storageUsed: number;
  storageLimit: number;
  percentageUsed: number;
}

export interface UsageAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  threshold: number;
  currentValue: number;
  limit: number;
  severity: 'low' | 'medium' | 'high';
}

export interface PlanLimits {
  maxUsers: number;
  maxContacts: number;
  maxAgents: number;
  maxInstances: number;
  costPerInstance: number;
  storageLimit?: number;
}

export interface ClientUsageData {
  clientId: string;
  clientName: string;
  planName: string;
  usage: PlanUsage;
  totalCost: number;
  limits: PlanLimits;
  alerts: UsageAlert[];
}

export interface PlanUsageStats {
  planId: string;
  planName: string;
  totalClients: number;
  usage: PlanUsage;
  totalCost: number;
  limits: PlanLimits;
}

export interface ValidationResult {
  isValid: boolean;
  currentCount: number;
  maxAllowed: number;
  remaining: number;
  cost: number;
  message?: string;
}

export interface PlanChangeValidation {
  isValid: boolean;
  currentUsage: PlanUsage;
  newLimits: PlanLimits;
  conflicts: string[];
  message?: string;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

export class PlanLimitsService {
  private static instance: PlanLimitsService;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private constructor() {
    // Constructor privado para Singleton
  }

  public static getInstance(): PlanLimitsService {
    if (!PlanLimitsService.instance) {
      PlanLimitsService.instance = new PlanLimitsService();
    }
    return PlanLimitsService.instance;
  }

  private getCacheKey(key: string): string {
    return `plan-limits:${key}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(this.getCacheKey(key), {
      data,
      timestamp: Date.now()
    });
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(this.getCacheKey(key));
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data as T;
    }
    return null;
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(pattern)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Valida si un cliente puede crear una nueva instancia
   */
  async validateInstanceCreation(clientId: string): Promise<ValidationResult> {
    const cacheKey = `validate-instance-${clientId}`;
    const cached = this.getCache<ValidationResult>(cacheKey);
    if (cached) return cached;

    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        plan: true,
        instances: true
      }
    });

    if (!client) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente no encontrado"
      });
    }

    if (!client.plan) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El cliente no tiene un plan asignado"
      });
    }

    const currentCount = client.instances.length;
    const maxAllowed = client.plan.maxInstances;
    const remaining = Math.max(0, maxAllowed - currentCount);
    const cost = client.plan.costPerInstance;

    const result: ValidationResult = {
      isValid: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      remaining,
      cost: Number(cost),
      message: currentCount >= maxAllowed 
        ? `Límite de instancias alcanzado (${currentCount}/${maxAllowed})`
        : undefined
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Obtiene estadísticas de uso para un cliente específico
   */
  async getClientUsage(clientId: string): Promise<ClientUsageData> {
    const cacheKey = `client-usage-${clientId}`;
    const cached = this.getCache<ClientUsageData>(cacheKey);
    if (cached) return cached;

    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        plan: true,
        instances: true,
        agentes: true,
        contacts: true,
        users: true
      }
    });

    if (!client) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente no encontrado"
      });
    }

    if (!client.plan) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "El cliente no tiene un plan asignado"
      });
    }

    const currentUsage = {
      users: client.users.length,
      contacts: client.contacts.length,
      agents: client.agentes.length,
      instances: client.instances.length
    };

    const usage = calculatePlanUsage(client.plan, currentUsage);
    const totalCost = calculatePlanCost(client.plan, currentUsage);
    const alerts = generateUsageAlert('instances', currentUsage.instances, client.plan.maxInstances);

    const result: ClientUsageData = {
      clientId: client.id,
      clientName: client.name,
      planName: client.plan.name,
      usage: {
        users: currentUsage.users,
        contacts: currentUsage.contacts,
        agents: currentUsage.agents,
        instances: currentUsage.instances,
        storageUsed: 0, // TODO: Implementar cálculo de almacenamiento
        storageLimit: client.plan.storageLimit || 0,
        percentageUsed: 0 // TODO: Implementar cálculo de porcentaje
      },
      totalCost: Number(totalCost),
      limits: {
        maxUsers: client.plan.maxUsers,
        maxContacts: client.plan.maxContacts,
        maxAgents: client.plan.maxAgents,
        maxInstances: client.plan.maxInstances,
        costPerInstance: Number(client.plan.costPerInstance)
      },
      alerts: [{
        type: 'info',
        message: alerts,
        threshold: 80,
        currentValue: currentUsage.instances,
        limit: client.plan.maxInstances,
        severity: 'medium'
      }]
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Obtiene estadísticas de uso para todos los planes
   */
  async getPlansUsageStats(planId?: string): Promise<PlanUsageStats[]> {
    const cacheKey = `plans-stats-${planId || 'all'}`;
    const cached = this.getCache<PlanUsageStats[]>(cacheKey);
    if (cached) return cached;

    const whereClause = planId ? { id: planId } : {};

    const plans = await db.clientPlan.findMany({
      where: whereClause,
      include: {
        clients: {
          include: {
            instances: true,
            agentes: true,
            contacts: true,
            users: true
          }
        }
      }
    });

    const stats: PlanUsageStats[] = [];

    for (const plan of plans) {
      const totalUsage = {
        users: plan.clients.reduce((sum, client) => sum + client.users.length, 0),
        contacts: plan.clients.reduce((sum, client) => sum + client.contacts.length, 0),
        agents: plan.clients.reduce((sum, client) => sum + client.agentes.length, 0),
        instances: plan.clients.reduce((sum, client) => sum + client.instances.length, 0)
      };

      const usage = calculatePlanUsage(plan, totalUsage);
      const totalCost = calculatePlanCost(plan, totalUsage);

      stats.push({
        planId: plan.id,
        planName: plan.name,
        totalClients: plan.clients.length,
        usage: {
          users: totalUsage.users,
          contacts: totalUsage.contacts,
          agents: totalUsage.agents,
          instances: totalUsage.instances,
          storageUsed: 0, // TODO: Implementar cálculo de almacenamiento
          storageLimit: plan.storageLimit || 0,
          percentageUsed: 0 // TODO: Implementar cálculo de porcentaje
        },
        totalCost: Number(totalCost),
        limits: {
          maxUsers: plan.maxUsers,
          maxContacts: plan.maxContacts,
          maxAgents: plan.maxAgents,
          maxInstances: plan.maxInstances,
          costPerInstance: Number(plan.costPerInstance)
        }
      });
    }

    this.setCache(cacheKey, stats);
    return stats;
  }

  /**
   * Actualiza los límites de un plan
   */
  async updatePlanLimits(planId: string, updates: {
    maxUsers?: number;
    maxContacts?: number;
    maxAgents?: number;
    maxInstances?: number;
    costPerInstance?: number;
  }): Promise<ClientPlan> {
    const plan = await db.clientPlan.findUnique({
      where: { id: planId },
      include: {
        clients: {
          include: {
            instances: true,
            users: true,
            contacts: true,
            agents: true
          }
        }
      }
    });

    if (!plan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plan no encontrado"
      });
    }

    // Validar que la reducción de límites no afecte a clientes existentes
    if (updates.maxInstances !== undefined && updates.maxInstances < plan.maxInstances) {
      const clientsExceedingLimit = plan.clients.filter(client => 
        client.instances.length > updates.maxInstances!
      );

      if (clientsExceedingLimit.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No se puede reducir el límite. Los siguientes clientes exceden el nuevo límite: ${clientsExceedingLimit.map(c => c.name).join(", ")}`
        });
      }
    }

    const updatedPlan = await db.clientPlan.update({
      where: { id: planId },
      data: {
        maxUsers: updates.maxUsers,
        maxContacts: updates.maxContacts,
        maxAgents: updates.maxAgents,
        maxInstances: updates.maxInstances,
        costPerInstance: updates.costPerInstance
      }
    });

    // Limpiar cache relacionado
    this.clearCache('plan-limits');
    this.clearCache('client-usage');
    this.clearCache('plans-stats');

    return updatedPlan;
  }

  /**
   * Obtiene alertas de uso para todos los clientes
   */
  async getUsageAlerts(threshold: number = 80): Promise<Array<{
    clientId: string;
    clientName: string;
    planName: string;
    alert: UsageAlert;
  }>> {
    const cacheKey = `usage-alerts-${threshold}`;
    const cached = this.getCache<Array<{
      clientId: string;
      clientName: string;
      planName: string;
      alert: UsageAlert;
    }>>(cacheKey);
    if (cached) return cached;

    const clients = await db.client.findMany({
      include: {
        plan: true,
        instances: true,
        agentes: true,
        contacts: true,
        users: true
      }
    });

    const alerts: Array<{
      clientId: string;
      clientName: string;
      planName: string;
      alert: UsageAlert;
    }> = [];

    for (const client of clients) {
      if (!client.plan) continue;

      const currentUsage = {
        users: client.users.length,
        contacts: client.contacts.length,
        agents: client.agentes.length,
        instances: client.instances.length
      };

      const usage = calculatePlanUsage(client.plan, currentUsage);
      const alertMessage = generateUsageAlert('instances', currentUsage.instances, client.plan.maxInstances);

      if (currentUsage.instances >= client.plan.maxInstances * (threshold / 100)) {
        alerts.push({
          clientId: client.id,
          clientName: client.name,
          planName: client.plan.name,
          alert: {
            type: 'warning',
            message: alertMessage,
            threshold,
            currentValue: currentUsage.instances,
            limit: client.plan.maxInstances,
            severity: 'medium'
          }
        });
      }
    }

    this.setCache(cacheKey, alerts);
    return alerts;
  }

  /**
   * Valida si un cliente puede cambiar a un nuevo plan
   */
  async validatePlanChange(clientId: string, newPlanId: string): Promise<PlanChangeValidation> {
    const client = await db.client.findUnique({
      where: { id: clientId },
      include: {
        plan: true,
        instances: true,
        agentes: true,
        contacts: true,
        users: true
      }
    });

    if (!client) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente no encontrado"
      });
    }

    const newPlan = await db.clientPlan.findUnique({
      where: { id: newPlanId }
    });

    if (!newPlan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plan no encontrado"
      });
    }

    const currentUsage = {
      users: client.users.length,
      contacts: client.contacts.length,
      agents: client.agentes.length,
      instances: client.instances.length
    };

    const conflicts: string[] = [];

    // Validar límites del nuevo plan
    if (currentUsage.users > newPlan.maxUsers) {
      conflicts.push(`Usuarios: ${currentUsage.users}/${newPlan.maxUsers}`);
    }

    if (currentUsage.contacts > newPlan.maxContacts) {
      conflicts.push(`Contactos: ${currentUsage.contacts}/${newPlan.maxContacts}`);
    }

    if (currentUsage.agents > newPlan.maxAgents) {
      conflicts.push(`Agentes: ${currentUsage.agents}/${newPlan.maxAgents}`);
    }

    if (currentUsage.instances > newPlan.maxInstances) {
      conflicts.push(`Instancias: ${currentUsage.instances}/${newPlan.maxInstances}`);
    }

    return {
      isValid: conflicts.length === 0,
      currentUsage: {
        users: currentUsage.users,
        contacts: currentUsage.contacts,
        agents: currentUsage.agents,
        instances: currentUsage.instances,
        storageUsed: 0,
        storageLimit: newPlan.storageLimit || 0,
        percentageUsed: 0
      },
      newLimits: {
        maxUsers: newPlan.maxUsers,
        maxContacts: newPlan.maxContacts,
        maxAgents: newPlan.maxAgents,
        maxInstances: newPlan.maxInstances,
        costPerInstance: Number(newPlan.costPerInstance),
        storageLimit: newPlan.storageLimit
      },
      conflicts,
      message: conflicts.length > 0 
        ? `No se puede cambiar al plan "${newPlan.name}" debido a conflictos: ${conflicts.join(', ')}`
        : undefined
    };
  }

  /**
   * Invalida el cache del servicio
   */
  invalidateCache(clientId?: string, planId?: string): void {
    if (clientId) {
      this.clearCache(`client-usage-${clientId}`);
      this.clearCache(`validate-instance-${clientId}`);
    }
    
    if (planId) {
      this.clearCache(`plans-stats-${planId}`);
    }
    
    this.clearCache('plans-stats-all');
    this.clearCache('usage-alerts');
  }
} 
