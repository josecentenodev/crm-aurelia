// Re-export all domain types and schemas
export * from './Agentes'
export * from './Auditoria'
export * from './Clientes'
export * from './Contactos'
export * from './Conversaciones'
export * from './Leads'
export * from './Mensajes'
export * from './Notificaciones'
export * from './Permisos'
export * from './Superadmin'
export * from './Usuarios'
export * from './Planes'
export * from './Oportunidades'
export * from './Tareas'

// Export Integraciones with specific handling for conflicts
export * from './Integraciones'

// Export Contenedores but exclude conflicting ContainerStatusSchema
export {
  ClientContainerSchema,
  CreateClientContainerSchema,
  UpdateClientContainerSchema
} from './Contenedores'

export type {
  ContainerStatusInfo,
  ContainerStats,
  ContainerFilters,
  ContainerEvent
} from './Contenedores'

// Export Instancias but exclude conflicting InstanceStatusSchema
export {
  CreateInstanceSchema,
  CreateInstanceResponseSchema,
  QRCodeSchema,
  InstanceStatusDataSchema,
  WhatsAppInstanceSchema,
  ClientInstancesResponseSchema,
  InstanceStatsSchema,
  WebhookEventSchema,
  WebhookConfigSchema,
  InstanceFiltersSchema,
  InstancePaginationSchema,
  PaginatedInstancesResponseSchema,
  isInstanceConnected,
  isInstanceCreating,
  isInstanceInError,
  isInstanceDisconnected,
  getInstanceStatusColor,
  getInstanceStatusText,
  getInstanceStatusIcon
} from './Instancias'