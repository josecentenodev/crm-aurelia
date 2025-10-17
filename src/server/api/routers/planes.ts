import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { db } from "@/server/db"
import { UpdatePlanLimitsSchema } from "@/domain/Planes"

export const planesRouter = createTRPCRouter({
  // Obtener límites de un plan
  getPlanLimits: protectedProcedure
    .input(z.object({ planId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.clientPlan.findUnique({
        where: { id: input.planId },
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
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plan no encontrado" });
      const planLimits = {
        maxInstances: plan.maxInstances ?? 0,
        maxUsers: plan.maxUsers ?? 0,
        maxContacts: plan.maxContacts ?? 0,
        maxAgents: plan.maxAgents ?? 0,
        costPerInstance: plan.costPerInstance ?? 0
      };
      const currentUsage = {
        instances: plan.clients.reduce((sum, client) => sum + (client.instances?.length ?? 0), 0),
        users: plan.clients.reduce((sum, client) => sum + (client.users?.length ?? 0), 0),
        contacts: plan.clients.reduce((sum, client) => sum + (client.contacts?.length ?? 0), 0),
        agents: plan.clients.reduce((sum, client) => sum + (client.agentes?.length ?? 0), 0)
      };
      return { planId: plan.id, name: plan.name, planLimits, currentUsage };
    }),

  // Validar límites para un cliente específico
  validateClientLimits: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      resourceType: z.enum(["instances", "users", "contacts", "agents"]),
      currentCount: z.number().int().min(0)
    }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { id: input.clientId },
        include: { plan: true }
      });
      if (!client || !client.plan) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente o plan no encontrado" });
      const limits = client.plan;
      let isValid = true;
      let limit = 0;
      switch (input.resourceType) {
        case "instances":
          limit = limits.maxInstances ?? 0;
          break;
        case "users":
          limit = limits.maxUsers ?? 0;
          break;
        case "contacts":
          limit = limits.maxContacts ?? 0;
          break;
        case "agents":
          limit = limits.maxAgents ?? 0;
          break;
      }
      if (input.currentCount >= limit) isValid = false;
      return { isValid, limit };
    }),

  // Calcular uso actual de un cliente
  getClientUsage: protectedProcedure
    .input(z.object({ clientId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findUnique({
        where: { id: input.clientId },
        include: {
          plan: true,
          instances: true,
          agentes: true,
          contacts: true,
          users: true
        }
      });
      if (!client || !client.plan) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente o plan no encontrado" });
      const usage = {
        instances: client.instances?.length ?? 0,
        users: client.users?.length ?? 0,
        contacts: client.contacts?.length ?? 0,
        agents: client.agentes?.length ?? 0
      };
      return { clientId: client.id, clientName: client.name, planName: client.plan.name, usage, planLimits: client.plan };
    }),

  // Actualizar límites de un plan
  updatePlanLimits: protectedProcedure
    .input(UpdatePlanLimitsSchema.extend({ planId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { planId, ...limits } = input;
      const plan = await ctx.db.clientPlan.findUnique({ where: { id: planId }, include: { clients: { include: { instances: true, users: true, contacts: true, agentes: true } } } });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plan no encontrado" });
      // Validar que no se reduzcan límites por debajo del uso actual
      for (const client of plan.clients) {
        if (limits.maxInstances !== undefined && (client.instances?.length ?? 0) > limits.maxInstances) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `El cliente ${client.name} excede el nuevo límite de instancias` });
        }
        if (limits.maxUsers !== undefined && (client.users?.length ?? 0) > limits.maxUsers) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `El cliente ${client.name} excede el nuevo límite de usuarios` });
        }
        if (limits.maxContacts !== undefined && (client.contacts?.length ?? 0) > limits.maxContacts) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `El cliente ${client.name} excede el nuevo límite de contactos` });
        }
        if (limits.maxAgents !== undefined && (client.agentes?.length ?? 0) > limits.maxAgents) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `El cliente ${client.name} excede el nuevo límite de agentes` });
        }
      }
      const updatedPlan = await ctx.db.clientPlan.update({
        where: { id: planId },
        data: {
          maxInstances: limits.maxInstances,
          maxUsers: limits.maxUsers,
          maxContacts: limits.maxContacts,
          maxAgents: limits.maxAgents,
          costPerInstance: limits.costPerInstance
        }
      });
      return updatedPlan;
    })
}); 
