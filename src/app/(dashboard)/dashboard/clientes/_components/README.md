# Funcionalidad de Eliminación Completa de Clientes

## Descripción

Esta funcionalidad permite a los superadministradores eliminar completamente un cliente y todos sus datos relacionados desde el dashboard de superadministrador, con una interfaz de usuario robusta que incluye confirmación detallada y progreso visual.

## Características Implementadas

### Backend (tRPC)

1. **`deleteClientCompletely`** - Endpoint principal para eliminación completa
   - Validación de permisos de superadmin
   - Verificación de existencia del cliente
   - Eliminación en cascada usando transacciones
   - Manejo robusto de errores
   - Timeout de 60 segundos para operaciones grandes
   - Retorna estadísticas detalladas de eliminación

2. **`getClientDeletionInfo`** - Endpoint para obtener información previa
   - Información detallada del cliente
   - Conteo de todos los datos relacionados
   - Total de registros que se eliminarán

### Frontend (React/Next.js)

1. **`DeleteClientConfirmationDialog`** - Diálogo de confirmación avanzado
   - Información detallada del cliente
   - Lista completa de datos que se eliminarán
   - Advertencias claras sobre la irreversibilidad
   - Diseño responsive y accesible

2. **`DeleteProgressDialog`** - Diálogo de progreso visual
   - Simulación de progreso paso a paso
   - Indicadores visuales de estado
   - Barra de progreso animada
   - Manejo de errores en tiempo real

3. **`ClientCard`** - Tarjeta de cliente actualizada
   - Menú desplegable con opciones
   - Botón de eliminación integrado
   - Callback para actualizar la lista

4. **`DeletionStatsCard`** - Componente de estadísticas
   - Resumen visual de datos a eliminar
   - Indicadores de estado de eliminación
   - Diseño adaptable

5. **`useDeleteClient`** - Hook personalizado
   - Manejo centralizado de estado
   - Integración con tRPC
   - Notificaciones automáticas

## Flujo de Eliminación

1. **Inicio**: Usuario hace clic en "Eliminar cliente" desde el menú de la tarjeta
2. **Confirmación**: Se muestra diálogo con información detallada del cliente
3. **Validación**: Usuario confirma la eliminación después de revisar los datos
4. **Progreso**: Se muestra diálogo de progreso con simulación paso a paso
5. **Eliminación**: Backend ejecuta eliminación en cascada usando transacciones
6. **Finalización**: Se muestra notificación de éxito y se actualiza la lista

## Datos que se Eliminan

La eliminación en cascada incluye:

- **Usuarios** - Todos los usuarios del cliente
- **Contactos** - Base de datos de contactos y leads
- **Agentes** - Agentes de IA configurados
- **Conversaciones** - Historial completo de conversaciones
- **Integraciones** - Configuraciones de integraciones (WhatsApp, etc.)
- **Pipelines** - Pipelines de ventas y procesos
- **Oportunidades** - Oportunidades de negocio registradas
- **Auditoría** - Registros de auditoría y actividad
- **Notificaciones** - Notificaciones y alertas
- **Roles** - Roles y permisos personalizados
- **Sesiones de Playground** - Sesiones de prueba de agentes
- **Templates de Agentes** - Templates de configuración

## Seguridad

- **Validación de permisos**: Solo superadmins pueden acceder
- **Transacciones**: Operaciones atómicas para garantizar consistencia
- **Timeouts**: Prevención de operaciones colgadas
- **Manejo de errores**: Errores específicos y recuperables
- **Confirmación múltiple**: Doble confirmación antes de eliminar

## Manejo de Errores

- **Cliente no encontrado**: Error 404 con mensaje claro
- **Restricciones de integridad**: Error 409 con explicación
- **Timeout**: Error específico con sugerencia de reintento
- **Errores de servidor**: Error 500 con logging detallado

## Notificaciones

- **Éxito**: Toast con estadísticas de eliminación
- **Error**: Toast con mensaje de error específico
- **Progreso**: Indicadores visuales en tiempo real

## Archivos Modificados/Creados

### Backend
- `src/server/api/routers/superadmin.ts` - Endpoints agregados

### Frontend
- `src/app/(dashboard)/dashboard/clientes/_components/DeleteClientConfirmationDialog.tsx` - Nuevo
- `src/app/(dashboard)/dashboard/clientes/_components/DeleteProgressDialog.tsx` - Nuevo
- `src/app/(dashboard)/dashboard/clientes/_components/DeletionStatsCard.tsx` - Nuevo
- `src/app/(dashboard)/dashboard/clientes/_components/hooks/use-delete-client.ts` - Nuevo
- `src/app/(dashboard)/dashboard/clientes/_components/ClientCard.tsx` - Modificado
- `src/app/(dashboard)/dashboard/clientes/_components/index.ts` - Nuevo
- `src/app/(dashboard)/dashboard/clientes/page.tsx` - Modificado

## Uso

1. Navegar a `/dashboard/clientes`
2. Hacer clic en el menú de tres puntos de cualquier cliente
3. Seleccionar "Eliminar cliente"
4. Revisar la información detallada
5. Confirmar la eliminación
6. Observar el progreso de eliminación
7. Confirmar la finalización exitosa

## Consideraciones Técnicas

- **Performance**: Operaciones optimizadas con transacciones
- **UX**: Interfaz intuitiva con feedback visual constante
- **Escalabilidad**: Manejo de grandes volúmenes de datos
- **Mantenibilidad**: Código modular y bien documentado
- **Accesibilidad**: Componentes accesibles y responsive
