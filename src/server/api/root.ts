import { usuariosRouter, contactosRouter, conversacionesRouter, loginRouter, clientesRouter, dashboardClienteRouter, agentesRouter, playgroundRouter, superadminRouter, permisosRouter, integracionesRouter, planesRouter, messagesRouter, pipelinesRouter, oportunidadesRouter, instancesRouter, tareasRouter, notificacionesRouter } from "@/server/api/routers";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  usuarios: usuariosRouter,
  contactos: contactosRouter,
  conversaciones: conversacionesRouter,
  login: loginRouter,
  clientes: clientesRouter,
  dashboardCliente: dashboardClienteRouter,
  agentes: agentesRouter,
  playground: playgroundRouter,
  superadmin: superadminRouter,
  permisos: permisosRouter,
  integraciones: integracionesRouter,
  planes: planesRouter,
  messages: messagesRouter,
  pipelines: pipelinesRouter,
  oportunidades: oportunidadesRouter,
  instances: instancesRouter,
  tareas: tareasRouter,
  notificaciones: notificacionesRouter,
});

/**
 * This is the type-level router export, including the procedure type and the _In and _Out type helpers.
 *
 * If you want to import this type in other files, you can import and re-export it from the tRPC package
 * as it contains the `_RouterInputs` and `_RouterOutputs` type helpers.
 */
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
