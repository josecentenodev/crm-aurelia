import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { db } from "../../db"
import { TaskGroupSchema, TaskSchema, UserPermissionsResponseSchema, type Permission } from "@/domain/Permisos"

export const permisosRouter = createTRPCRouter({
  // TaskGroup CRUD
  listTaskGroups: protectedProcedure.query(async () => {
    return db.taskGroup.findMany()
  }),
  getTaskGroup: protectedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return db.taskGroup.findUnique({ where: { groupId: input } })
  }),
  createTaskGroup: protectedProcedure.input(TaskGroupSchema.omit({ groupId: true })).mutation(async ({ input }) => {
    return db.taskGroup.create({ data: input })
  }),
  updateTaskGroup: protectedProcedure.input(TaskGroupSchema).mutation(async ({ input }) => {
    const { groupId, ...data } = input
    return db.taskGroup.update({ where: { groupId }, data })
  }),
  deleteTaskGroup: protectedProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return db.taskGroup.delete({ where: { groupId: input } })
  }),

  // Task CRUD
  listTasks: protectedProcedure.query(async () => {
    return db.task.findMany()
  }),
  getTask: protectedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return db.task.findUnique({ where: { taskId: input } })
  }),
  createTask: protectedProcedure.input(TaskSchema.omit({ taskId: true })).mutation(async ({ input }) => {
    return db.task.create({ data: input })
  }),
  updateTask: protectedProcedure.input(TaskSchema).mutation(async ({ input }) => {
    const { taskId, ...data } = input
    return db.task.update({ where: { taskId }, data })
  }),
  deleteTask: protectedProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return db.task.delete({ where: { taskId: input } })
  }),

  // --- Roles (por cliente) ---
  listRoles: protectedProcedure.input(z.object({ clientId: z.string().uuid() })).query(async ({ input }) => {
    return db.role.findMany({ where: { clientId: input.clientId } })
  }),
  getRole: protectedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return db.role.findUnique({ where: { roleId: input } })
  }),
  createRole: protectedProcedure.input(z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    clientId: z.string().uuid()
  })).mutation(async ({ input }) => {
    return db.role.create({ data: input })
  }),
  updateRole: protectedProcedure.input(z.object({
    roleId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
  })).mutation(async ({ input }) => {
    const { roleId, ...data } = input
    return db.role.update({ where: { roleId }, data })
  }),
  deleteRole: protectedProcedure.input(z.string().uuid()).mutation(async ({ input }) => {
    return db.role.delete({ where: { roleId: input } })
  }),

  // --- Tasks por rol ---
  listTasksForRole: protectedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return db.taskPerRole.findMany({ where: { roleId: input }, include: { task: true } })
  }),
  assignTasksToRole: protectedProcedure.input(z.object({
    roleId: z.string().uuid(),
    taskIds: z.array(z.string().uuid())
  })).mutation(async ({ input }) => {
    // Borra las asignaciones previas y asigna las nuevas
    await db.taskPerRole.deleteMany({ where: { roleId: input.roleId } })
    return db.taskPerRole.createMany({
      data: input.taskIds.map(taskId => ({ roleId: input.roleId, taskId }))
    })
  }),
  removeTaskFromRole: protectedProcedure.input(z.object({
    roleId: z.string().uuid(),
    taskId: z.string().uuid()
  })).mutation(async ({ input }) => {
    return db.taskPerRole.delete({ where: { roleId_taskId: { roleId: input.roleId, taskId: input.taskId } } })
  }),

  // --- Roles por usuario ---
  listRolesForUser: protectedProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return db.rolPerUser.findMany({ where: { userId: input }, include: { role: true } })
  }),
  assignRoleToUser: protectedProcedure.input(z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid()
  })).mutation(async ({ input }) => {
    return db.rolPerUser.create({ data: input })
  }),
  removeRoleFromUser: protectedProcedure.input(z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid()
  })).mutation(async ({ input }) => {
    return db.rolPerUser.delete({ where: { roleId_userId: { roleId: input.roleId, userId: input.userId } } })
  }),

  // --- Get User Permissions (Optimized) ---
  /**
   * Resolves all permissions for a user by:
   * 1. Finding all roles assigned to the user
   * 2. Resolving TaskPerRole relationships
   * 3. Mapping to { feature, action } structure
   * 4. Deduplicating permissions across multiple roles
   *
   * Uses efficient Prisma queries with include to minimize DB calls
   */
  getUserPermissions: protectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(), // If not provided, uses session user
    }).optional())
    .query(async ({ ctx, input }) => {
      // Use provided userId or fall back to authenticated user
      const userId = input?.userId ?? ctx.session.user.id

      // Get user to verify existence and get clientId
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, clientId: true }
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      // Get all roles for the user with their tasks in a single query
      // This uses Prisma's include to fetch related data efficiently
      const userRoles = await db.rolPerUser.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              taskPerRole: {
                include: {
                  task: {
                    include: {
                      groupTask: true // Include TaskGroup (feature)
                    }
                  }
                }
              }
            }
          }
        }
      })

      // If user has no roles, return empty permissions
      if (userRoles.length === 0) {
        return UserPermissionsResponseSchema.parse({
          userId,
          clientId: user.clientId,
          permissions: []
        })
      }

      // Map and deduplicate permissions
      // Use a Map with composite key to handle duplicates efficiently
      const permissionsMap = new Map<string, Permission>()

      for (const userRole of userRoles) {
        for (const taskPerRole of userRole.role.taskPerRole) {
          const feature = taskPerRole.task.groupTask.name
          const action = taskPerRole.task.name

          // Use composite key for deduplication
          const key = `${feature}:${action}`

          if (!permissionsMap.has(key)) {
            permissionsMap.set(key, {
              feature,
              action
            })
          }
        }
      }

      // Convert Map to array
      const permissions = Array.from(permissionsMap.values())

      return UserPermissionsResponseSchema.parse({
        userId,
        clientId: user.clientId,
        permissions
      })
    }),

  // --- Get User Permissions (Detailed - for debugging/admin) ---
  /**
   * Similar to getUserPermissions but includes metadata about roles,
   * feature descriptions, and action descriptions
   * Useful for admin panels or debugging
   */
  getUserPermissionsDetailed: protectedProcedure
    .input(z.object({
      userId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = input?.userId ?? ctx.session.user.id

      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, clientId: true }
      })

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      const userRoles = await db.rolPerUser.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              taskPerRole: {
                include: {
                  task: {
                    include: {
                      groupTask: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (userRoles.length === 0) {
        return {
          userId,
          clientId: user.clientId,
          roles: [],
          permissions: []
        }
      }

      const detailedPermissions = []

      for (const userRole of userRoles) {
        for (const taskPerRole of userRole.role.taskPerRole) {
          detailedPermissions.push({
            feature: taskPerRole.task.groupTask.name,
            featureDescription: taskPerRole.task.groupTask.description,
            action: taskPerRole.task.name,
            actionDescription: taskPerRole.task.description,
            roleId: userRole.role.roleId,
            roleName: userRole.role.name
          })
        }
      }

      return {
        userId,
        clientId: user.clientId,
        roles: userRoles.map(ur => ({
          roleId: ur.role.roleId,
          name: ur.role.name,
          description: ur.role.description
        })),
        permissions: detailedPermissions
      }
    })
})