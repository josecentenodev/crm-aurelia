import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import {
    ClientSchema,
    CreateClientSchema,
    UpdateClientSchema,
    UserSchema,
    CreateUserSchema,
    UpdateUserSchema,
    AgentTemplateSchema,
    CreateAgentTemplateSchema,
    UpdateAgentTemplateSchema,
    AgentFieldSchema,
    AgentSchema,
    type CreateAgent,
    CreateAgentSchema,
    UpdateAgentSchema,
} from '@/domain';
import bcrypt from "bcryptjs";
import { FieldType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { AiInfo } from "@/lib/openai";
import Ai from "@/lib/ai";

// Middleware para validar que el usuario es superadmin
const superadminMiddleware = (ctx: { session: { user: { type: string } } }) => {
    if (ctx.session.user.type !== "AURELIA") {
        throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "Solo superadmins pueden acceder a este endpoint" 
        });
    }
    return ctx;
};

// Función para validar que se puede eliminar un cliente
async function validateClientDeletion(client: any) {
    // 1. Verificar que no sea el último cliente del sistema
    const totalClients = await db.client.count();
    if (totalClients <= 1) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'No se puede eliminar el último cliente del sistema'
        });
    }

    // 2. Verificar que no tenga procesos críticos ejecutándose
    const activeIntegrations = client.integrations?.filter((integration: any) => 
        integration.isActive && integration.evolutionApi?.instances?.some((instance: any) => 
            instance.status === 'CONNECTED' || instance.status === 'CONNECTING'
        )
    );

    if (activeIntegrations && activeIntegrations.length > 0) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'No se puede eliminar un cliente con integraciones activas. Detenga todas las instancias primero.'
        });
    }

    // 3. Verificar que no tenga conversaciones activas recientes
    const recentConversations = await db.conversation.count({
        where: {
            clientId: client.id,
            lastMessageAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
            }
        }
    });

    if (recentConversations > 0) {
        throw new TRPCError({
            code: 'CONFLICT',
            message: 'No se puede eliminar un cliente con conversaciones activas en las últimas 24 horas'
        });
    }
}

