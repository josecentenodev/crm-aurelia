import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TrialRegistrationSchema } from "@/domain/Clientes";
import { AiInfo } from "@/lib/openai";

// Schemas de validación
const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  clientId: z.string().uuid().optional(), // Opcional para superadmin
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export const loginRouter = createTRPCRouter({
  // Login de usuario
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, password } = input;

        // Buscar usuario por email
        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
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
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas"
          });
        }

        // Verificar si el usuario está activo
        if (!user.active) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Tu cuenta ha sido desactivada. Contacta al administrador."
          });
        }

        // Verificar si el cliente está activo (si aplica)
        if (user.client && user.client.status.name !== "ACTIVO") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Tu cliente ha sido desactivado. Contacta al administrador."
          });
        }

        // Verificar contraseña
        if (!user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas"
          });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas"
          });
        }

        // Retornar información del usuario (sin contraseña)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          clientId: user.clientId,
          client: user.client,
          image: user.image
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error durante el inicio de sesión"
        });
      }
    }),

  // Registro de usuario (solo para superadmin)
  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, email, password, clientId } = input;

        // Verificar si el email ya existe
        const existingUser = await db.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "El email ya está registrado"
          });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Preparar datos del usuario
        const userData: Prisma.UserCreateInput = {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          type: "CUSTOMER", // Por defecto
          active: true
        };

        // Si se especifica clientId, verificar que existe
        if (clientId) {
          const client = await db.client.findUnique({
            where: { id: clientId }
          });

          if (!client) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "El cliente especificado no existe"
            });
          }

          userData.client = { connect: { id: clientId } };
        }

        const user = await db.user.create({
          data: userData,
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        // Retornar usuario sin contraseña
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "El email ya está registrado"
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al registrar el usuario"
        });
      }
    }),

  // Solicitar restablecimiento de contraseña
  forgotPassword: publicProcedure
    .input(ForgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const { email } = input;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (!user) {
          // Por seguridad, no revelar si el email existe o no
          return { success: true, message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" };
        }

        // TODO: Implementar envío de email con token de restablecimiento
        // Por ahora, solo retornamos éxito
        console.log(`Password reset requested for: ${email}`);

        return { 
          success: true, 
          message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña" 
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al procesar la solicitud"
        });
      }
    }),

  // Restablecer contraseña con token
  resetPassword: publicProcedure
    .input(ResetPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        const { token, newPassword } = input;

        // TODO: Implementar validación de token y restablecimiento
        // Por ahora, solo retornamos éxito
        console.log(`Password reset with token: ${token}`);

        return { success: true, message: "Contraseña restablecida exitosamente" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al restablecer la contraseña"
        });
      }
    }),

  // Registro de prueba gratuita (cliente + usuario admin)
  registerTrial: publicProcedure
    .input(TrialRegistrationSchema)
    .mutation(async ({ input }) => {
      try {
        const {
          clientName,
          clientDescription,
          clientEmail,
          clientAddress,
          clientCity,
          clientCountry,
          userName,
          userEmail,
          userPassword
        } = input;

        // Verificar si el email del usuario ya existe
        const existingUser = await db.user.findUnique({
          where: { email: userEmail.toLowerCase() }
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "El email ya está registrado"
          });
        }

        // Obtener el plan de prueba gratuita
        const trialPlan = await db.clientPlan.findFirst({
          where: { name: "Starter" }
        });

        if (!trialPlan) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Plan de prueba gratuita no configurado. Contacte al administrador."
          });
        }

        // Obtener el estado activo
        const activeStatus = await db.clientStatus.findFirst({
          where: { name: "Activo" }
        });

        if (!activeStatus) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Estado activo no configurado. Contacte al administrador."
          });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(userPassword, 12);

        // Crear cliente y usuario en una transacción
        const result = await db.$transaction(async (tx) => {
          // Crear el cliente
          const client = await tx.client.create({
            data: {
              name: clientName,
              description: clientDescription,
              email: clientEmail,
              address: clientAddress,
              city: clientCity,
              country: clientCountry,
              statusId: activeStatus.id,
              planId: trialPlan.id
            }
          });

          // Crear el usuario admin
          const user = await tx.user.create({
            data: {
              name: userName,
              email: userEmail.toLowerCase(),
              password: hashedPassword,
              type: "ADMIN", // Usuario admin del cliente
              active: true,
              clientId: client.id
            },
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
              active: true,
              clientId: true
            }
          });

          return { client, user };
        });

        //Crear tablaAiInfo 
        //Crear OpenAI Project
        try {
          const client = result.client
          await AiInfo.create(client.id, clientName);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al crear el cliente AI."
          })
        }

        // 🆕 Crear integración Evolution API automáticamente
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
            const deployed = await svc.deployClientContainer(result.client.id);
            
            const containerInfo = {
              containerName: deployed.container_name,
              hostPort: parseInt(deployed.host_port),
              evolutionApiUrl: deployed.evolution_api_url,
              managerUrl: deployed.manager_url
            };

            // Crear la integración en la base de datos
            const integration = await db.$transaction(async (tx) => {
              const clientIntegration = await tx.clientIntegration.create({
                data: {
                  clientId: result.client.id,
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

            integrationResult = integration;
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
              c.name.includes(`evolution_${result.client.id}_`) || 
              c.client_name === result.client.id
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
          client: result.client,
          user: result.user,
          integration: integrationResult,
          integrationStatus,
          integrationError
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la cuenta de prueba gratuita"
        });
      }
    })
});
