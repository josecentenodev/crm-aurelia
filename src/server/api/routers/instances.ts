import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { Prisma } from "@prisma/client"
import { db } from "@/server/db"
import { getEvolutionApiServiceFromDB } from "@/server/services/evolution-api.factory"

export const instancesRouter = createTRPCRouter({
  // Listar instancias por cliente
  listByClient: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      integrationId: z.string().uuid().optional()
    }))
    .query(async ({ input }) => {
      const whereClause: any = {
        evolutionApi: {
          integration: {
            clientId: input.clientId
          }
        }
      }

      if (input.integrationId) {
        whereClause.evolutionApi.integrationId = input.integrationId
      }

      const instances = await db.evolutionApiInstance.findMany({
        where: whereClause,
        include: {
          evolutionApi: {
            include: {
              integration: true
            }
          },
          webhooks: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return {
        instances: instances.map(instance => ({
          id: instance.id,
          instanceName: instance.instanceName,
          phoneNumber: instance.phoneNumber,
          status: instance.status,
          lastConnected: instance.lastConnected,
          lastMessageAt: instance.lastMessageAt,
          createdAt: instance.createdAt,
          updatedAt: instance.updatedAt,
          integrationId: instance.evolutionApi.integrationId,
          config: instance.evolutionApi.config as Record<string, any> || {},
          webhooks: instance.webhooks.map(webhook => ({
            id: webhook.id,
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            enabled: webhook.enabled,
            headers: webhook.headers,
            secret: webhook.secret
          }))
        }))
      }
    }),

  // Crear nueva instancia
  create: protectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      integrationId: z.string().uuid(),
      instanceName: z.string().min(1),
      phoneNumber: z.string().optional(),
      config: z.object({
        description: z.string().optional()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      try {
        // Verificar que la integración existe y está activa
        const integration = await db.clientIntegration.findFirst({
          where: {
            id: input.integrationId,
            clientId: input.clientId,
            type: "EVOLUTION_API",
            isActive: true
          },
          include: {
            evolutionApi: true,
            client: {
              include: {
                plan: true
              }
            }
          }
        })

        if (!integration?.evolutionApi) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Integración Whatsapp no encontrada o inactiva"
          })
        }

        // Verificar límites de instancias
        const currentInstances = await db.evolutionApiInstance.count({
          where: {
            evolutionApi: {
              integrationId: input.integrationId
            }
          }
        })

        const maxInstances = integration.client.plan.maxInstances || 5
        if (currentInstances >= maxInstances) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Has alcanzado el límite máximo de ${maxInstances} instancias para esta integración`
          })
        }

        // Verificar que el nombre de instancia no esté en uso
        const existingInstance = await db.evolutionApiInstance.findFirst({
          where: {
            evolutionApiId: integration.evolutionApi.id,
            instanceName: input.instanceName
          }
        })

        if (existingInstance) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ya existe una instancia con este nombre"
          })
        }

        // Crear instancia usando el servicio Evolution API
        let instanceInfo;
        try {
          const svc = await getEvolutionApiServiceFromDB()
          instanceInfo = await svc.createWhatsAppInstanceForClient(
            input.clientId, 
            input.instanceName
          )
        } catch (error) {
          console.error("Error creating instance:", error)
          if (error instanceof Error) {
            // Si el error contiene información específica sobre Evolution API
            if (error.message.includes("Whatsapp no está disponible")) {
              throw new TRPCError({
                code: "SERVICE_UNAVAILABLE",
                message: "El servicio de WhatsApp no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos."
              })
            } else if (error.message.includes("Error de autenticación")) {
              throw new TRPCError({
                code: "UNAUTHORIZED", 
                message: "Error de configuración del servicio de WhatsApp. Contacta al soporte técnico."
              })
            }
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error interno al crear la instancia"
          })
        }

        // Mapear estado del servicio al enum Prisma
        const mappedDbStatus = 
          instanceInfo.status === 'open' ? 'CONNECTED'
          : instanceInfo.status === 'connecting' ? 'CONNECTING'
          : 'DISCONNECTED'

        // Crear la instancia en la base de datos
        let evolutionApiInstance;
        try {
          evolutionApiInstance = await db.evolutionApiInstance.create({
            data: {
              evolutionApiId: integration.evolutionApi.id,
              instanceName: input.instanceName,
              phoneNumber: input.phoneNumber,
              status: mappedDbStatus,
              lastConnected: instanceInfo.status === 'open' ? new Date() : null
            }
          })
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              // Constraint único violado
              const field = error.meta?.target;
              if (Array.isArray(field) && field.includes('phoneNumber')) {
                throw new TRPCError({
                  code: "CONFLICT",
                  message: `El número de teléfono ${input.phoneNumber} ya está siendo utilizado por otra instancia. Por favor, usa un número diferente.`
                })
              } else if (Array.isArray(field) && field.includes('instanceName')) {
                throw new TRPCError({
                  code: "CONFLICT", 
                  message: `Ya existe una instancia con el nombre "${input.instanceName}". Por favor, elige un nombre diferente.`
                })
              }
            }
          }
          // Re-lanzar otros errores de Prisma
          throw error
        }

        // 🆕 CONFIGURACIÓN AUTOMÁTICA DE WEBHOOK
        let webhookConfigured = false;
        let webhookError: string | null = null;

        try {
          // Obtener servicio Evolution API
          const svc = await getEvolutionApiServiceFromDB();
          
          // Construir URL del webhook automáticamente
          // SOLUCIÓN PROVISORIA: URL hardcodeada para evitar URLs incorrectas de deploys
          const baseUrl = 'https://aurelia-platform-preview.vercel.app';
          const webhookUrl = `${baseUrl}/api/webhook/evolution/${input.clientId}/${encodeURIComponent(input.instanceName)}`;
          
          console.log(`🔗 Configurando webhook automáticamente para instancia ${input.instanceName}:`, {
            clientId: input.clientId,
            webhookUrl,
            containerName: integration.evolutionApi.containerName
          });

          // Configurar webhook usando el servicio Evolution API
          const webhookEvents = ["QRCODE_UPDATED", "MESSAGES_SET", "MESSAGES_UPSERT", "CONNECTION_UPDATE", "SEND_MESSAGE"] as any;
          await svc.setWebhook(
            integration.evolutionApi.containerName!,
            input.instanceName,
            {
              url: webhookUrl,
              events: webhookEvents,
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
          id: evolutionApiInstance.id,
          instanceName: evolutionApiInstance.instanceName,
          phoneNumber: evolutionApiInstance.phoneNumber,
          status: evolutionApiInstance.status,
          lastConnected: evolutionApiInstance.lastConnected,
          createdAt: evolutionApiInstance.createdAt,
          qrCode: instanceInfo.qrCode,
          webhookConfigured,
          webhookError
        }
      } catch (error) {
        console.error("Error creating instance:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al crear la instancia"
        })
      }
    }),

  // Conectar instancia (generar QR)
  connect: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input: instanceId }) => {
      try {
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: instanceId },
          include: {
            evolutionApi: {
              include: {
                integration: true
              }
            }
          }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        // Conectar instancia usando el servicio Evolution API
        const svc = await getEvolutionApiServiceFromDB()
        const connectionResult = await svc.connectInstance(
          instance.evolutionApi.containerName!,
          instance.instanceName
        )

        // Actualizar estado en la base de datos
        await db.evolutionApiInstance.update({
          where: { id: instanceId },
          data: {
            status: "CONNECTING",
            updatedAt: new Date()
          }
        })

        return {
          qrCode: connectionResult.code,
          status: "CONNECTING"
        }
      } catch (error) {
        console.error("Error connecting instance:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        
        // Manejar errores específicos de Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P1017') {
            throw new TRPCError({
              code: "SERVICE_UNAVAILABLE",
              message: "La base de datos no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos."
            })
          } else if (error.code === 'P2024') {
            throw new TRPCError({
              code: "TIMEOUT",
              message: "La operación tardó demasiado tiempo. Por favor, intenta nuevamente."
            })
          }
        }
        
        // Manejar errores de Evolution API
        if (error instanceof Error) {
          if (error.message.includes("Whatsapp no está disponible")) {
            throw new TRPCError({
              code: "SERVICE_UNAVAILABLE",
              message: "El servicio de WhatsApp no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos."
            })
          } else if (error.message.includes("Error de autenticación")) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Error de autenticación con el servicio de WhatsApp. Contacta al soporte técnico."
            })
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al conectar la instancia"
        })
      }
    }),

  // Desconectar instancia
  disconnect: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input: instanceId }) => {
      try {
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: instanceId },
          include: {
            evolutionApi: {
              include: {
                integration: true
              }
            }
          }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        // Desconectar instancia usando el endpoint real de Evolution API
        const svc = await getEvolutionApiServiceFromDB()
        
        try {
          // Llamar al endpoint real de logout en Evolution API
          await svc.logoutInstance(
            instance.evolutionApi.containerName!,
            instance.instanceName
          )
          
          console.log(`✅ Instancia ${instance.instanceName} desconectada exitosamente en Whatsapp`)
        } catch (error) {
          console.error(`❌ Error desconectando instancia ${instance.instanceName} en Whatsapp:`, error)
          // Continuar con la actualización de BD aunque falle el logout en Evolution API
          // para mantener consistencia en la UI
        }

        // Actualizar estado en la base de datos
        await db.evolutionApiInstance.update({
          where: { id: instanceId },
          data: {
            status: "DISCONNECTED",
            updatedAt: new Date()
          }
        })

        return { success: true }
      } catch (error) {
        console.error("Error disconnecting instance:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al desconectar la instancia"
        })
      }
    }),

  // Eliminar instancia
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input: instanceId }) => {
      try {
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: instanceId },
          include: {
            evolutionApi: {
              include: {
                integration: true
              }
            },
            conversations: true,
            messages: true
          }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        // Verificar que no tenga conversaciones activas
        const activeConversations = instance.conversations.filter(
          conv => conv.status === "ACTIVA"
        )

        if (activeConversations.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No se puede eliminar una instancia con conversaciones activas"
          })
        }

        // Eliminar instancia usando el servicio Evolution API
        const svc = await getEvolutionApiServiceFromDB()
        await svc.deleteInstance(
          (instance as any).evolutionApi.containerName,
          instance.instanceName
        )

        // Eliminar de la base de datos (cascade eliminará webhooks y mensajes)
        await db.evolutionApiInstance.delete({
          where: { id: instanceId }
        })

        return { success: true }
      } catch (error) {
        console.error("Error deleting instance:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al eliminar la instancia"
        })
      }
    }),

  // Verificar estado de instancia
  checkStatus: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input: instanceId }) => {
      try {
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: instanceId },
          include: {
            evolutionApi: {
              include: {
                integration: true
              }
            }
          }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        // Verificar estado en Evolution API
        const svc = await getEvolutionApiServiceFromDB()
        const instanceInfo = await svc.getInstanceInfo(
          instance.evolutionApi.containerName!,
          instance.instanceName
        )

        // Actualizar estado en la base de datos si cambió
        const mappedDbStatus = instanceInfo.status === 'open' ? 'CONNECTED'
          : instanceInfo.status === 'connecting' ? 'CONNECTING'
          : 'DISCONNECTED'

        if (mappedDbStatus !== instance.status) {
          await db.evolutionApiInstance.update({
            where: { id: instanceId },
            data: {
              status: mappedDbStatus,
              lastConnected: instanceInfo.status === 'open' ? new Date() : instance.lastConnected,
              updatedAt: new Date()
            }
          })
        }

        return {
          status: mappedDbStatus,
          qrCode: (instanceInfo as any).qrcode?.base64 ?? (instanceInfo as any).qrcode?.code,
          lastConnected: instance.lastConnected
        }
      } catch (error) {
        console.error("Error checking instance status:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        
        // Manejar errores específicos de Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P1017') {
            throw new TRPCError({
              code: "SERVICE_UNAVAILABLE",
              message: "La base de datos no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos."
            })
          } else if (error.code === 'P2024') {
            throw new TRPCError({
              code: "TIMEOUT",
              message: "La operación tardó demasiado tiempo. Por favor, intenta nuevamente."
            })
          }
        }
        
        // Manejar errores de Evolution API
        if (error instanceof Error) {
          if (error.message.includes("Whatsapp no está disponible")) {
            throw new TRPCError({
              code: "SERVICE_UNAVAILABLE",
              message: "El servicio de WhatsApp no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos."
            })
          } else if (error.message.includes("Error de autenticación")) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Error de autenticación con el servicio de WhatsApp. Contacta al soporte técnico."
            })
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al verificar el estado de la instancia"
        })
      }
    }),

  // Obtener QR y estado actual de la instancia (similar al Dashboard)
  getCurrentQR: protectedProcedure
    .input(z.object({
      instanceId: z.string().uuid()
    }))
    .query(async ({ input }): Promise<{
      qrCode: string | null
      isConnected: boolean
      status: string
      timestamp: Date
    }> => {
      try {
        const instance = await db.evolutionApiInstance.findUnique({
          where: { id: input.instanceId },
          include: {
            evolutionApi: {
              include: {
                integration: true
              }
            }
          }
        })

        if (!instance) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Instancia no encontrada"
          })
        }

        const svc = await getEvolutionApiServiceFromDB()
        
        // Verificar estado de conexión
        const instanceStatus = await svc.getConnectionState(
          instance.evolutionApi.containerName!,
          instance.instanceName
        ).catch((e) => {
          console.warn('getConnectionState error; proceeding to try QR. Details:', e instanceof Error ? e.message : e)
          return { instance: { instanceName: instance.instanceName, state: 'close' as const } }
        })
        
        const rawState: unknown = (instanceStatus as any)?.instance?.state ?? (instanceStatus as any)?.state
        let currentState = typeof rawState === 'string' ? rawState : 'close'

        // Verificación adicional para detectar conexión real
        if (currentState === 'connecting') {
          try {
            const instanceInfo = await svc.getInstanceInfo(
              (instance as any).evolutionApi.containerName!,
              instance.instanceName
            )
            
            if (instanceInfo && instanceInfo.instanceName) {
              console.log(`🔧 CORRECCIÓN: Estado reportado como 'connecting' pero instancia existe, asumiendo 'open'`)
              currentState = 'open'
            }
          } catch (error) {
            console.warn(`🔍 No se pudo obtener info de instancia para ${instance.instanceName}:`, error)
          }
        }
        
        // Si está conectado, no mostrar QR
        if (currentState === "open") {
          // Actualizar BD automáticamente
          if (instance.status !== "CONNECTED") {
            try {
              await db.evolutionApiInstance.update({
                where: { id: input.instanceId },
                data: {
                  status: "CONNECTED",
                  lastConnected: new Date(),
                  updatedAt: new Date()
                }
              })
            } catch (error) {
              console.error(`❌ Error actualizando BD:`, error)
            }
          }

          return {
            qrCode: null,
            isConnected: true,
            status: "CONNECTED",
            timestamp: new Date()
          }
        }

        // Obtener QR si no está conectado
        if (currentState !== "open") {
          try {
            const qrCode = await svc.getInstanceQR(
              instance.evolutionApi.containerName!,
              instance.instanceName
            )
            
            // Actualizar estado a CONNECTING si hay QR
            if (qrCode && instance.status !== "CONNECTING") {
              try {
                await db.evolutionApiInstance.update({
                  where: { id: input.instanceId },
                  data: {
                    status: "CONNECTING",
                    updatedAt: new Date()
                  }
                })
              } catch (error) {
                console.error(`❌ Error actualizando BD a CONNECTING:`, error)
              }
            }

            // Asegurar que el QR tenga el formato correcto para el frontend
            const formattedQR = qrCode && !qrCode.startsWith('data:') 
              ? `data:image/png;base64,${qrCode}` 
              : qrCode

            console.log(`🔍 QR formateado para frontend:`, {
              originalLength: qrCode?.length,
              formattedLength: formattedQR?.length,
              hasDataPrefix: formattedQR?.startsWith('data:')
            })

            return {
              qrCode: formattedQR,
              isConnected: false,
              status: "CONNECTING",
              timestamp: new Date()
            }
          } catch (error) {
            console.error(`❌ Error obteniendo QR para ${instance.instanceName}:`, error)
            
            // Si es un error 503, propagarlo para que el frontend pueda manejar el retry
            if (error instanceof Error && error.message.includes('503')) {
              throw new TRPCError({
                code: "SERVICE_UNAVAILABLE",
                message: error.message
              })
            }
            
            return {
              qrCode: null,
              isConnected: false,
              status: "ERROR",
              timestamp: new Date()
            }
          }
        }

        return {
          qrCode: null,
          isConnected: false,
          status: "DISCONNECTED",
          timestamp: new Date()
        }
      } catch (error) {
        console.error("Error getting current QR:", error)
        if (error instanceof TRPCError) {
          throw error
        }
        
        // Manejar errores específicos de Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P1017') {
            throw new TRPCError({
              code: "SERVICE_UNAVAILABLE",
              message: "La base de datos no está disponible temporalmente. Por favor, intenta nuevamente en unos minutos."
            })
          } else if (error.code === 'P2024') {
            throw new TRPCError({
              code: "TIMEOUT",
              message: "La operación tardó demasiado tiempo. Por favor, intenta nuevamente."
            })
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al obtener el código QR"
        })
      }
    })
})