// Función para detener recursos externos
async function stopExternalResources(client: any, tx: any) {
    try {
        // Detener contenedores Docker de Evolution API
        for (const integration of client.integrations || []) {
            if (integration.type === 'EVOLUTION_API' && integration.evolutionApi) {
                const evolutionApi = integration.evolutionApi;
                
                // Detener todas las instancias
                for (const instance of evolutionApi.instances || []) {
                    if (instance.status === 'CONNECTED' || instance.status === 'CONNECTING') {
                        // Aquí se podría implementar la lógica para detener el contenedor Docker
                        // Por ahora solo registramos en el log
                        console.log(`Deteniendo instancia ${instance.instanceName} del cliente ${client.name}`);
                        
                        // Actualizar estado de la instancia
                        await tx.evolutionApiInstance.update({
                            where: { id: instance.id },
                            data: { 
                                status: 'DISCONNECTED',
                                lastConnected: new Date()
                            }
                        });
                    }
                }
                
                // Detener el contenedor principal si está corriendo
                if (evolutionApi.containerStatus === 'RUNNING') {
                    console.log(`Deteniendo contenedor ${evolutionApi.containerName} del cliente ${client.name}`);
                    
                    await tx.evolutionApiIntegration.update({
                        where: { id: evolutionApi.id },
                        data: { 
                            containerStatus: 'STOPPED',
                            lastHealthCheck: new Date()
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error deteniendo recursos externos:', error);
        // No lanzamos el error para no interrumpir la eliminación
        // Solo lo registramos
    }
}

// Función para validar eliminación sin lanzar errores (solo información)
async function validateClientDeletionForInfo(client: any) {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        // 1. Verificar que no sea el último cliente del sistema
        const totalClients = await db.client.count();
        if (totalClients <= 1) {
            errors.push('No se puede eliminar el último cliente del sistema');
        }

        // 2. Verificar que no tenga procesos críticos ejecutándose
        const activeIntegrations = client.integrations?.filter((integration: any) => 
            integration.isActive && integration.evolutionApi?.instances?.some((instance: any) => 
                instance.status === 'CONNECTED' || instance.status === 'CONNECTING'
            )
        );

        if (activeIntegrations && activeIntegrations.length > 0) {
            errors.push('No se puede eliminar un cliente con integraciones activas. Detenga todas las instancias primero.');
        }

        // 3. Verificar que no tenga conversaciones activas recientes
        const recentConversations = await db.conversation.count({
            where: {
                clientId: client.id,
                lastMessageAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                }
            }
        });

        if (recentConversations > 0) {
            warnings.push(`Cliente tiene ${recentConversations} conversaciones activas en las últimas 24 horas`);
        }

        // 4. Verificar usuarios activos
        const activeUsers = await db.user.count({
            where: {
                clientId: client.id,
                active: true
            }
        });

        if (activeUsers > 0) {
            warnings.push(`Cliente tiene ${activeUsers} usuarios activos`);
        }

        // 5. Verificar si tiene datos importantes
        const hasImportantData = client._count?.conversations > 100 || 
                                client._count?.contacts > 1000 || 
                                client._count?.agentes > 10;

        if (hasImportantData) {
            warnings.push('Cliente tiene una cantidad significativa de datos que se perderán');
        }

        return {
            canDelete: errors.length === 0,
            errors,
            warnings
        };

    } catch (error) {
        return {
            canDelete: false,
            errors: ['Error al validar cliente'],
            warnings: []
        };
    }
}

export const superadminRouter = createTRPCRouter({
    // ================= CLIENTES =================
    // Listar todos los clientes
    getClients: protectedProcedure
    .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        statusId: z.string().uuid().optional(),
        planId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            OR?: Array<{
                name?: { contains: string; mode: 'insensitive' };
                email?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
            }>;
            statusId?: string;
            planId?: string;
        } = {};

        if (input.search) {
            whereClause.OR = [
                { name: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } },
                { description: { contains: input.search, mode: 'insensitive' } }
            ];
        }

        if (input.statusId) {
            whereClause.statusId = input.statusId;
        }

        if (input.planId) {
            whereClause.planId = input.planId;
        }

        try {
            const [clients, total] = await Promise.all([
                db.client.findMany({
                    where: whereClause,
                    include: {
                        status: true,
                        plan: true,
                        _count: {
                            select: {
                                users: true,
                                contacts: true,
                                agentes: true,
                                conversations: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                db.client.count({ where: whereClause })
            ]);

            return {
                clients,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los clientes' 
            });
        }
    }),

    // Obtener un cliente por ID
    getClientById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const client = await db.client.findUnique({ 
                where: { id: input.id },
                include: {
                    status: true,
                    plan: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            type: true,
                            active: true,
                            createdAt: true
                        }
                    },
                    contacts: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            status: true,
                            createdAt: true
                        },
                        take: 10
                    },
                    agentes: {
                        select: {
                            id: true,
                            name: true,
                            isActive: true,
                            createdAt: true
                        },
                        take: 10
                    },
                    _count: {
                        select: {
                            users: true,
                            contacts: true,
                            agentes: true,
                            conversations: true,
                            agentTemplates: true
                        }
                    }
                }
            });

            if (!client) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Cliente no encontrado' 
                });
            }

            return client;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener el cliente' 
            });
        }
    }),

    // Crear un nuevo cliente
    createClient: protectedProcedure
    .input(CreateClientSchema)
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el status y plan existen
            const [status, plan] = await Promise.all([
                db.clientStatus.findUnique({ where: { id: input.statusId } }),
                db.clientPlan.findUnique({ where: { id: input.planId } })
            ]);

            if (!status) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'Estado de cliente no válido' 
                });
            }

            if (!plan) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'Plan de cliente no válido' 
                });
            }

            // Preparar datos para Prisma
            const clientData = {
                ...input,
                settings: input.settings ?? undefined
            };

        const client = await db.client.create({ 
          data: clientData,
          include: {
            status: true,
            plan: true
          }
        });

        // 🆕 NUEVO: Crear integración Evolution API automáticamente
        let integrationResult = null;
        let integrationStatus: 'success' | 'error' | 'not_available' = 'not_available';
        let integrationError: string | null = null;

        try {
          // Verificar que Evolution API esté disponible globalmente
          const globalIntegration = await db.globalIntegration.findFirst({
            where: { type: "EVOLUTION_API", isActive: true }
          });

          if (globalIntegration) {
            // Importar el servicio de Evolution API
            const { getEvolutionApiServiceFromDB } = await import("@/server/services/evolution-api.factory");
            
            // Crear el contenedor para Evolution API
            const svc = await getEvolutionApiServiceFromDB();
            const deployed = await svc.deployClientContainer(client.id);
            
            const containerInfo = {
              containerName: deployed.container_name,
              hostPort: parseInt(deployed.host_port),
              evolutionApiUrl: deployed.evolution_api_url,
              managerUrl: deployed.manager_url
            };

            // Crear la integración en la base de datos
            const result = await db.$transaction(async (tx) => {
              const clientIntegration = await tx.clientIntegration.create({
                data: {
                  clientId: client.id,
                  type: "EVOLUTION_API",
                  name: globalIntegration.name,
                  description: globalIntegration.description,
                  isActive: true
                }
              });

              await tx.evolutionApiIntegration.create({
                data: {
                  integrationId: clientIntegration.id,
                  containerName: containerInfo.containerName,
                  hostPort: containerInfo.hostPort,
                  evolutionApiUrl: containerInfo.evolutionApiUrl,
                  managerUrl: containerInfo.managerUrl,
                  containerStatus: "RUNNING",
                  lastDeployedAt: new Date()
                }
              });

              return clientIntegration;
            });

            integrationResult = result;
            integrationStatus = 'success';
          }
        } catch (integrationError) {
          integrationStatus = 'error';
          integrationError = integrationError instanceof Error ? integrationError.message : 'Error desconocido al crear integración';
          
          // Si falla la integración, intentar limpiar el contenedor creado
          try {
            const { getEvolutionApiServiceFromDB } = await import("@/server/services/evolution-api.factory");
            const svc = await getEvolutionApiServiceFromDB();
            const containers = await svc.listContainers();
            const clientContainer = containers.find(c => 
              c.name.includes(`evolution_${client.id}_`) || 
              c.client_name === client.id
            );
            
            if (clientContainer) {
              await svc.containerAction({
                container_name: clientContainer.name,
                action: 'stop'
              });
            }
          } catch (cleanupError) {
            console.error('Error limpiando contenedor después de fallo:', cleanupError);
          }
        }
        
        return {
          client,
          integration: integrationResult,
          integrationStatus,
          integrationError
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Error al crear el cliente' 
        });
      }
    }),

    // Actualizar un cliente
    updateClient: protectedProcedure
    .input(UpdateClientSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const { id, ...data } = input;

        try {
            // Validar que el cliente existe
            const existingClient = await db.client.findUnique({ where: { id } });
            if (!existingClient) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Cliente no encontrado' 
                });
            }

            // Validar status y plan si se proporcionan
            if (data.statusId) {
                const status = await db.clientStatus.findUnique({ where: { id: data.statusId } });
                if (!status) {
                    throw new TRPCError({ 
                        code: 'BAD_REQUEST', 
                        message: 'Estado de cliente no válido' 
                    });
                }
            }

            if (data.planId) {
                const plan = await db.clientPlan.findUnique({ where: { id: data.planId } });
                if (!plan) {
                    throw new TRPCError({ 
                        code: 'BAD_REQUEST', 
                        message: 'Plan de cliente no válido' 
                    });
                }
            }

            // Preparar datos para Prisma
            const updateData = {
                ...data,
                settings: data.settings ?? undefined
            };

            const client = await db.client.update({ 
                where: { id }, 
                data: updateData,
                include: {
                    status: true,
                    plan: true
                }
            });

            return client;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar el cliente' 
            });
        }
    }),

    // Eliminar un cliente
    deleteClient: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el cliente existe
            const client = await db.client.findUnique({ 
                where: { id: input.id },
                include: {
                    _count: {
                        select: {
                            users: true,
                            contacts: true,
                            agentes: true,
                            conversations: true
                        }
                    }
                }
            });

            if (!client) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Cliente no encontrado' 
                });
            }

            // Verificar si tiene datos asociados
            const hasData = client._count.users > 0 || 
                client._count.contacts > 0 || 
                client._count.agentes > 0 || 
                client._count.conversations > 0;

            if (hasData) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'No se puede eliminar un cliente que tiene usuarios, contactos, agentes o conversaciones asociadas' 
                });
            }

            await db.client.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al eliminar el cliente' 
            });
        }
    }),

    // ================= USUARIOS =================
    // Listar usuarios por cliente
    getUsersByClient: protectedProcedure
    .input(z.object({ 
        clientId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        type: z.enum(['AURELIA', 'ADMIN', 'CUSTOMER']).optional(),
        active: z.boolean().optional()
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            clientId: string;
            OR?: Array<{
                name?: { contains: string; mode: 'insensitive' };
                email?: { contains: string; mode: 'insensitive' };
            }>;
            type?: 'AURELIA' | 'ADMIN' | 'CUSTOMER';
            active?: boolean;
        } = { clientId: input.clientId };

        if (input.search) {
            whereClause.OR = [
                { name: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } }
            ];
        }

        if (input.type) {
            whereClause.type = input.type;
        }

        if (input.active !== undefined) {
            whereClause.active = input.active;
        }

        try {
            const [users, total] = await Promise.all([
                db.user.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        type: true,
                        active: true,
                        image: true,
                        createdAt: true,
                        updatedAt: true,
                        client: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }),
                db.user.count({ where: whereClause })
            ]);

            return {
                users,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los usuarios del cliente' 
            });
        }
    }),

    // Crear usuario para un cliente
    createUserForClient: protectedProcedure
    .input(CreateUserSchema.extend({ clientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el cliente existe
            const client = await db.client.findUnique({ where: { id: input.clientId } });
            if (!client) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Cliente no encontrado' 
                });
            }

            // Validar que el email no esté en uso
            if (input.email) {
                const existingUser = await db.user.findUnique({ where: { email: input.email } });
                if (existingUser) {
                    throw new TRPCError({ 
                        code: 'BAD_REQUEST', 
                        message: 'El email ya está en uso' 
                    });
                }
            }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(input.password, 12);

            const user = await db.user.create({ 
                data: { ...input, email: input.email?.toLowerCase() ?? null, password: hashedPassword },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    type: true,
                    active: true,
                    createdAt: true,
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return user;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al crear el usuario para el cliente' 
            });
        }
    }),

    // Actualizar usuario
    updateUser: protectedProcedure
    .input(UpdateUserSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const { id, ...data } = input;

        try {
            // Validar que el usuario existe
            const existingUser = await db.user.findUnique({ where: { id } });
            if (!existingUser) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Usuario no encontrado' 
                });
            }

            // Validar email único si se está actualizando
            if (data.email && data.email !== existingUser.email) {
                const emailUser = await db.user.findUnique({ where: { email: data.email } });
                if (emailUser) {
                    throw new TRPCError({ 
                        code: 'BAD_REQUEST', 
                        message: 'El email ya está en uso' 
                    });
                }
            }

            const user = await db.user.update({ 
                where: { id }, 
                data,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    type: true,
                    active: true,
                    updatedAt: true,
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return user;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar el usuario' 
            });
        }
    }),

    // Eliminar usuario
    deleteUser: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el usuario existe
            const user = await db.user.findUnique({ 
                where: { id: input.id },
                include: {
                    _count: {
                        select: {
                            conversations: true,
                            auditLogs: true
                        }
                    }
                }
            });

            if (!user) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Usuario no encontrado' 
                });
            }

            // No permitir eliminar superadmins
            if (user.type === 'AURELIA') {
                throw new TRPCError({ 
                    code: 'FORBIDDEN', 
                    message: 'No se puede eliminar un superadmin' 
                });
            }

            // Verificar si tiene datos asociados
            const hasData = user._count.conversations > 0 || user._count.auditLogs > 0;

            if (hasData) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'No se puede eliminar un usuario que tiene conversaciones o logs de auditoría asociados' 
                });
            }

            await db.user.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al eliminar el usuario' 
            });
        }
    }),

    // ================= AI INFO =================
    createAiInfo: protectedProcedure.input(
        z.object({clientId: z.string(), name: z.string()})
    ).mutation(
        async ({input}) => {
            try {
                return AiInfo.create(input.clientId, input.name);
            } catch (error: unknown) {
                if (error instanceof TRPCError) {
                    throw error;
                } else {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Error al crear AI Info del cliente"
                    })
                }
            }
        }
    ),
    getAiInfo: protectedProcedure.input(
        z.object({clientId: z.string()})
    ).query(async ({input}) => {
        try {
            const aiInfo = await AiInfo.get(input.clientId);
            if (!aiInfo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Ai Info no encontrada"
                });
            }
            return aiInfo;
        } catch (error: unknown) {
            if (error instanceof TRPCError) {
                throw error;
            } else {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error al obtener la AI Info del cliente"
                });
            }
        }
    }),
    updateAiInfo: protectedProcedure.input(
        z.object({clientId: z.string()})
    ).mutation(async ({input}) => {
        try {
            return await AiInfo.update(input.clientId);
        } catch (error: unknown) {
            if (error instanceof TRPCError) {
                throw error;
            } else {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error al actualizar la AI Info del cliente"
                });
            }
        }
    }),
    deleteAiInfo: protectedProcedure.input(
        z.object({clientId: z.string(), aiInfoId: z.string()})
    ).mutation(async ({input}) => {
        try {
            await AiInfo.delete(input.clientId, input.aiInfoId);
            return {success: true};
        } catch (error: unknown) {
            if (error instanceof TRPCError) {
                throw error;
            } else {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error al eliminar la AI Info del cliente"
                });
            }
        }
    }),

    // ================= TEMPLATES =================
    // Listar templates por cliente
    getTemplatesByClient: protectedProcedure
    .input(z.object({ 
        clientId: z.string().uuid(),
        includeGlobal: z.boolean().default(false)
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const whereClause: {
                OR?: Array<{
                    clientId?: string;
                    isGlobal?: boolean;
                }>;
                clientId?: string;
            } = {};

            if (input.includeGlobal) {
                whereClause.OR = [
                    { clientId: input.clientId },
                    { isGlobal: true }
                ];
            } else {
                whereClause.clientId = input.clientId;
            }

            const templates = await db.agentTemplate.findMany({ 
                where: whereClause, 
                include: { 
                    steps: {
                        orderBy: { order: 'asc' },
                        include: {
                            fields: {
                                orderBy: { order: 'asc' }
                ,         }
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            agentes: true
                        }
                    }
                },
                orderBy: [
                    { isGlobal: 'desc' },
                    { createdAt: 'desc' }
                ]
            });

            return templates;
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los templates del cliente' 
            });
        }
    }),

    // Obtener un template por ID
    getTemplateById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const template = await db.agentTemplate.findUnique({ 
                where: { id: input.id },
                include: { 
                    steps: {
                        orderBy: { order: 'asc' },
                        include: {
                            fields: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    agentes: {
                        select: {
                            id: true,
                            name: true,
                            isActive: true
                        }
                    }
                }
            });

            if (!template) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Template no encontrado' 
                });
            }

            return template;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener el template' 
            });
        }
    }),

    // Crear template para un cliente
    createTemplateForClient: protectedProcedure
    .input(CreateAgentTemplateSchema.extend({ 
        clientId: z.string().uuid(),
        isGlobal: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const { clientId, isGlobal, ...data } = input;

            // Validar que el cliente existe (solo si no es global)
            if (!isGlobal) {
                const client = await db.client.findUnique({ where: { id: clientId } });
                if (!client) {
                    throw new TRPCError({ 
                        code: 'NOT_FOUND', 
                        message: 'Cliente no encontrado' 
                    });
                }
            }

            // Transacción: crear template, steps y fields
            const result = await db.$transaction(async (tx) => {
                const template = await tx.agentTemplate.create({
                    data: {
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        isActive: data.isActive,
                        isGlobal,
                        clientId: isGlobal ? null : clientId
                    }
                });

                // Crear steps y sus fields
                if (data.steps && data.steps.length > 0) {
                    for (const stepData of data.steps) {
                        const step = await tx.agentTemplateStep.create({
                            data: {
                                templateId: template.id,
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

                // Retornar el template con sus steps y fields
                return tx.agentTemplate.findUnique({
                    where: { id: template.id },
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                fields: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        client: { select: { id: true, name: true } }
                    }
                });
            });

            return result;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al crear el template para el cliente' 
            });
        }
    }),

    // Actualizar template
    updateTemplateConfig: protectedProcedure
    .input(AgentTemplateSchema.pick({ id: true }).extend({
        name: z.string().optional(),
        description: z.string().optional(),
        isGlobal: z.boolean().optional()
    }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const { id, ...data } = input;

        try {
            // Validar que el template existe
            const existingTemplate = await db.agentTemplate.findUnique({ where: { id } });
            if (!existingTemplate) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Template no encontrado' 
                });
            }

            const template = await db.agentTemplate.update({ 
                where: { id }, 
                data,
                include: {
                    steps: {
                        include: {
                            fields: true
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return template;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar el template' 
            });
        }
    }),

    // Eliminar template
    deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el template existe
            const template = await db.agentTemplate.findUnique({ 
                where: { id: input.id },
                include: {
                    _count: {
                        select: {
                            agentes: true
                        }
                    }
                }
            });

            if (!template) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Template no encontrado' 
                });
            }

            // Verificar si tiene agentes asociados
            if (template._count.agentes > 0) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'No se puede eliminar un template que tiene agentes asociados' 
                });
            }

            await db.agentTemplate.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al eliminar el template' 
            });
        }
    }),

    // ================= AGENTES =================
    // Listar agentes por cliente
    getAgentesByClient: protectedProcedure
    .input(z.object({ 
        clientId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        active: z.boolean().optional()
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            clientId: string;
            isActive?: boolean;
        } = { clientId: input.clientId };

        if (input.active !== undefined) {
            whereClause.isActive = input.active;
        }

        try {
            const [agentes, total] = await Promise.all([
                db.agente.findMany({
                    where: whereClause,
                    include: {
                        template: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isGlobal: true
                            }
                        },
                        client: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                conversations: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                db.agente.count({ where: whereClause })
            ]);

            return {
                agentes,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los agentes del cliente' 
            });
        }
    }),

    // Obtener un agente por ID
    getAgenteById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const agente = await db.agente.findUnique({ 
                where: { id: input.id },
                include: {
                    template: {
                        include: {
                            steps: {
                                orderBy: { order: 'asc' },
                                include: {
                                    fields: {
                                        orderBy: { order: 'asc' }
                                    }
                                }
                            }
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    conversations: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            createdAt: true
                        },
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                        select: {
                            conversations: true
                        }
                    }
                }
            });

            if (!agente) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Agente no encontrado' 
                });
            }

            return agente;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener el agente' 
            });
        }
    }),

    // Crear agente para un cliente
    createAgenteForClient: protectedProcedure
    .input(CreateAgentSchema.extend({ clientId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const { clientId, ...data } = input;

            // Validar que el cliente existe
            const client = await db.client.findUnique({ where: { id: clientId } });
            if (!client) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Cliente no encontrado' 
                });
            }

            // Validar que el template existe
            const template = await db.agentTemplate.findUnique({ where: { id: data.templateId } });
            if (!template) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Template no encontrado' 
                });
            }

            // Validar que el template pertenece al cliente o es global
            if (!template.isGlobal && template.clientId !== clientId) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'El template no pertenece al cliente' 
                });
            }
            let prompt = Ai.createPromptFromAgent(data);
            const agente = await db.agente.create({ 
                data: {
                    ...data,
                    clientId,
                    aiModel: "gpt-4o-mini",
                    aiTemperature: 1,
                    aiTopP: 1,
                    aiMaxOutputTokens: 1000,
                    aiPrompt: prompt,
                },
                include: {
                    template: {
                        select: {
                            id: true,
                            name: true,
                            description: true
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return agente;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al crear el agente para el cliente' 
            });
        }
    }),

    // Actualizar agente
    updateAgente: protectedProcedure
    .input(UpdateAgentSchema.extend({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const { id, ...data } = input;

        try {
            // Validar que el agente existe
            const existingAgente = await db.agente.findUnique({ where: { id } });
            if (!existingAgente) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Agente no encontrado' 
                });
            }

            // Validar template si se está actualizando
            if (data.templateId) {
                const template = await db.agentTemplate.findUnique({ where: { id: data.templateId } });
                if (!template) {
                    throw new TRPCError({ 
                        code: 'NOT_FOUND', 
                        message: 'Template no encontrado' 
                    });
                }

                // Validar que el template pertenece al cliente o es global
                if (!template.isGlobal && template.clientId !== existingAgente.clientId) {
                    throw new TRPCError({ 
                        code: 'BAD_REQUEST', 
                        message: 'El template no pertenece al cliente del agente' 
                    });
                }
            }
            if (data.name != null) {
              data.name = existingAgente.name;
            }
            if (data.description != null) {
              data.description = existingAgente.description ?? undefined;
            }
            if (data.customFields != null) {
              data.customFields = existingAgente.customFields as Record<string, any>;
            }

            data.aiPrompt = Ai.createPromptFromAgent(data as CreateAgent);
            const agente = await db.agente.update({ 
                where: { id }, 
                data,
                include: {
                    template: {
                        select: {
                            id: true,
                            name: true,
                            description: true
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return agente;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar el agente' 
            });
        }
    }),

    // Eliminar agente
    deleteAgente: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el agente existe
            const agente = await db.agente.findUnique({ 
                where: { id: input.id },
                include: {
                    _count: {
                        select: {
                            conversations: true
                        }
                    }
                }
            });

            if (!agente) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Agente no encontrado' 
                });
            }

            // Verificar si tiene conversaciones asociadas
            if (agente._count.conversations > 0) {
                throw new TRPCError({ 
                    code: 'BAD_REQUEST', 
                    message: 'No se puede eliminar un agente que tiene conversaciones asociadas' 
                });
            }

            await db.agente.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al eliminar el agente' 
            });
        }
    }),

    // ================= CAMPOS DE TEMPLATE =================
    // Listar campos por template
    getFieldsByTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Obtener fields a través de steps del template
            const template = await db.agentTemplate.findUnique({
                where: { id: input.templateId },
                include: {
                    steps: {
                        include: {
                            fields: {
                                orderBy: { order: 'asc' }
                            }
                        },
                        orderBy: { order: 'asc' }
                    }
                }
            });

            if (!template) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Template no encontrado' 
                });
            }

            // Aplanar todos los fields de todos los steps
            const fields = template.steps.flatMap(step => step.fields);

            return fields;
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los campos del template' 
            });
        }
    }),

    // Obtener un campo por ID
    getFieldById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            const field = await db.agentField.findUnique({ 
                where: { id: input.id },
                include: {
                    step: {
                        select: {
                            id: true,
                            name: true,
                            template: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            if (!field) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Campo no encontrado' 
                });
            }

            return field;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener el campo' 
            });
        }
    }),

    // Crear campo para un template
    createFieldForTemplate: protectedProcedure
    .input(AgentFieldSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el step existe
            const step = await db.agentTemplateStep.findUnique({ where: { id: input.stepId } });
            if (!step) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Step no encontrado' 
                });
            }

            const field = await db.agentField.create({ 
                data: input,
                include: {
                    step: {
                        select: {
                            id: true,
                            name: true,
                            template: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            return field;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al crear el campo para el template' 
            });
        }
    }),

    // Actualizar campo
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
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const { id, ...data } = input;

        try {
            // Validar que el campo existe
            const existingField = await db.agentField.findUnique({ where: { id } });
            if (!existingField) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Campo no encontrado' 
                });
            }

            const field = await db.agentField.update({ 
                where: { id }, 
                data,
                include: {
                    step: {
                        select: {
                            id: true,
                            name: true,
                            template: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            return field;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar el campo' 
            });
        }
    }),

    // Eliminar campo
    deleteField: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Validar que el campo existe
            const field = await db.agentField.findUnique({ where: { id: input.id } });
            if (!field) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Campo no encontrado' 
                });
            }

            await db.agentField.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al eliminar el campo' 
            });
        }
    }),

    // ================= ESTADÍSTICAS =================
    // Obtener estadísticas generales
    getStats: protectedProcedure.query(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            const [
                totalClients,
                totalUsers,
                totalAgentes,
                totalTemplates,
                totalConversations,
                activeClients,
                activeUsers,
                activeAgentes
            ] = await Promise.all([
                    db.client.count(),
                    db.user.count(),
                    db.agente.count(),
                    db.agentTemplate.count(),
                    db.conversation.count(),
                    db.client.count({ where: { status: { name: 'ACTIVO' } } }),
                    db.user.count({ where: { active: true } }),
                    db.agente.count({ where: { isActive: true } })
                ]);

            return {
                totalClients,
                totalUsers,
                totalAgentes,
                totalTemplates,
                totalConversations,
                activeClients,
                activeUsers,
                activeAgentes
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener las estadísticas' 
            });
        }
    }),

    // ================= CONFIGURACIÓN =================
    // Obtener estados de cliente
    getClientStatuses: protectedProcedure.query(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            const statuses = await db.clientStatus.findMany({
                orderBy: { name: 'asc' }
            });

            return statuses;
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los estados de cliente' 
            });
        }
    }),

    // Obtener planes de cliente
    getClientPlans: protectedProcedure.query(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            const plans = await db.clientPlan.findMany({
                orderBy: { name: 'asc' }
            });

            return plans;
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los planes de cliente' 
            });
        }
    }),

    // ================= TEMPLATES GLOBALES =================
    // Listar templates globales
    getGlobalTemplates: protectedProcedure
    .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        active: z.boolean().optional()
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            isGlobal: boolean;
            OR?: Array<{
                name?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
                category?: { contains: string; mode: 'insensitive' };
            }>;
            isActive?: boolean;
        } = { isGlobal: true };

        if (input.search) {
            whereClause.OR = [
                { name: { contains: input.search, mode: 'insensitive' } },
                { description: { contains: input.search, mode: 'insensitive' } },
                { category: { contains: input.search, mode: 'insensitive' } }
            ];
        }

        if (input.active !== undefined) {
            whereClause.isActive = input.active;
        }

        try {
            const [templates, total] = await Promise.all([
                db.agentTemplate.findMany({
                    where: whereClause,
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                fields: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        _count: {
                            select: {
                                agentes: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                db.agentTemplate.count({ where: whereClause })
            ]);

            return {
                templates,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los templates globales' 
            });
        }
    }),

    // ================= TEMPLATES LOCALES =================
    // Listar templates locales
    getLocalTemplates: protectedProcedure
    .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        active: z.boolean().optional(),
        clientId: z.string().uuid().optional()
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            isGlobal: boolean;
            OR?: Array<{
                name?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
                category?: { contains: string; mode: 'insensitive' };
            }>;
            isActive?: boolean;
            clientId?: string;
        } = { isGlobal: false };

        if (input.search) {
            whereClause.OR = [
                { name: { contains: input.search, mode: 'insensitive' } },
                { description: { contains: input.search, mode: 'insensitive' } },
                { category: { contains: input.search, mode: 'insensitive' } }
            ];
        }

        if (input.active !== undefined) {
            whereClause.isActive = input.active;
        }

        if (input.clientId) {
            whereClause.clientId = input.clientId;
        }

        try {
            const [templates, total] = await Promise.all([
                db.agentTemplate.findMany({
                    where: whereClause,
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                fields: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        client: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                agentes: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                db.agentTemplate.count({ where: whereClause })
            ]);

            return {
                templates,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los templates locales' 
            });
        }
    }),

    // Obtener templates
    getTemplates: protectedProcedure
    .input(z.object({
        search: z.string().optional(),
        active: z.boolean().optional(),
        isGlobal: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            OR?: Array<{
                name?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
                category?: { contains: string; mode: 'insensitive' };
            }>;
            isActive?: boolean;
            isGlobal?: boolean;
        } = {};

        if (input.search) {
            whereClause.OR = [
                { name: { contains: input.search, mode: 'insensitive' } },
                { description: { contains: input.search, mode: 'insensitive' } },
                { category: { contains: input.search, mode: 'insensitive' } }
            ];
        }

        if (input.active !== undefined) {
            whereClause.isActive = input.active;
        }

        if (input.isGlobal !== undefined) {
            whereClause.isGlobal = input.isGlobal;
        }

        try {
            const [templates, total] = await Promise.all([
                db.agentTemplate.findMany({
                    where: whereClause,
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                fields: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        client: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        _count: {
                            select: {
                                agentes: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                db.agentTemplate.count({ where: whereClause })
            ]);

            return {
                templates,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            console.error('Error al obtener los templates:', error);
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los templates' 
            });
        }
    }),

    // Crear template de agente
    createTemplate: protectedProcedure
    .input(CreateAgentTemplateSchema)
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);
        try {
            // Validar que el cliente existe si no es global
            if (!input.isGlobal && input.clientId) {
                const client = await db.client.findUnique({ where: { id: input.clientId } });
                if (!client) {
                    throw new TRPCError({ 
                        code: 'NOT_FOUND', 
                        message: 'Cliente no encontrado' 
                    });
                }
            }

            // Transacción optimizada: crear template, steps y fields
            const result = await db.$transaction(async (tx) => {
                const template = await tx.agentTemplate.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        category: input.category,
                        isActive: input.isActive,
                        isGlobal: input.isGlobal,
                        clientId: input.isGlobal ? null : input.clientId
                    }
                });

                // Crear steps y fields optimizados para grandes volúmenes
                if (input.steps && input.steps.length > 0) {
                    // Crear todos los steps primero
                    const createdSteps = await Promise.all(
                        input.steps.map(stepData =>
                            tx.agentTemplateStep.create({
                                data: {
                                    templateId: template.id,
                                    name: stepData.name,
                                    description: stepData.description,
                                    icon: stepData.icon,
                                    order: stepData.order
                                }
                            })
                        )
                    );

                    // Crear todos los fields en batch
                    const allFields = input.steps.flatMap((stepData, stepIndex) =>
                        stepData.fields?.map((field, fieldIndex) => ({
                            ...field,
                            stepId: createdSteps[stepIndex]?.id ?? '',
                            order: field.order ?? fieldIndex
                        })) ?? []
                    );

                    if (allFields.length > 0) {
                        // Usar createMany para mejor rendimiento con grandes volúmenes
                        await tx.agentField.createMany({
                            data: allFields
                        });
                    }
                }

                // Retornar el template con sus steps y fields
                return tx.agentTemplate.findUnique({
                    where: { id: template.id },
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                fields: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        client: { select: { id: true, name: true } }
                    }
                });
            }, {
                    timeout: 30000 // Aumentar timeout a 30 segundos para grandes volúmenes
                });
            return result;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al crear el template' 
            });
        }
    }),

    // Actualizar template de agente (con actualización anidada de steps y fields)
    updateTemplate: protectedProcedure
    .input(UpdateAgentTemplateSchema)
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);
        const { id, steps, ...data } = input;
        try {
            // Validar que el template existe
            const existingTemplate = await db.agentTemplate.findUnique({ where: { id } });
            if (!existingTemplate) {
                throw new TRPCError({ 
                    code: 'NOT_FOUND', 
                    message: 'Template no encontrado' 
                });
            }
            // Validar que el cliente existe si se está actualizando
            if (data.clientId && !data.isGlobal) {
                const client = await db.client.findUnique({ where: { id: data.clientId } });
                if (!client) {
                    throw new TRPCError({ 
                        code: 'NOT_FOUND', 
                        message: 'Cliente no encontrado' 
                    });
                }
            }

            // Si no se pasan steps, solo actualiza el template
            if (!steps) {
                const template = await db.agentTemplate.update({
                    where: { id },
                    data: {
                        ...data,
                        clientId: data.isGlobal ? null : data.clientId
                    },
                    include: {
                        steps: {
                            orderBy: { order: 'asc' },
                            include: {
                                fields: {
                                    orderBy: { order: 'asc' }
                                }
                            }
                        },
                        client: { select: { id: true, name: true } }
                    }
                });
                return template;
            }

            // --- Sincronización optimizada para grandes volúmenes ---
            await db.$transaction(async (tx) => {
                // 1. Actualizar el template
                await tx.agentTemplate.update({
                    where: { id },
                    data: {
                        ...data,
                        clientId: data.isGlobal ? null : data.clientId
                    }
                });

                // 2. Eliminar todos los fields y steps existentes en batch
                await tx.agentField.deleteMany({ 
                    where: { 
                        step: { templateId: id } 
                    } 
                });
                await tx.agentTemplateStep.deleteMany({ where: { templateId: id } });

                // 3. Crear nuevos steps y fields en batch
                if (steps && steps.length > 0) {
                    // Crear todos los steps primero
                    const createdSteps = await Promise.all(
                        steps.map(stepData =>
                            tx.agentTemplateStep.create({
                                data: {
                                    templateId: id,
                                    name: stepData.name,
                                    description: stepData.description,
                                    icon: stepData.icon,
                                    order: stepData.order
                                }
                            })
                        )
                    );

                    // Crear todos los fields en batch
                    const allFields = steps.flatMap((stepData, stepIndex) =>
                        stepData.fields?.map((field, fieldIndex) => ({
                            ...field,
                            stepId: createdSteps[stepIndex]?.id ?? '',
                            order: field.order ?? fieldIndex
                        })) ?? []
                    );

                    if (allFields.length > 0) {
                        // Usar createMany para mejor rendimiento con grandes volúmenes
                        await tx.agentField.createMany({
                            data: allFields
                        });
                    }
                }
            }, {
                    timeout: 30000 // Aumentar timeout a 30 segundos para grandes volúmenes
                });

            // Retornar el template actualizado con sus steps y fields
            const result = await db.agentTemplate.findUnique({
                where: { id },
                include: {
                    steps: {
                        orderBy: { order: 'asc' },
                        include: {
                            fields: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    },
                    client: { select: { id: true, name: true } }
                }
            });
            return result;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar el template' 
            });
        }
    }),

    // ================= USUARIOS =================

    // Obtener usuarios
    getUsers: protectedProcedure
    .input(z.object({
        search: z.string().optional(),
        type: z.enum(["AURELIA", "ADMIN", "CUSTOMER"]).optional(),
        active: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0)
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        const whereClause: {
            OR?: Array<{
                name?: { contains: string; mode: 'insensitive' };
                email?: { contains: string; mode: 'insensitive' };
            }>;
            type?: 'AURELIA' | 'ADMIN' | 'CUSTOMER';
            active?: boolean;
        } = {};

        if (input.search) {
            whereClause.OR = [
                { name: { contains: input.search, mode: 'insensitive' } },
                { email: { contains: input.search, mode: 'insensitive' } }
            ];
        }

        if (input.type) {
            whereClause.type = input.type;
        }

        if (input.active !== undefined) {
            whereClause.active = input.active;
        }

        try {
            const [users, total] = await Promise.all([
                db.user.findMany({
                    where: whereClause,
                    include: {
                        client: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: input.limit,
                    skip: input.offset
                }),
                db.user.count({ where: whereClause })
            ]);

            return {
                users,
                pagination: {
                    total,
                    limit: input.limit,
                    offset: input.offset,
                    hasMore: input.offset + input.limit < total
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener los usuarios' 
            });
        }
    }),

  // Obtener usuario por ID
  getUserById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      superadminMiddleware(ctx);

      try {
        const user = await db.user.findUnique({
          where: { id: input.id },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                status: {
                  select: { name: true }
                },
                plan: {
                  select: { name: true }
                }
              }
            }
          }
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado"
          });
        }

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el usuario"
        });
      }
    }),

  // Obtener estadísticas de usuarios
  getUserStats: protectedProcedure
    .query(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            const [totalUsers, activeUsers, adminUsers, customerUsers] = await Promise.all([
                db.user.count(),
                db.user.count({ where: { active: true } }),
                db.user.count({ where: { type: 'ADMIN' } }),
                db.user.count({ where: { type: 'CUSTOMER' } })
            ]);

            return {
                totalUsers,
                activeUsers,
                adminUsers,
                customerUsers
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener estadísticas de usuarios' 
            });
        }
    }),

    // ================= CONFIGURACIÓN DEL SISTEMA =================

    // Obtener configuración del sistema
    getSystemConfig: protectedProcedure
    .query(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Por ahora retornamos configuración mock
            // TODO: Implementar tabla de configuración en la base de datos
            return {
                maxClients: 1000,
                maxUsersPerClient: 50,
                maxAgentsPerClient: 20,
                maxContactsPerClient: 1000,
                defaultPlanId: "default-plan-id",
                maintenanceMode: false,
                features: {
                    analytics: true,
                    advancedChat: true,
                    customAgents: true,
                    apiAccess: true
                }
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener la configuración del sistema' 
            });
        }
    }),

    // Actualizar configuración del sistema
    updateSystemConfig: protectedProcedure
    .input(z.object({
        maxClients: z.number().optional(),
        maxUsersPerClient: z.number().optional(),
        maxAgentsPerClient: z.number().optional(),
        maxContactsPerClient: z.number().optional(),
        defaultPlanId: z.string().optional(),
        maintenanceMode: z.boolean().optional(),
        features: z.object({
            analytics: z.boolean().optional(),
            advancedChat: z.boolean().optional(),
            customAgents: z.boolean().optional(),
            apiAccess: z.boolean().optional()
        }).optional()
    }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);

        try {
            // TODO: Implementar actualización en la base de datos
            console.log("Actualizando configuración del sistema:", input);

            return {
                success: true,
                message: "Configuración actualizada correctamente"
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al actualizar la configuración del sistema' 
            });
        }
    }),

    // Obtener estadísticas del sistema
    getSystemStats: protectedProcedure
    .query(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            const [
                totalClients,
                activeClients,
                totalUsers,
                activeUsers,
                totalAgentes,
                activeAgentes,
                totalConversations,
                conversationsThisMonth
            ] = await Promise.all([
                    db.client.count(),
                    db.client.count({ where: { status: { name: { contains: "activo", mode: "insensitive" } } } }),
                    db.user.count(),
                    db.user.count({ where: { active: true } }),
                    db.agente.count(),
                    db.agente.count({ where: { isActive: true } }),
                    db.conversation.count(),
                    db.conversation.count({
                        where: {
                            createdAt: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                            }
                        }
                    })
                ]);

            return {
                totalClients,
                activeClients,
                totalUsers,
                activeUsers,
                totalAgentes,
                activeAgentes,
                totalConversations,
                conversationsThisMonth,
                revenueThisMonth: 0, // TODO: Implementar cálculo de ingresos
                growthRate: 12.5, // TODO: Implementar cálculo de crecimiento
                diskUsage: 65, // TODO: Implementar cálculo real de uso de disco
                diskUsed: 650, // TODO: Implementar cálculo real de disco usado
                diskTotal: 1000 // TODO: Implementar cálculo real de disco total
            };
        } catch (error) {
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al obtener las estadísticas del sistema' 
            });
        }
    }),

    // ================= TEMPLATES DE EJEMPLO =================
    // Crear template global de ejemplo para empresas
    createExampleTemplate: protectedProcedure
    .mutation(async ({ ctx }) => {
        superadminMiddleware(ctx);

        try {
            // Crear template global con steps y campos personalizados para empresas
            const template = await db.agentTemplate.create({ 
                data: { 
                    name: "Template Empresa Global",
                    description: "Template para crear agentes personalizados para empresas",
                    category: "Empresa",
                    isActive: true,
                    isGlobal: true,
                    // clientId: null, // Para templates globales
                    steps: {
                        create: [
                            {
                                name: "Datos de la Empresa",
                                description: "Información básica de la empresa",
                                icon: "building",
                                order: 0,
                                fields: {
                                    create: [
                                        {
                                            name: "nombreEmpresa",
                                            label: "Nombre de la Empresa",
                                            type: "TEXT" as const,
                                            required: true,
                                            options: [],
                                            order: 0,
                                            config: {}
                                        },
                                        {
                                            name: "descripcionEmpresa",
                                            label: "Descripción de la Empresa",
                                            type: "TEXTAREA" as const,
                                            required: true,
                                            options: [],
                                            order: 1,
                                            config: {}
                                        },
                                        {
                                            name: "sector",
                                            label: "Sector de la Empresa",
                                            type: "SELECT" as const,
                                            required: true,
                                            options: ["Tecnología", "Salud", "Educación", "Finanzas", "Retail", "Manufactura", "Servicios", "Otro"],
                                            order: 2,
                                            config: {}
                                        },
                                        {
                                            name: "sitiosWeb",
                                            label: "Sitios Web de la Empresa",
                                            type: "TEXTAREA" as const,
                                            required: false,
                                            options: [],
                                            order: 3,
                                            config: {}
                                        }
                                    ]
                                }
                            },
                            {
                                name: "Configuración del Asistente",
                                description: "Configuración del agente virtual",
                                icon: "user",
                                order: 1,
                                fields: {
                                    create: [
                                        {
                                            name: "nombreAsistente",
                                            label: "Nombre del Asistente",
                                            type: "TEXT" as const,
                                            required: true,
                                            options: [],
                                            order: 0,
                                            config: {}
                                        },
                                        {
                                            name: "objetivo",
                                            label: "Objetivo del Asistente",
                                            type: "TEXTAREA" as const,
                                            required: true,
                                            options: [],
                                            order: 1,
                                            config: {}
                                        },
                                        {
                                            name: "tono",
                                            label: "Tono de Comunicación",
                                            type: "SELECT" as const,
                                            required: true,
                                            options: ["Formal", "Informal", "Amigable", "Profesional", "Casual"],
                                            order: 2,
                                            config: {}
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                include: {
                    steps: {
                        include: {
                            fields: true
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            return template;
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ 
                code: 'INTERNAL_SERVER_ERROR', 
                message: 'Error al crear el template de ejemplo' 
            });
        }
    }),

    // ================= ELIMINACIÓN COMPLETA DE CLIENTES =================
    // Eliminar cliente completamente con todos sus datos relacionados
    deleteClientCompletely: protectedProcedure
    .input(z.object({
        clientId: z.string().uuid("ID de cliente inválido"),
        confirmDeletion: z.boolean().default(false),
        backupBeforeDelete: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
        superadminMiddleware(ctx);
        
        const { clientId, confirmDeletion, backupBeforeDelete } = input;
        
        // Validación crítica: confirmación requerida
        if (!confirmDeletion) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Se requiere confirmación explícita para eliminar un cliente'
            });
        }
        
        try {
            // 1. Verificar que el cliente existe y obtener información completa
            const client = await db.client.findUnique({
                where: { id: clientId },
                include: {
                    status: true,
                    plan: true,
                    integrations: {
                        include: {
                            evolutionApi: {
                                include: {
                                    instances: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            users: true,
                            contacts: true,
                            agentes: true,
                            conversations: true,
                            integrations: true,
                            pipelines: true,
                            opportunities: true,
                            auditLogs: true,
                            notifications: true,
                            roles: true,
                            playgroundSessions: true,
                            agentTemplates: true
                        }
                    }
                }
            });

            if (!client) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Cliente no encontrado'
                });
            }

            // 2. Validaciones adicionales de seguridad
            await validateClientDeletion(client);

            // 3. Crear registro de auditoría antes de la eliminación
            const auditLog = await db.auditLog.create({
                data: {
                    clientId: clientId,
                    userId: ctx.session.user.id,
                    action: 'CLIENT_DELETE_INITIATED',
                    entityType: 'CLIENT',
                    entityId: clientId,
                    metadata: {
                        clientName: client.name,
                        deletionStats: {
                            users: client._count.users,
                            contacts: client._count.contacts,
                            agentes: client._count.agentes,
                            conversations: client._count.conversations,
                            integrations: client._count.integrations,
                            pipelines: client._count.pipelines,
                            opportunities: client._count.opportunities,
                            auditLogs: client._count.auditLogs,
                            notifications: client._count.notifications,
                            roles: client._count.roles,
                            playgroundSessions: client._count.playgroundSessions,
                            agentTemplates: client._count.agentTemplates
                        },
                        backupRequested: backupBeforeDelete,
                        deletedBy: ctx.session.user.email || ctx.session.user.id
                    }
                }
            });

            // 4. Obtener estadísticas para el reporte de eliminación
            const deletionStats = {
                users: client._count.users,
                contacts: client._count.contacts,
                agentes: client._count.agentes,
                conversations: client._count.conversations,
                integrations: client._count.integrations,
                pipelines: client._count.pipelines,
                opportunities: client._count.opportunities,
                auditLogs: client._count.auditLogs,
                notifications: client._count.notifications,
                roles: client._count.roles,
                playgroundSessions: client._count.playgroundSessions,
                agentTemplates: client._count.agentTemplates
            };

             // 5. Realizar eliminación en cascada usando transacción
             const result = await db.$transaction(async (tx) => {
                 // 5.1. Detener recursos externos (contenedores Docker, etc.)
                 await stopExternalResources(client, tx);

                 // 5.2. Eliminar el cliente - esto activará todas las eliminaciones en cascada
                 await tx.client.delete({
                     where: { id: clientId }
                 });

                 return {
                     success: true,
                     message: `Cliente "${client.name}" eliminado exitosamente`,
                     deletedData: deletionStats,
                     totalDeletedRecords: Object.values(deletionStats).reduce((sum, count) => sum + count, 0) + 1,
                     auditLogId: auditLog.id
                 };
             }, {
                 timeout: 120000 // 2 minutos de timeout para operaciones grandes
             });

             // 6. Crear registro de auditoría de finalización DESPUÉS de la transacción
             // (Para mantener el registro sin clientId)
             const completedMetadata = {
                 clientName: client.name,
                 clientId: clientId, // Guardamos el ID para referencia futura
                 deletionStats: deletionStats,
                 backupRequested: backupBeforeDelete,
                 deletedBy: ctx.session.user.email || ctx.session.user.id,
                 completedAt: new Date().toISOString(),
                 totalRecordsDeleted: Object.values(deletionStats).reduce((sum, count) => sum + count, 0) + 1,
                 originalAuditLogId: auditLog.id,
                 // Información para posible recuperación futura
                 recoveryInfo: {
                     clientEmail: client.email,
                     clientDescription: client.description,
                     clientStatus: client.status?.name,
                     clientPlan: client.plan?.name,
                     createdAt: client.createdAt,
                     deletedAt: new Date().toISOString()
                 }
             };

             // Crear registro de auditoría de finalización (sin clientId para que persista)
             const completionAuditLog = await db.auditLog.create({
                 data: {
                     userId: ctx.session.user.id,
                     action: 'CLIENT_DELETE_COMPLETED',
                     entityType: 'CLIENT',
                     entityId: clientId,
                     metadata: completedMetadata
                 }
             });

             // Actualizar el resultado con el ID del log de finalización
             result.completionAuditLogId = completionAuditLog.id;

            return result;

        } catch (error) {
            console.error('Error eliminando cliente:', error);
            
            // Crear registro de auditoría para el error
            try {
                await db.auditLog.create({
                    data: {
                        clientId: clientId,
                        userId: ctx.session.user.id,
                        action: 'CLIENT_DELETE_FAILED',
                        entityType: 'CLIENT',
                        entityId: clientId,
                        metadata: {
                            error: error instanceof Error ? error.message : 'Error desconocido',
                            stack: error instanceof Error ? error.stack : undefined,
                            deletedBy: ctx.session.user.email || ctx.session.user.id
                        }
                    }
                });
            } catch (auditError) {
                console.error('Error creando audit log:', auditError);
            }
            
            if (error instanceof TRPCError) {
                throw error;
            }

            // Manejo específico de errores de base de datos
            if (error instanceof Error) {
                if (error.message.includes('foreign key constraint')) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'No se puede eliminar el cliente debido a restricciones de integridad referencial'
                    });
                }
                
                if (error.message.includes('timeout')) {
                    throw new TRPCError({
                        code: 'TIMEOUT',
                        message: 'La operación de eliminación tardó demasiado tiempo. Intente nuevamente.'
                    });
                }
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Error interno del servidor al eliminar el cliente'
            });
        }
    }),

    // Obtener información detallada del cliente para confirmación de eliminación
    getClientDeletionInfo: protectedProcedure
    .input(z.object({
        clientId: z.string().uuid("ID de cliente inválido")
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);
        
        const { clientId } = input;
        
        try {
            const client = await db.client.findUnique({
                where: { id: clientId },
                include: {
                    status: true,
                    plan: true,
                    integrations: {
                        include: {
                            evolutionApi: {
                                include: {
                                    instances: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            users: true,
                            contacts: true,
                            agentes: true,
                            conversations: true,
                            integrations: true,
                            pipelines: true,
                            opportunities: true,
                            auditLogs: true,
                            notifications: true,
                            roles: true,
                            playgroundSessions: true,
                            agentTemplates: true
                        }
                    }
                }
            });

            if (!client) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Cliente no encontrado'
                });
            }

            // Validar si se puede eliminar
            const validationResult = await validateClientDeletionForInfo(client);

            return {
                client: {
                    id: client.id,
                    name: client.name,
                    description: client.description,
                    email: client.email,
                    status: client.status,
                    plan: client.plan,
                    createdAt: client.createdAt
                },
                dataCounts: client._count,
                totalRecords: Object.values(client._count).reduce((sum, count) => sum + count, 0) + 1,
                validation: validationResult,
                canDelete: validationResult.canDelete,
                warnings: validationResult.warnings,
                errors: validationResult.errors
            };

        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }

            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Error al obtener información del cliente'
            });
        }
    }),

    // Validar si un cliente puede ser eliminado (sin lanzar errores)
    validateClientDeletion: protectedProcedure
    .input(z.object({
        clientId: z.string().uuid("ID de cliente inválido")
    }))
    .query(async ({ input, ctx }) => {
        superadminMiddleware(ctx);
        
        const { clientId } = input;
        
        try {
            const client = await db.client.findUnique({
                where: { id: clientId },
                include: {
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
            });

            if (!client) {
                return {
                    canDelete: false,
                    errors: ['Cliente no encontrado'],
                    warnings: []
                };
            }

            return await validateClientDeletionForInfo(client);

        } catch (error) {
            return {
                canDelete: false,
                errors: ['Error al validar cliente'],
                warnings: []
            };
        }
    }),

    // Obtener estadísticas de eliminación de clientes (para dashboard)
    getClientDeletionStats: protectedProcedure
    .query(async ({ ctx }) => {
        superadminMiddleware(ctx);
        
        try {
            const totalClients = await db.client.count();
            const recentDeletions = await db.auditLog.count({
                where: {
                    action: 'CLIENT_DELETE_COMPLETED',
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                    }
                }
            });

            const failedDeletions = await db.auditLog.count({
                where: {
                    action: 'CLIENT_DELETE_FAILED',
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                    }
                }
            });

            const clientsWithActiveIntegrations = await db.client.count({
                where: {
                    integrations: {
                        some: {
                            isActive: true,
                            evolutionApi: {
                                instances: {
                                    some: {
                                        status: {
                                            in: ['CONNECTED', 'CONNECTING']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return {
                totalClients,
                recentDeletions,
                failedDeletions,
                clientsWithActiveIntegrations,
                deletionSuccessRate: recentDeletions + failedDeletions > 0 
                    ? Math.round((recentDeletions / (recentDeletions + failedDeletions)) * 100)
                    : 0
            };

        } catch (error) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Error al obtener estadísticas de eliminación'
            });
        }
    }),
});
