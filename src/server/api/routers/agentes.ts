import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import {
  AgentSchema,
  CreateAgentSchema,
  UpdateAgentSchema,
  AgentTemplateSchema,
  AgentFieldSchema,
  type Agent,
  type CreateAgent,
  type UpdateAgent,
  type AgentTemplate,
  type AgentField,
  CreateAgentTemplateSchema,
  CreateAgentFieldSchema,
  UpdateAgentTemplateSchema
} from "@/domain/Agentes";
import { FieldType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import Ai from "@/lib/ai";


export const agentesRouter = createTRPCRouter({
  // Crear un template de agente
  createTemplate: protectedProcedure
    .input(CreateAgentTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const clientId = ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      try {
        const { steps, ...templateData } = input;
        const template = await db.agentTemplate.create({
          data: {
            ...templateData,
            clientId,
            steps: {
              create: steps?.map((step) => ({
                name: step.name,
                description: step.description,
                icon: step.icon,
                order: step.order,
                fields: {
                  create: step.fields?.map((field) => ({ ...field })) || []
                }
              })) || []
            }
          },
          include: { 
            steps: {
              include: {
                fields: true
              }
            }
          },
        });
        return template as AgentTemplate;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el template" });
      }
    }),

  // Crear template global (solo superadmin)
  createGlobalTemplate: protectedProcedure
    .input(CreateAgentTemplateSchema.omit({ clientId: true }))
    .mutation(async ({ input }) => {
      try {
        const { steps, ...templateData } = input;
        const template = await db.agentTemplate.create({
          data: {
            ...templateData,
            isGlobal: true,
            steps: {
              create: steps?.map((step) => ({
                name: step.name,
                description: step.description,
                icon: step.icon,
                order: step.order,
                fields: {
                  create: step.fields?.map((field) => ({ ...field })) || []
                }
              })) || []
            }
          },
          include: { 
            steps: {
              include: {
                fields: true
              }
            }
          },
        });
        return template as AgentTemplate;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el template global" });
      }
    }),

  // Listar templates de un cliente (incluye campos y templates globales)
  getTemplatesByClient: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      try {
        const templates = await db.agentTemplate.findMany({
          where: { 
            OR: [
              { clientId: input.clientId },           // Templates del cliente
              { isGlobal: true }      // Templates globales
            ]
          },
          include: { 
            steps: {
              include: {
                fields: true
              }
            }
          },
        });
        return templates as AgentTemplate[];
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener los templates" });
      }
    }),

  // Listar todos los templates (solo superadmin)
  getAllTemplates: protectedProcedure
    .query(async () => {
      try {
        const templates = await db.agentTemplate.findMany({
          include: { 
            steps: {
              include: {
                fields: true
              }
            },
            client: true 
          },
        });
        return templates as AgentTemplate[];
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener todos los templates" });
      }
    }),

  // Crear un campo custom para un step
  createField: protectedProcedure
    .input(CreateAgentFieldSchema)
    .mutation(async ({ input }) => {
      try {
        const field = await db.agentField.create({ data: input });
        return field as AgentField;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el campo" });
      }
    }),

  // Listar campos de un step
  getFieldsByStep: protectedProcedure
    .input(z.object({ stepId: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const fields = await db.agentField.findMany({ where: { stepId: input.stepId } });
        return fields as AgentField[];
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener los campos del step" });
      }
    }),

  // Crear un agente usando un template
  createAgente: protectedProcedure
    .input(CreateAgentSchema)
    .mutation(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario sin cliente asignado"
        });
      }
      try {
        const prompt = Ai.createPromptFromAgent(input);
        const agente = await db.agente.create({
          data: {
            ...input,
            clientId,
            aiModel: "gpt-4o-mini",
            aiTemperature: 1,
            aiTopP: 1,
            aiMaxOutputTokens: 1000,
            aiPrompt: prompt,
          },
        });
        return agente as Agent;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el agente" });
      }
    }),

  // Listar agentes de un cliente
  getAgentesByClient: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Validar que usuarios no-AURELIA solo puedan ver sus propios agentes
        if (ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para ver los agentes de este cliente" });
        }

        const agentes = await db.agente.findMany({ where: { clientId: input.clientId } });
        return agentes as Agent[];
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener los agentes" });
      }
    }),

  // Obtener un agente por ID
  getAgenteById: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const agente = await db.agente.findFirst({ where: { id: input.id, clientId } });
        if (!agente) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agente no encontrado o no pertenece a este cliente" });
        }
        return agente as Agent;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener el agente" });
      }
    }),

  // Actualizar un agente
  updateAgente: protectedProcedure.input(UpdateAgentSchema.extend({
    id: z.string().uuid(),
    clientId: z.string().uuid().optional()
  })).mutation(async ({ input, ctx }) => {
    const { id, clientId: inputClientId, ...data } = input;
    const clientId = inputClientId ?? ctx.session.user.clientId;
    if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
    if (inputClientId && ctx.session.user.type !== "AURELIA" && inputClientId !== ctx.session.user.clientId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
    }
    try {
      const existing = await db.agente.findFirst({ where: { id, clientId } });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agente no encontrado para actualizar." });
      }

      if (data.name != null) {
        data.name = existing.name;
      }
      if (data.description != null) {
        data.description = existing.description ?? undefined;
      }
      if (data.customFields != null) {
        data.customFields = existing.customFields as Record<string, any>;
      }
      data.aiPrompt = Ai.createPromptFromAgent(data as CreateAgent)
      const updated = await db.agente.update({ where: { id }, data });
      return updated as Agent;
    } catch (error: unknown) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el agente" });
    }
  }),

  // Eliminar un agente
  deleteAgente: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const existing = await db.agente.findFirst({ where: { id: input.id, clientId } });
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agente no encontrado para eliminar." });
        }
        const deleted = await db.agente.delete({ where: { id: input.id } });
        return deleted as Agent;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el agente" });
      }
    }),

  // Obtener un template por ID (incluye templates globales)
  getTemplateById: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .query(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const template = await db.agentTemplate.findFirst({
          where: { 
            id: input.id,
            OR: [
              { clientId },           // Template del cliente
              { isGlobal: true }      // Template global
            ]
          },
          include: { 
            steps: {
              include: {
                fields: true
              }
            }
          },
        });
        if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Template no encontrado" });
        return template as AgentTemplate;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener el template" });
      }
    }),

  // Actualizar un template (ahora con steps anidados)
  updateTemplate: protectedProcedure
    .input(UpdateAgentTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, clientId: inputClientId, steps, ...data } = input;
      const clientId = inputClientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (inputClientId && ctx.session.user.type !== "AURELIA" && inputClientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const existing = await db.agentTemplate.findFirst({ 
          where: { 
            id, 
            OR: [
              { clientId },           // Template del cliente
              { isGlobal: true }      // Template global
            ]
          } 
        });
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Template no encontrado para actualizar." });

        // Si no se pasan steps, solo actualiza el template
        if (!steps) {
          const updated = await db.agentTemplate.update({ where: { id }, data });
          return updated as AgentTemplate;
        }

        // --- Sincronización completa de steps y fields ---
        await db.$transaction(async (tx) => {
          // 1. Actualizar el template
          await tx.agentTemplate.update({
            where: { id },
            data
          });

          // 2. Obtener steps actuales
          const currentSteps = await tx.agentTemplateStep.findMany({ 
            where: { templateId: id },
            include: { fields: true }
          });

          // 3. Eliminar todos los steps y fields existentes
          for (const step of currentSteps) {
            await tx.agentField.deleteMany({ where: { stepId: step.id } });
          }
          await tx.agentTemplateStep.deleteMany({ where: { templateId: id } });

          // 4. Crear nuevos steps y fields
          if (steps && steps.length > 0) {
            for (const stepData of steps) {
              const step = await tx.agentTemplateStep.create({
                data: {
                  templateId: id,
                  name: stepData.name,
                  description: stepData.description,
                  icon: stepData.icon,
                  order: stepData.order
                }
              });

              // Crear fields para este step
              if (stepData.fields && stepData.fields.length > 0) {
                await Promise.all(
                  stepData.fields.map((field, i) =>
                    tx.agentField.create({
                      data: {
                        ...field,
                        stepId: step.id,
                        order: field.order ?? i
                      }
                    })
                  )
                );
              }
            }
          }
        });

        // Retornar el template actualizado con sus steps y fields
        const result = await db.agentTemplate.findUnique({
          where: { id },
          include: {
            steps: {
              include: {
                fields: true
              }
            }
          },
        });
        return result as AgentTemplate;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el template" });
      }
    }),

  // Eliminar un template
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string().uuid(), clientId: z.string().uuid().optional() }))
    .mutation(async ({ input, ctx }) => {
      const clientId = input.clientId ?? ctx.session.user.clientId;
      if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
      if (input.clientId && ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para acceder a este cliente" });
      }
      try {
        const existing = await db.agentTemplate.findFirst({ 
          where: { 
            id: input.id, 
            OR: [
              { clientId },           // Template del cliente
              { isGlobal: true }      // Template global
            ]
          } 
        });
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Template no encontrado para eliminar." });
        const deleted = await db.agentTemplate.delete({ where: { id: input.id } });
        return deleted as AgentTemplate;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el template" });
      }
    }),

  // Obtener un campo por ID
  getFieldById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const field = await db.agentField.findUnique({ where: { id: input.id } });
        if (!field) throw new TRPCError({ code: "NOT_FOUND", message: "Campo no encontrado" });
        return field as AgentField;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener el campo" });
      }
    }),

  // Actualizar un campo
  updateField: protectedProcedure
    .input(AgentFieldSchema.pick({ id: true }).extend({
      name: z.string().optional(),
      label: z.string().optional(),
              type: z.nativeEnum(FieldType).optional(),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
      order: z.number().optional(),
      config: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      try {
        const existing = await db.agentField.findUnique({ where: { id } });
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Campo no encontrado para actualizar." });
        // Filtrar solo los campos definidos para update
        const data: Partial<Omit<AgentField, "id" | "templateId">> = {};
        if (typeof rest.name === "string") data.name = rest.name;
        if (typeof rest.label === "string") data.label = rest.label;
        if (rest.type) data.type = rest.type;
        if (typeof rest.required === "boolean") data.required = rest.required;
        if (Array.isArray(rest.options)) data.options = rest.options;
        if (typeof rest.order === "number") data.order = rest.order;
        if (typeof rest.config === "object" && rest.config !== null) data.config = rest.config;
        const updated = await db.agentField.update({ where: { id }, data });
        return updated as AgentField;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el campo" });
      }
    }),

  // Eliminar un campo
  deleteField: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        const existing = await db.agentField.findUnique({ where: { id: input.id } });
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Campo no encontrado para eliminar." });
        const deleted = await db.agentField.delete({ where: { id: input.id } });
        return deleted as AgentField;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el campo" });
      }
    }),
}); 
