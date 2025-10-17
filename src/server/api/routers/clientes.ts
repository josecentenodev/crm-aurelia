import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { db } from "@/server/db";
import {
    ClientSchema,
    CreateClientSchema,
    UpdateClientSchema,
    ClientStatusSchema,
    ClientPlanSchema,
} from "@/domain/Clientes";
import { TRPCError } from "@trpc/server";
import { AiInfo } from "@/lib/openai";


export const clientesRouter = createTRPCRouter({
    // Obtener datos del cliente actual (por sesión)
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
        const clientId = ctx.session.user.clientId;
        if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        const client = await db.client.findUnique({
            where: { id: clientId },
            include: { status: true, plan: true }
        });
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" });
        return client;
    }),

    // Crear un nuevo cliente
    create: protectedProcedure.input(CreateClientSchema).mutation(async ({ input }) => {
        try {
            // Transformar settings null a undefined para Prisma
            const data = {
                ...input,
                settings: input.settings ?? undefined,
            };
            const client = await db.client.create({ data });
            return client;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el cliente" });
        }
    }),

    // Actualizar datos del cliente actual
    updateCurrent: protectedProcedure.input(UpdateClientSchema).mutation(async ({ input, ctx }) => {
        const clientId = ctx.session.user.clientId;
        if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "Usuario sin cliente asignado" });
        try {
            // Solo enviar statusId y planId si están presentes
            const { statusId, planId, settings, ...rest } = input;
            const data: Record<string, unknown> = { ...rest };
            if (statusId !== undefined) data.statusId = statusId;
            if (planId !== undefined) data.planId = planId;
            if (settings !== undefined && settings !== null) data.settings = settings;
            const client = await db.client.update({
                where: { id: clientId },
                data
            });
            return client;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el cliente" });
        }
    }),

    // =================== STATUS ===================
    getStatuses: protectedProcedure.query(async () => {
        try {
            const statuses = await db.clientStatus.findMany();
            return statuses;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener los estados de cliente" });
        }
    }),
    createStatus: protectedProcedure.input(ClientStatusSchema.omit({ id: true, createdAt: true, updatedAt: true })).mutation(async ({ input }) => {
        try {
            const status = await db.clientStatus.create({ data: input });
            return status;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el estado de cliente" });
        }
    }),
    updateStatus: protectedProcedure.input(ClientStatusSchema.pick({ id: true }).extend({ name: z.string().optional(), description: z.string().optional() })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        try {
            const status = await db.clientStatus.update({ where: { id }, data });
            return status;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el estado de cliente" });
        }
    }),
    deleteStatus: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
        try {
            await db.clientStatus.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el estado de cliente" });
        }
    }),

    // =================== PLANES ===================
    getPlans: protectedProcedure.query(async () => {
        try {
            const plans = await db.clientPlan.findMany();
            return plans;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al obtener los planes de cliente" });
        }
    }),
    createPlan: protectedProcedure.input(ClientPlanSchema.omit({ id: true, createdAt: true, updatedAt: true })).mutation(async ({ input }) => {
        try {
            const plan = await db.clientPlan.create({ data: input });
            return plan;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al crear el plan de cliente" });
        }
    }),
    updatePlan: protectedProcedure.input(ClientPlanSchema.pick({ id: true }).extend({ name: z.string().optional(), description: z.string().optional() })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        try {
            const plan = await db.clientPlan.update({ where: { id }, data });
            return plan;
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el plan de cliente" });
        }
    }),
    deletePlan: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
        try {
            await db.clientPlan.delete({ where: { id: input.id } });
            return { success: true };
        } catch (error: unknown) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al eliminar el plan de cliente" });
        }
    }),

    // Listar todos los clientes (solo id y name) para superadmin
    listAllMinimal: protectedProcedure.query(async () => {
        const clients = await db.client.findMany({ select: { id: true, name: true } })
        return clients
    }),

    // Listar todos los clientes con información completa (para superadmin)
    list: protectedProcedure.query(async ({ ctx }) => {
        try {
            // Verificar que el usuario sea AURELIA
            if (ctx.session.user.type !== "AURELIA") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Solo usuarios AURELIA pueden acceder a esta información"
                });
            }

            const clients = await db.client.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    email: true,
                    status: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    plan: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { name: "asc" }
            });

            return { clients };
        } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error al obtener la lista de clientes"
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
    getAiInfo: protectedProcedure.query(async ({ctx}) => {
        const clientId = ctx.session.user.clientId;
        if (!clientId) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Usuario sin cliente asignado"
            });
        }
        try {
            const aiInfo = await AiInfo.get(clientId);
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
    updateAiInfo: protectedProcedure.mutation(async ({ctx}) => {
        const  clientId = ctx.session.user.clientId;
        if (!clientId) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Usuario sin cliente asignado"
            });
        }
        try {
            return await AiInfo.update(clientId);
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
        z.object({aiInfoId: z.string()})
    ).mutation(async ({input}) => {
        const  clientId = ctx.session.user.clientId;
        if (!clientId) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Usuario sin cliente asignado"
            });
        }
        try {
            await AiInfo.delete(clientId, input.aiInfoId);
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

    // ================= MÉTRICAS DEL CLIENTE =================

    // Obtener métricas generales del cliente
    getClientMetrics: protectedProcedure
    .input(z.object({
        clientId: z.string(),
        period: z.enum(["7d", "30d", "90d"]).default("30d")
    }))
    .query(async ({ input, ctx }) => {
        const { clientId, period } = input

        // Verificar que el usuario tenga acceso al cliente
        const client = await ctx.db.client.findFirst({
            where: { id: clientId },
            include: {
                users: {
                    where: { id: ctx.session.user.id }
                }
            }
        })

        if (!client) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Cliente no encontrado"
            })
        }

        // Calcular fechas para el período
        const now = new Date()
        const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90
        const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
        const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

        // Obtener métricas de conversaciones
        const [currentConversations, previousConversations] = await Promise.all([
            ctx.db.conversation.count({
                where: {
                    clientId,
                    createdAt: { gte: startDate }
                }
            }),
            ctx.db.conversation.count({
                where: {
                    clientId,
                    createdAt: { gte: previousStartDate, lt: startDate }
                }
            })
        ])

        // Estadísticas de conversaciones
        const [activeConversations, completedConversations, pendingConversations] = await Promise.all([
            ctx.db.conversation.count({
                where: {
                    clientId: input.clientId,
                    status: "ACTIVA"
                }
            }),
            ctx.db.conversation.count({
                where: {
                    clientId: input.clientId,
                    status: "FINALIZADA"
                }
            }),
            ctx.db.conversation.count({
                where: {
                    clientId: input.clientId,
                    status: "PAUSADA"
                }
            })
        ])

        // Estadísticas de contactos (período actual y anterior para crecimiento)
        const [
            newContacts,
            qualifiedContacts,
            convertedContacts,
            currentContacts,
            previousContacts
        ] = await Promise.all([
                ctx.db.contact.count({
                    where: {
                        clientId: input.clientId,
                        status: "NUEVO"
                    }
                }),
                ctx.db.contact.count({
                    where: {
                        clientId: input.clientId,
                        status: "CALIFICADO"
                    }
                }),
                ctx.db.contact.count({
                    where: {
                        clientId: input.clientId,
                        status: "CLIENTE"
                    }
                }),
                ctx.db.contact.count({
                    where: {
                        clientId,
                        createdAt: { gte: startDate }
                    }
                }),
                ctx.db.contact.count({
                    where: {
                        clientId,
                        createdAt: { gte: previousStartDate, lt: startDate }
                    }
                })
            ])


        const conversionRate = convertedContacts > 0 ? (convertedContacts / (newContacts + qualifiedContacts + convertedContacts)) * 100 : 0

        // Calcular crecimiento
        const conversationsGrowth = previousConversations > 0 
            ? ((currentConversations - previousConversations) / previousConversations) * 100 
            : 0

        const contactsGrowth = previousContacts > 0 
            ? ((currentContacts - previousContacts) / previousContacts) * 100 
            : 0

        return {
            conversations: {
                total: currentConversations,
                active: activeConversations,
                completed: completedConversations,
                pending: pendingConversations,
                growth: Math.round(conversationsGrowth * 10) / 10
            },
            contacts: {
                total: currentContacts,
                new: newContacts,
                qualified: qualifiedContacts,
                converted: convertedContacts,
                growth: Math.round(contactsGrowth * 10) / 10
            },
            performance: {
                // Placeholder seguro hasta implementar cálculo real
                avgResponseTime: "N/A",
                satisfactionRate: 4.2, // TODO: Implementar cálculo real
                conversionRate: Math.round(conversionRate * 10) / 10
            }
        }
    }),

    // Obtener métricas detalladas por período
    getClientDetailedMetrics: protectedProcedure
    .input(z.object({
        clientId: z.string(),
        metric: z.enum(["conversations", "contacts", "messages"]),
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
        groupBy: z.enum(["day", "week", "month"]).default("day")
    }))
    .query(async ({ input, ctx }) => {
        const { clientId, metric, period, groupBy } = input

        // Verificar acceso al cliente
        const client = await ctx.db.client.findFirst({
            where: { id: clientId },
            include: {
                users: {
                    where: { id: ctx.session.user.id }
                }
            }
        })

        if (!client) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Cliente no encontrado"
            })
        }

        // Calcular fechas
        const now = new Date()
        const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90
        const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

        let data: Array<{ date: string; count: number }> = []

        if (metric === "conversations") {
            data = await ctx.db.$queryRaw`
SELECT 
DATE(created_at) as date,
COUNT(*) as count
FROM conversations 
WHERE client_id = ${clientId} 
AND created_at >= ${startDate}
GROUP BY DATE(created_at)
ORDER BY date
`
        } else if (metric === "contacts") {
            data = await ctx.db.$queryRaw`
SELECT 
DATE(created_at) as date,
COUNT(*) as count
FROM contacts 
WHERE client_id = ${clientId} 
AND created_at >= ${startDate}
GROUP BY DATE(created_at)
ORDER BY date
`
        } else if (metric === "messages") {
            data = await ctx.db.$queryRaw`
SELECT 
DATE(m.created_at) as date,
COUNT(*) as count
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE c.client_id = ${clientId} 
AND m.created_at >= ${startDate}
GROUP BY DATE(m.created_at)
ORDER BY date
`
        }

        return {
            metric,
            period,
            groupBy,
            data: data.map(item => ({
                date: item.date,
                count: Number(item.count)
            }))
        }
    }),

    // Obtener un cliente por ID
    getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
        const client = await ctx.db.client.findUnique({
            where: { id: input.id },
            include: { status: true, plan: true }
        });
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente no encontrado" });
        return client;
    }),
});
