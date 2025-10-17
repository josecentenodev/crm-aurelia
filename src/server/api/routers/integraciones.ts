import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { db } from "@/server/db"
import { TRPCError } from "@trpc/server"
import { EvolutionAPIService } from "@/services/evolution-api-service"
import { getEvolutionApiServiceFromDB } from "@/server/services/evolution-api.factory"
import { EvolutionWebhookEvent } from "@/services/evolution-api-types"
import { 
  type InstanceStatus,
  type InstanceStatusResponse,
  type QRCodeResponse,
  type UpdateInstanceStatusInput,
  type UpdateInstanceStatusResponse,
  UpdateInstanceStatusInputSchema,
  UpdateInstanceStatusResponseSchema
} from "@/domain"
import { env } from "@/env"

// Usar la instancia por defecto (singleton)

export const integracionesRouter = createTRPCRouter({
  // ===== GESTIÓN GLOBAL DE INTEGRACIONES =====
  
  // Listar todas las integraciones globales
  listGlobal: protectedProcedure
    .query(async () => {
      try {
        const integrations = await db.globalIntegration.findMany({
          orderBy: { name: "asc" }
        })
        return integrations
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener integraciones globales"
        })
      }
    }),

  // Obtener integración global por ID
  getGlobalById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const integration = await db.globalIntegration.findUnique({
          where: { id: input.id }
        })

        if (!integration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Integración no encontrada"
          })
        }

        return integration
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener integración"
        })
      }
    }),

  // Actualizar integración global
  updateGlobal: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1, "Nombre requerido").optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      isActive: z.boolean().optional(),
      isConfigurable: z.boolean().optional(),
      backendUrl: z.string().optional(),
      apiKey: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input

        const integration = await db.globalIntegration.update({
          where: { id },
          data
        })

        return integration
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar integración"
        })
      }
    }),

  // Activar/desactivar integración global
  toggleGlobalActive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        const integration = await db.globalIntegration.findUnique({
          where: { id: input.id }
        })

        if (!integration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Integración no encontrada"
          })
        }

        const updatedIntegration = await db.globalIntegration.update({
          where: { id: input.id },
          data: { isActive: !integration.isActive }
        })

        return updatedIntegration
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al cambiar estado de integración"
        })
      }
    }),

  // Crear integración global
  createGlobal: protectedProcedure
    .input(z.object({
      type: z.enum(["EVOLUTION_API", "WHATSAPP_BUSINESS", "TELEGRAM_BOT", "EMAIL_SMTP", "SMS_TWILIO"]),
      name: z.string().min(1, "Nombre requerido"),
      description: z.string().optional(),
      icon: z.string().optional(),
      isActive: z.boolean().default(true),
      isConfigurable: z.boolean().default(true),
      backendUrl: z.string().optional(),
      apiKey: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar si ya existe una integración del mismo tipo
        const existingIntegration = await db.globalIntegration.findUnique({
          where: { type: input.type }
        })

        if (existingIntegration) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ya existe una integración global de este tipo"
          })
        }

        const integration = await db.globalIntegration.create({
          data: {
            type: input.type,
            name: input.name,
            description: input.description,
            icon: input.icon,
            isActive: input.isActive,
            isConfigurable: input.isConfigurable,
            backendUrl: input.backendUrl,
            apiKey: input.apiKey
          }
        })

        return integration
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear integración global"
        })
      }
    }),

  // ===== GESTIÓN DE INTEGRACIONES POR CLIENTE =====

  // Obtener todas las integraciones de clientes por tipo
  getClientIntegrationsByType: protectedProcedure
    .input(z.object({
      integrationType: z.enum(["EVOLUTION_API", "WHATSAPP_BUSINESS", "TELEGRAM_BOT", "EMAIL_SMTP", "SMS_TWILIO"])
    }))
    .query(async ({ input }) => {
      try {
        const clientIntegrations = await db.clientIntegration.findMany({
          where: { 
            type: input.integrationType 
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                statusId: true
              }
            },
            evolutionApi: {
              include: {
                instances: true
              }
            }
          }
        })

        return clientIntegrations
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener integraciones de clientes"
        })
      }
    }),

    getClientIntegrations: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid()
    }))
    .query(async ({ input }) => {
      try {
        // Obtener el cliente con su plan
        const client = await db.client.findUnique({
          where: { id: input.clientId },
          include: {
            plan: true,
            integrations: {
              include: {
                evolutionApi: {
                  include: {
                    instances: true
                  }
                }
              }
            }
          }
        })

        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente no encontrado"
          })
        }

        // Obtener todas las integraciones globales activas
        const globalIntegrations = await db.globalIntegration.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" }
        })

        // Transformar las integraciones globales en el formato esperado por el frontend
        const integrations = globalIntegrations.map(globalIntegration => {
          // Buscar si el cliente tiene esta integración activada
          const clientIntegration = client.integrations.find(
            ci => ci.type === globalIntegration.type
          )

          // Determinar si está disponible según el plan del cliente
          const isAvailable = globalIntegration.type === "EVOLUTION_API" 
            ? client.plan.maxInstances > 0 
            : true // Para otras integraciones, asumir disponibles por ahora

          // Calcular límites y costos
          const maxInstances = globalIntegration.type === "EVOLUTION_API" 
            ? client.plan.maxInstances 
            : 0
          
          const costPerInstance = globalIntegration.type === "EVOLUTION_API" 
            ? client.plan.costPerInstance 
            : 0

          // Contar instancias actuales
          const currentInstances = clientIntegration?.evolutionApi?.instances?.length || 0

          return {
            id: globalIntegration.id,
            type: globalIntegration.type,
            name: globalIntegration.name,
            description: globalIntegration.description,
            icon: globalIntegration.icon,
            isActive: !!clientIntegration?.isActive,
            isAvailable,
            maxInstances,
            costPerInstance: costPerInstance.toString(),
            currentInstances,
            clientIntegration: clientIntegration ? {
              id: clientIntegration.id,
              evolutionApi: clientIntegration.evolutionApi
            } : null
          }
        })

        return { integrations }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener integraciones del cliente"
        })
      }
    }),

  // Activar integración para un cliente (crea el contenedor de Evolution API)
  activateForClient: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      type: z.enum(["EVOLUTION_API", "WHATSAPP_BUSINESS", "TELEGRAM_BOT", "EMAIL_SMTP", "SMS_TWILIO"]),
      config: z.record(z.any()).optional()
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar que el cliente existe
        const client = await db.client.findUnique({
          where: { id: input.clientId }
        })
        if (!client) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" })
        }

        // Verificar que la integración global existe y está activa
        const globalIntegration = await db.globalIntegration.findFirst({
          where: { type: input.type, isActive: true }
        })
        if (!globalIntegration) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Integración no disponible" })
        }

        // Para Evolution API: primero crear el contenedor; si falla, no tocar DB
        let containerInfo: { containerName: string; hostPort: number; evolutionApiUrl: string; managerUrl: string } | null = null
        if (input.type === "EVOLUTION_API") {
          try {
            const svc = await getEvolutionApiServiceFromDB()
            const deployed = await svc.deployClientContainer(client.id)
            containerInfo = {
              containerName: deployed.container_name,
              hostPort: parseInt(deployed.host_port),
              evolutionApiUrl: deployed.evolution_api_url,
              managerUrl: deployed.manager_url
            }
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `No se pudo crear el contenedor para Evolution API. La integración no fue activada. Detalle: ${error instanceof Error ? error.message : 'Error desconocido'}`
            })
          }
        }

        // Escribir en DB (transaccional). Si falla y ya se creó contenedor, intentamos compensar eliminándolo
        try {
          const result = await db.$transaction(async (tx) => {
            const clientIntegration = await tx.clientIntegration.upsert({
              where: {
                clientId_type: { clientId: input.clientId, type: input.type }
              },
              update: {
                isActive: true,
                name: globalIntegration.name,
                description: globalIntegration.description
              },
              create: {
                clientId: input.clientId,
                type: input.type,
                name: globalIntegration.name,
                description: globalIntegration.description,
                isActive: true
              }
            })

            if (input.type === "EVOLUTION_API" && containerInfo) {
              await tx.evolutionApiIntegration.upsert({
                where: { integrationId: clientIntegration.id },
                update: {
                  containerName: containerInfo.containerName,
                  hostPort: containerInfo.hostPort,
                  evolutionApiUrl: containerInfo.evolutionApiUrl,
                  managerUrl: containerInfo.managerUrl,
                  containerStatus: "RUNNING",
                  lastDeployedAt: new Date()
                },
                create: {
                  integrationId: clientIntegration.id,
                  containerName: containerInfo.containerName,
                  hostPort: containerInfo.hostPort,
                  evolutionApiUrl: containerInfo.evolutionApiUrl,
                  managerUrl: containerInfo.managerUrl,
                  containerStatus: "RUNNING",
                  lastDeployedAt: new Date()
                }
              })
            }

            return clientIntegration
          })

          return result
        } catch (dbError) {
          // Compensar: si creamos contenedor, intentar detenerlo
          if (input.type === "EVOLUTION_API" && containerInfo) {
            try { 
              const svc = await getEvolutionApiServiceFromDB()
              await svc.containerAction({ 
                container_name: containerInfo.containerName, 
                action: 'stop' 
              })
            } catch (error) {
              console.error('Error stopping container:', error)
            }
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Error al guardar la activación en la base de datos: ${dbError instanceof Error ? dbError.message : 'Error desconocido'}`
          })
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al activar integración" })
      }
    }),

  // Desactivar integración para un cliente
  deactivateForClient: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      type: z.enum(["EVOLUTION_API", "WHATSAPP_BUSINESS", "TELEGRAM_BOT", "EMAIL_SMTP", "SMS_TWILIO"])
    }))
    .mutation(async ({ input }) => {
      try {
        const clientIntegration = await db.clientIntegration.findFirst({
          where: { clientId: input.clientId, type: input.type },
          include: { evolutionApi: { include: { instances: true } } }
        })
        if (!clientIntegration) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Integración no encontrada para este cliente" })
        }

        // Intentar detener el contenedor (no bloquear si falla)
        if (input.type === "EVOLUTION_API" && clientIntegration.evolutionApi) {
          try { 
            const svc = await getEvolutionApiServiceFromDB()
            await svc.containerAction({ 
              container_name: clientIntegration.evolutionApi.containerName ?? '', 
              action: 'stop' 
            })
          } catch (e) { 
            console.error(e) 
          }
        }

        // Eliminar todo rastro en DB
        await db.$transaction(async (tx) => {
          if (clientIntegration.evolutionApi) {
            await tx.evolutionApiInstance.deleteMany({ where: { evolutionApiId: clientIntegration.evolutionApi.id } })
            await tx.evolutionApiIntegration.delete({ where: { id: clientIntegration.evolutionApi.id } })
          }
          await tx.clientIntegration.delete({ where: { id: clientIntegration.id } })
        })

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al desactivar integración" })
      }
    }),

  // Diagnosticar configuración de Evolution API
  diagnoseEvolutionConfig: protectedProcedure
    .query(async () => {
      try {
        // Obtener configuración de la base de datos
        const integration = await db.globalIntegration.findFirst({
          where: { type: "EVOLUTION_API", isActive: true },
          select: { 
            id: true,
            name: true,
            backendUrl: true, 
            apiKey: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        })

        // Obtener configuración de variables de entorno
        const envConfig = {
          EVOLUTION_API_URL: env.EVOLUTION_API_URL ? `${env.EVOLUTION_API_URL.substring(0, 50)}...` : undefined,
          EVOLUTION_API_KEY: env.EVOLUTION_API_KEY ? '***' : undefined
        }

        // Intentar crear servicio para probar configuración
        let serviceTest = null
        try {
          const service = await getEvolutionApiServiceFromDB()
          serviceTest = {
            canCreateService: true,
            baseUrl: service['baseUrl'] ? `${service['baseUrl'].substring(0, 50)}...` : 'unknown',
            hasApiKey: !!service['apiKey']
          }
        } catch (error) {
          serviceTest = {
            canCreateService: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }

        return {
          integration,
          envConfig,
          serviceTest,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error diagnosticando configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`
        })
      }
    }),

  // ===== EVOLUTION API ESPECÍFICO =====

  // Testear conexión con Evolution API
  testEvolutionConnection: protectedProcedure
    .input(z.object({
      backendUrl: z.string().url(),
      apiKey: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const testService = new EvolutionAPIService(input.backendUrl, input.apiKey)
        
        // Usar método correcto del servicio (no legacy)
        const healthResponse = await testService.healthCheck()
        const healthy = healthResponse.ok === true
        
        // Verificar Docker usando listContainers en lugar del método legacy
        let dockerConnected = false
        try {
          await testService.listContainers()
          dockerConnected = true
        } catch {
          dockerConnected = false
        }

        if (!healthy) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Evolution API backend no responde o no está saludable."
          })
        }
        if (!dockerConnected) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Docker no está conectado o no responde en el backend de Evolution API."
          })
        }

        return { healthy: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error al probar conexión con Evolution API: ${error instanceof Error ? error.message : 'Error desconocido'}`
        })
      }
    }),

  // Crear instancia de WhatsApp
  createWhatsAppInstance: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string().min(1, "Nombre de instancia requerido")
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar que el cliente tiene Evolution API activa
        const clientIntegration = await db.clientIntegration.findFirst({
          where: {
            clientId: input.clientId,
            type: "EVOLUTION_API",
            isActive: true
          },
          include: {
            evolutionApi: true
          }
        });

        if (!clientIntegration || !clientIntegration.evolutionApi) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Evolution API no está activa para este cliente"
          });
        }

        // Crear instancia en Evolution API usando el servicio
        const svc = await getEvolutionApiServiceFromDB()
        const instanceInfo = await svc.createWhatsAppInstanceForClient(input.clientId, input.instanceName);

        // Mapear estado del servicio ('open'|'connecting'|'disconnected'|'closed') al enum Prisma
        const mappedDbStatus =
          instanceInfo.status === 'open' ? 'CONNECTED'
          : instanceInfo.status === 'connecting' ? 'CONNECTING'
          : 'DISCONNECTED';

        // Crear la instancia en la base de datos
        const evolutionApiInstance = await db.evolutionApiInstance.create({
          data: {
            evolutionApiId: clientIntegration.evolutionApi.id,
            instanceName: input.instanceName,
            status: mappedDbStatus,
            lastConnected: instanceInfo.lastConnected,
          }
        });

        // 🆕 CONFIGURACIÓN AUTOMÁTICA DE WEBHOOK
        let webhookConfigured = false;
        let webhookError: string | null = null;

        try {
          // Construir URL del webhook automáticamente
          // SOLUCIÓN PROVISORIA: URL hardcodeada para evitar URLs incorrectas de deploys
          const baseUrl = 'https://aurelia-platform-preview.vercel.app';
          const webhookUrl = `${baseUrl}/api/webhook/evolution/${input.clientId}/${encodeURIComponent(input.instanceName)}`;
          
          console.log(`🔗 Configurando webhook automáticamente para instancia ${input.instanceName}:`, {
            clientId: input.clientId,
            webhookUrl,
            containerName: clientIntegration.evolutionApi.containerName
          });

          // Configurar webhook usando el servicio Evolution API
          await svc.setWebhook(
            clientIntegration.evolutionApi.containerName!,
            input.instanceName,
            {
              url: webhookUrl,
              events: [EvolutionWebhookEvent.QRCODE_UPDATED, EvolutionWebhookEvent.MESSAGES_SET, EvolutionWebhookEvent.MESSAGES_UPSERT, EvolutionWebhookEvent.CONNECTION_UPDATE, EvolutionWebhookEvent.SEND_MESSAGE],
              enabled: true
            }
          );

          webhookConfigured = true;
          console.log(`✅ Webhook configurado exitosamente para instancia ${input.instanceName}`);

        } catch (webhookConfigError) {
          webhookError = webhookConfigError instanceof Error ? webhookConfigError.message : 'Error desconocido configurando webhook';
          console.error(`⚠️ Error configurando webhook automáticamente para instancia ${input.instanceName}:`, webhookConfigError);
          
          // No fallar la creación de instancia por error de webhook
          // El usuario puede configurar el webhook manualmente después
        }

        return {
          ...instanceInfo,
          id: evolutionApiInstance.id,
          webhookConfigured,
          webhookError
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error al crear instancia WhatsApp:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear instancia WhatsApp" + (error instanceof Error ? error.message : 'Error desconocido')
        });
      }
    }),

  // Validar configuración de webhook de una instancia
  validateInstanceWebhook: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string().min(1)
    }))
    .query(async ({ input }) => {
      try {
        // Verificar que el cliente tiene Evolution API activa
        const clientIntegration = await db.clientIntegration.findFirst({
          where: {
            clientId: input.clientId,
            type: "EVOLUTION_API",
            isActive: true
          },
          include: {
            evolutionApi: true
          }
        });

        if (!clientIntegration || !clientIntegration.evolutionApi) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Evolution API no está activa para este cliente"
          });
        }

        // Verificar que la instancia existe
        const instance = await db.evolutionApiInstance.findFirst({
          where: {
            evolutionApiId: clientIntegration.evolutionApi.id,
            instanceName: input.instanceName
          }
        });

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          });
        }

        // Obtener configuración actual del webhook desde Evolution API
        const svc = await getEvolutionApiServiceFromDB();
        let webhookConfig = null;
        let webhookError = null;

        try {
          webhookConfig = await svc.findWebhook(
            clientIntegration.evolutionApi.containerName!,
            input.instanceName
          );
        } catch (error) {
          webhookError = error instanceof Error ? error.message : 'Error desconocido obteniendo webhook';
        }

        // Construir URL esperada del webhook
        // SOLUCIÓN PROVISORIA: URL hardcodeada para evitar URLs incorrectas de deploys
        const baseUrl = 'https://aurelia-platform-preview.vercel.app';
        const expectedWebhookUrl = `${baseUrl}/api/webhook/evolution/${input.clientId}/${encodeURIComponent(input.instanceName)}`;

        return {
          instanceName: input.instanceName,
          webhookConfigured: !!webhookConfig,
          webhookUrl: webhookConfig?.url || null,
          expectedWebhookUrl,
          webhookEnabled: webhookConfig?.enabled || false,
          webhookEvents: webhookConfig?.events || [],
          webhookError,
          isCorrectlyConfigured: webhookConfig?.url === expectedWebhookUrl && webhookConfig?.enabled
        };

      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error validando webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al validar configuración de webhook"
        });
      }
    }),

  // Reconfigurar webhook de una instancia
  reconfigureInstanceWebhook: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string().min(1)
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar que el cliente tiene Evolution API activa
        const clientIntegration = await db.clientIntegration.findFirst({
          where: {
            clientId: input.clientId,
            type: "EVOLUTION_API",
            isActive: true
          },
          include: {
            evolutionApi: true
          }
        });

        if (!clientIntegration || !clientIntegration.evolutionApi) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Evolution API no está activa para este cliente"
          });
        }

        // Verificar que la instancia existe
        const instance = await db.evolutionApiInstance.findFirst({
          where: {
            evolutionApiId: clientIntegration.evolutionApi.id,
            instanceName: input.instanceName
          }
        });

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          });
        }

        // Construir URL del webhook automáticamente
        // SOLUCIÓN PROVISORIA: URL hardcodeada para evitar URLs incorrectas de deploys
        const baseUrl = 'https://aurelia-platform-preview.vercel.app';
        const webhookUrl = `${baseUrl}/api/webhook/evolution/${input.clientId}/${encodeURIComponent(input.instanceName)}`;
        
        console.log(`🔧 Reconfigurando webhook para instancia ${input.instanceName}:`, {
          clientId: input.clientId,
          webhookUrl,
          containerName: clientIntegration.evolutionApi.containerName
        });

        // Configurar webhook usando el servicio Evolution API
        const svc = await getEvolutionApiServiceFromDB();
        const webhookConfig = await svc.setWebhook(
          clientIntegration.evolutionApi.containerName!,
          input.instanceName,
          {
            url: webhookUrl,
            events: [EvolutionWebhookEvent.QRCODE_UPDATED, EvolutionWebhookEvent.MESSAGES_SET, EvolutionWebhookEvent.MESSAGES_UPSERT, EvolutionWebhookEvent.CONNECTION_UPDATE, EvolutionWebhookEvent.SEND_MESSAGE],
            enabled: true
          }
        );

        console.log(`✅ Webhook reconfigurado exitosamente para instancia ${input.instanceName}`);

        return {
          instanceName: input.instanceName,
          webhookConfigured: true,
          webhookUrl,
          webhookConfig
        };

      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error reconfigurando webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al reconfigurar webhook: " + (error instanceof Error ? error.message : 'Error desconocido')
        });
      }
    }),

  // Eliminar instancia de WhatsApp
  deleteWhatsAppInstance: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar que el cliente tiene Evolution API activa
        const clientIntegration = await db.clientIntegration.findFirst({
          where: {
            clientId: input.clientId,
            type: "EVOLUTION_API",
            isActive: true
          },
          include: {
            evolutionApi: {
              include: {
                instances: {
                  where: {
                    instanceName: input.instanceName
                  }
                }
              }
            }
          }
        });

        if (!clientIntegration || !clientIntegration.evolutionApi) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Evolution API no está activa para este cliente"
          });
        }

        const instance = clientIntegration.evolutionApi.instances[0];
        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          });
        }

        // Eliminar instancia de Evolution API
        const svc = await getEvolutionApiServiceFromDB()
        await svc.deleteWhatsAppInstance(input.clientId, input.instanceName);

        // Eliminar de la base de datos
        await db.evolutionApiInstance.delete({
          where: { id: instance.id }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar instancia WhatsApp"
        });
      }
    }),

  // Obtener todos los contenedores de Evolution API
  getEvolutionContainers: protectedProcedure
    .query(async () => {
      try {
        const clientIntegrations = await db.clientIntegration.findMany({
          where: {
            type: "EVOLUTION_API",
            isActive: true
          },
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            },
            evolutionApi: {
              include: {
                instances: true
              }
            }
          }
        });

        // Transformar los datos para el frontend
        const containers = clientIntegrations
          .filter(integration => integration.evolutionApi)
          .map(integration => ({
            id: integration.evolutionApi!.id,
            clientId: integration.clientId,
            clientName: integration.client.name,
            containerName: integration.evolutionApi!.containerName,
            hostPort: integration.evolutionApi!.hostPort,
            evolutionApiUrl: integration.evolutionApi!.evolutionApiUrl,
            managerUrl: integration.evolutionApi!.managerUrl,
            containerStatus: integration.evolutionApi!.containerStatus,
            lastDeployedAt: integration.evolutionApi!.lastDeployedAt,
            instances: integration.evolutionApi!.instances.map(instance => ({
              id: instance.id,
              instanceName: instance.instanceName,
              phoneNumber: instance.phoneNumber,
              status: instance.status,
              lastConnected: instance.lastConnected,
              lastMessageAt: instance.lastMessageAt
            }))
          }));

        return containers;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener contenedores de Evolution API"
        });
      }
    }),

getInstanceStatus: protectedProcedure
  .input(z.object({
    clientId: z.string().uuid(),
    instanceName: z.string().min(1)
  }))
  .query(async ({ input }): Promise<InstanceStatusResponse> => {
    try {
      const evolutionAPIService = await getEvolutionApiServiceFromDB()

      const clientIntegration = await db.clientIntegration.findFirst({
        where: {
          clientId: input.clientId,
          type: "EVOLUTION_API",
          isActive: true
        },
        include: {
          evolutionApi: {
            include: {
              instances: {
                where: { instanceName: input.instanceName }
              }
            }
          }
        }
      })

      if (!clientIntegration?.evolutionApi) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Integración Evolution API no encontrada"
        })
      }

      const containerName = clientIntegration.evolutionApi.containerName
      if (!containerName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contenedor no configurado"
        })
      }

      const instance = clientIntegration.evolutionApi.instances[0]

      // Obtener el estado real desde la propiedad correcta (manejar variantes de respuesta)
      const instanceStatusRaw = await evolutionAPIService.getConnectionState(containerName, input.instanceName).catch((e) => {
        console.warn('getConnectionState error; treating as close. Details:', e instanceof Error ? e.message : e)
        return { instance: { instanceName: input.instanceName, state: 'close' as const } }
      })
      // Algunas versiones devuelven { instance: { instanceName, state } }, otras { state, instance }
      const rawState: unknown = (instanceStatusRaw as any)?.instance?.state ?? (instanceStatusRaw as any)?.state
      let state = typeof rawState === 'string' ? rawState : undefined

      console.log(`Estado de conexión obtenido para ${input.instanceName}:`, instanceStatusRaw)

      // 🔧 NUEVO: Verificación adicional para detectar conexión real
      // Si reporta 'connecting' pero la instancia existe y tiene datos, probablemente está conectada
      if (state === 'connecting') {
        try {
          // Intentar obtener información de la instancia para verificar si realmente está conectada
          const instanceInfo = await evolutionAPIService.getInstanceInfo(containerName, input.instanceName)
          console.log(`🔍 DEBUG: Info de instancia para ${input.instanceName}:`, {
            hasInstance: !!instanceInfo,
            instanceName: instanceInfo?.instanceName,
            status: instanceInfo?.status,
            lastConnected: instanceInfo?.lastConnected
          })
          
          // Si la instancia existe y tiene datos, probablemente está conectada
          if (instanceInfo && instanceInfo.instanceName) {
            console.log(`🔧 CORRECCIÓN: Estado reportado como 'connecting' pero instancia existe, asumiendo 'open'`)
            state = 'open'
          }
        } catch (error) {
          console.warn(`🔍 No se pudo obtener info de instancia para ${input.instanceName}:`, error)
        }
      }

      let connectionStatus: "disconnected" | "connecting" | "connected"

      if (state === "open") {
        connectionStatus = "connected"
        console.log(`✅ Estado 'open' → 'connected'`)
      } else if (state === "connecting") {
        connectionStatus = "connecting"
        console.log(`✅ Estado 'connecting' → 'connecting'`)
      } else {
        connectionStatus = "disconnected"
        console.log(`✅ Estado '${state}' → 'disconnected'`)
      }

      if (connectionStatus === "connected" && instance && instance.status !== "CONNECTED") {
        try {
          await db.evolutionApiInstance.update({
            where: { id: instance.id },
            data: {
              status: "CONNECTED",
              lastConnected: new Date(),
              updatedAt: new Date()
            }
          })
          console.log(`✅ BD ACTUALIZADA: ${instance.status} → CONNECTED`)
        } catch (error) {
          console.error(`❌ Error actualizando BD:`, error)
        }
      }

      return {
        containerStatus: "running",
        connectionStatus,
        timestamp: new Date()
      }
    } catch (error) {
      console.error(`❌ Error en getInstanceStatus:`, error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error obteniendo estado de instancia"
      })
    }
  }),

// Obtener QR y actualizar estado automáticamente
getCurrentQR: protectedProcedure
  .input(z.object({
    clientId: z.string().uuid(),
    instanceName: z.string().min(1)
  }))
  .query(async ({ input }): Promise<QRCodeResponse> => {
    try {
      const evolutionAPIService = await getEvolutionApiServiceFromDB()

      const clientIntegration = await db.clientIntegration.findFirst({
        where: {
          clientId: input.clientId,
          type: "EVOLUTION_API",
          isActive: true
        },
        include: {
          evolutionApi: {
            include: {
              instances: {
                where: { instanceName: input.instanceName }
              }
            }
          }
        }
      })

      if (!clientIntegration?.evolutionApi) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Integración Evolution API no encontrada"
        })
      }

      const containerName = clientIntegration.evolutionApi.containerName
      if (!containerName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contenedor no configurado"
        })
      }

      const instance = clientIntegration.evolutionApi.instances[0]
      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instancia no encontrada"
        })
      }

      // 🔧 CAMBIO: Verificar estado de la instancia primero (manejar variantes de respuesta)
      const instanceStatus = await evolutionAPIService.getConnectionState(containerName, input.instanceName).catch((e) => {
        console.warn('getConnectionState error; proceeding to try QR. Details:', e instanceof Error ? e.message : e)
        return { instance: { instanceName: input.instanceName, state: 'close' as const } }
      })
      const rawState: unknown = (instanceStatus as any)?.instance?.state ?? (instanceStatus as any)?.state
      let currentState = typeof rawState === 'string' ? rawState : 'close'

      console.log(`🔍 DEBUG: Estado de conexión para QR de ${input.instanceName}:`, {
        instanceStatus,
        rawState,
        currentState,
        instanceStatusType: typeof instanceStatus,
        hasInstance: !!(instanceStatus as any)?.instance,
        instanceState: (instanceStatus as any)?.instance?.state,
        directState: (instanceStatus as any)?.state
      })

      // 🔧 NUEVO: Verificación adicional para detectar conexión real
      // Si reporta 'connecting' pero la instancia existe y tiene datos, probablemente está conectada
      if (currentState === 'connecting') {
        try {
          // Intentar obtener información de la instancia para verificar si realmente está conectada
          const instanceInfo = await evolutionAPIService.getInstanceInfo(containerName, input.instanceName)
          console.log(`🔍 DEBUG: Info de instancia para ${input.instanceName}:`, {
            hasInstance: !!instanceInfo,
            instanceName: instanceInfo?.instanceName,
            status: instanceInfo?.status,
            lastConnected: instanceInfo?.lastConnected
          })
          
          // Si la instancia existe y tiene datos, probablemente está conectada
          if (instanceInfo && instanceInfo.instanceName) {
            console.log(`🔧 CORRECCIÓN: Estado reportado como 'connecting' pero instancia existe, asumiendo 'open'`)
            currentState = 'open'
          }
        } catch (error) {
          console.warn(`🔍 No se pudo obtener info de instancia para ${input.instanceName}:`, error)
        }
      }
      
      // Si está conectado, no mostrar QR
      if (currentState === "open") {
        console.log(`🔧 Estado detectado como 'open' → marcando como CONNECTED`)
        
        // 🔧 NUEVO: Actualizar BD automáticamente
        if (instance.status !== "CONNECTED") {
          try {
            await db.evolutionApiInstance.update({
              where: { id: instance.id },
              data: {
                status: "CONNECTED",
                lastConnected: new Date(),
                updatedAt: new Date()
              }
            })
            console.log(`✅ BD actualizada: ${instance.status} → CONNECTED`)
          } catch (error) {
            console.error(`❌ Error actualizando BD:`, error)
          }
        }

        return {
          qrCode: null,
          isConnected: true,
          timestamp: new Date()
        }
      }

      // 🔧 CAMBIO: Obtener QR si no está conectado (close o connecting)
      if (currentState !== "open") {
        try {
          // Evitar lookup adicional: usar containerName directamente
          const qrCode = await (async () => {
            if (typeof (evolutionAPIService as any).getInstanceQR === 'function') {
              return (evolutionAPIService as any).getInstanceQR(containerName, input.instanceName) as Promise<string>
            }
            // Fallback a método legacy basado en clientId
            return (evolutionAPIService as any).getClientInstanceQR(input.clientId, input.instanceName) as Promise<string>
          })()
          
          console.log(`🔍 QR obtenido desde Evolution API para ${input.instanceName}:`, {
            hasQR: !!qrCode,
            qrLength: qrCode?.length || 0
          })

          // 🔧 NUEVO: Actualizar estado a CONNECTING si hay QR
          if (qrCode && instance.status !== "CONNECTING") {
            try {
              await db.evolutionApiInstance.update({
                where: { id: instance.id },
                data: {
                  status: "CONNECTING",
                  updatedAt: new Date()
                }
              })
              console.log(`✅ BD actualizada: ${instance.status} → CONNECTING`)
            } catch (error) {
              console.error(`❌ Error actualizando BD:`, error)
            }
          }

          return {
            qrCode: qrCode || null,
            isConnected: false,
            timestamp: new Date()
          }
        } catch (error) {
          console.error(`❌ Error obteniendo QR:`, error)
          return {
            qrCode: null,
            isConnected: false,
            timestamp: new Date(),
            error: error instanceof Error ? error.message : "Error desconocido"
          }
        }
      }

      // Estado intermedio (connecting)
      return {
        qrCode: null,
        isConnected: false,
        timestamp: new Date()
      }

    } catch (error) {
      console.error(`❌ Error en getCurrentQR:`, error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error obteniendo QR"
      })
    }
  }),

  // ===== WEBHOOKS SIMPLIFICADOS =====

  // Obtener webhook actual de Evolution API para una instancia
  getInstanceWebhook: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string().min(1),
    }))
    .query(async ({ input }) => {
      const clientIntegration = await db.clientIntegration.findFirst({
        where: { clientId: input.clientId, type: 'EVOLUTION_API', isActive: true },
        include: { evolutionApi: true }
      })
      if (!clientIntegration?.evolutionApi?.containerName) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Instancia/Contenedor no encontrado' })
      }

      const svc = await getEvolutionApiServiceFromDB()
      try {
        const webhook = await svc.getInstanceWebhook(
          clientIntegration.evolutionApi.containerName, 
          input.instanceName
        )
        return webhook
      } catch (error) {
        console.error('Error obteniendo webhook de Evolution API:', error)
        return null
      }
    }),

  // Configurar webhook en Evolution API (reemplaza el existente)
  setInstanceWebhook: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string().min(1),
      url: z.string().url(),
      events: z.array(z.nativeEnum(EvolutionWebhookEvent)).min(1)
    }))
    .mutation(async ({ input }) => {
      const clientIntegration = await db.clientIntegration.findFirst({
        where: { clientId: input.clientId, type: 'EVOLUTION_API', isActive: true },
        include: { evolutionApi: true }
      })
      if (!clientIntegration?.evolutionApi?.containerName) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Instancia/Contenedor no encontrado' })
      }

      const svc = await getEvolutionApiServiceFromDB()
      try {
        const webhook = await svc.setWebhook(
          clientIntegration.evolutionApi.containerName, 
          input.instanceName,
          {
            url: input.url,
            events: input.events,
            enabled: true
          }
        )
        return webhook
      } catch (error) {
        console.error('Error configurando webhook:', error)
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: `Error configurando webhook: ${error instanceof Error ? error.message : 'Error desconocido'}` 
        })
      }
    }),

  // Probar webhook
  testInstanceWebhook: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      instanceName: z.string().min(1),
      url: z.string().url()
    }))
    .mutation(async ({ input }) => {
      const t0 = Date.now()
      try {
        const res = await fetch(input.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
        })
        const ms = Date.now() - t0
        return { ok: res.ok, status: res.status, ms }
      } catch (e) {
        const ms = Date.now() - t0
        return { ok: false, error: (e as Error).message, ms }
      }
    }),

// 🔧 MEJORADO: Endpoint con tipos específicos del dominio
updateInstanceConnectionStatus: protectedProcedure
  .input(UpdateInstanceStatusInputSchema)
  .mutation(async ({ input }): Promise<UpdateInstanceStatusResponse> => {
    try {
      const clientIntegration = await db.clientIntegration.findFirst({
        where: {
          clientId: input.clientId,
          type: "EVOLUTION_API",
          isActive: true
        },
        include: {
          evolutionApi: {
            include: {
              instances: {
                where: { instanceName: input.instanceName }
              }
            }
          }
        }
      })

      if (!clientIntegration?.evolutionApi) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Evolution API integration not found"
        })
      }

      const instance = clientIntegration.evolutionApi.instances[0]
      
      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instance not found"
        })
      }

      // Actualizar estado y timestamp
      const updateData: any = {
        status: input.status,
        updatedAt: new Date()
      }

      // Si se conecta, actualizar campos relacionados
      if (input.status === "CONNECTED") {
        updateData.lastConnected = new Date()
      }

      // Si se proporciona número de teléfono, actualizarlo
      if (input.phoneNumber) {
        updateData.phoneNumber = input.phoneNumber
      }

      // Actualizar en la base de datos
      const updatedInstance = await db.evolutionApiInstance.update({
        where: { id: instance.id },
        data: updateData,
        select: {
          id: true,
          instanceName: true,
          status: true,
          lastConnected: true,
          phoneNumber: true
        }
      })

      return { 
        success: true, 
        updatedAt: new Date(),
        instance: updatedInstance
      }
    } catch (error) {
      console.error("Error updating instance connection status:", error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error updating instance status"
      })
    }
  }),

})
