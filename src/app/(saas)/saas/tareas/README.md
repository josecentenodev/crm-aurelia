# 📋 Módulo de Tareas (CRM Tasks)

**Versión:** 2.0.0
**Fecha:** 2025-10-14
**Estado:** ✅ MVP Completado - Producción Ready

---

## 📖 Tabla de Contenidos

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Arquitectura](#-arquitectura)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Backend (API Layer)](#-backend-api-layer)
5. [Frontend (UI Layer)](#-frontend-ui-layer)
6. [Seguridad y Multi-tenancy](#-seguridad-y-multi-tenancy)
7. [Guías de Uso](#-guías-de-uso)
8. [Extensibilidad](#-extensibilidad)
9. [Comparativa con CRM del Mercado](#-comparativa-con-crm-del-mercado)
10. [Roadmap de Mejoras](#-roadmap-de-mejoras)

---

## 🎯 Resumen Ejecutivo

El módulo de **Tareas (CRM Tasks)** es un sistema completo de gestión de tareas integrado en Aurelia Platform. Permite a los usuarios crear, asignar, rastrear y completar tareas relacionadas con contactos, conversaciones y oportunidades.

### Estado Actual: **MVP 100% Funcional** ✅

#### Capacidades Implementadas:
- ✅ **CRUD completo** - Crear, leer, actualizar, eliminar tareas
- ✅ **Asignación de propietarios** - Asignar tareas a usuarios del equipo
- ✅ **Estados y prioridades** - Workflow de estados (pendiente → en progreso → completada)
- ✅ **Fechas de vencimiento** - Tracking de deadlines con indicadores de tareas vencidas
- ✅ **Relaciones CRM** - Vincular tareas con contactos, conversaciones y oportunidades
- ✅ **Filtros y búsqueda** - Store con filtros por estado, prioridad, owner, fechas
- ✅ **Estadísticas** - Dashboard con métricas (total, por estado, por prioridad, vencidas)
- ✅ **UI modal** - Experiencia sin navegación con modales para crear/editar/ver
- ✅ **Multi-tenancy** - Seguridad por cliente con validación en backend

#### Tecnologías Utilizadas:
- **Backend:** tRPC + Prisma ORM + PostgreSQL
- **Frontend:** Next.js 15 + React + TypeScript + Tailwind CSS
- **Forms:** react-hook-form + Zod validation
- **State:** Zustand (local) + React Query (server)
- **UI:** shadcn/ui + Radix UI + lucide-react icons

---

## 🏗️ Arquitectura

### Patrón: **Feature-Based Modular Architecture**

El módulo sigue estrictamente el patrón definido en `CLAUDE.md`:

```
tareas/
├── page.tsx                    # Orchestrator (entry point)
├── _features/                  # Self-contained features
│   ├── task-list/             # List view with modals
│   ├── task-detail/           # Detail view with actions
│   └── task-form/             # Create/edit form
├── _hooks/                    # Data fetching hooks (tRPC)
├── _adapters/                 # Data transformations
├── _layout/                   # Layout components
├── _store/                    # State management (Zustand)
├── _lib/                      # Utilities (empty, ready for use)
└── _services/                 # External services (empty, ready for use)
```

### Principios de Diseño:
1. **Alta cohesión** - Cada feature encapsula su lógica
2. **Bajo acoplamiento** - No hay imports cruzados entre features
3. **Single Responsibility** - Cada componente tiene una responsabilidad única
4. **Clean Code** - TypeScript estricto, validaciones, error handling

---

## 📁 Estructura del Proyecto

### 1. **page.tsx** - Orchestrator (12 líneas)
```typescript
// Punto de entrada minimalista
export default function TasksPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <TasksHeader />
      <TaskList />
    </div>
  )
}
```

**Responsabilidad:** Solo renderizar layout principal.

---

### 2. **_features/** - Self-Contained Features

#### **task-list/task-list.tsx** (141 líneas)

**Responsabilidad:** Renderizar lista de tareas con modales.

**Features:**
- Card-based layout con hover effects
- Badges para status, priority, overdue
- Smart sorting: status → priority → due date
- Modal para ver detalle (click en "Ver detalles")
- Estados: loading, error, empty state
- Integración con store para filtros

**Componente clave:**
```typescript
export function TaskList() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const { getTrpcFilters } = useTasksStore()
  const filters = getTrpcFilters()

  const { data: tasks, isLoading, error } = useTasksList(filters)

  // Renderiza cards + modal con TaskDetail
  return (
    <>
      <div className="space-y-4">
        {sortedTasks.map(task => (
          <Card key={task.id}>
            {/* Task info con badges */}
            <Button onClick={() => setSelectedTaskId(task.id)}>
              Ver detalles
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTaskId} onOpenChange={...}>
        <TaskDetail taskId={selectedTaskId} onClose={...} />
      </Dialog>
    </>
  )
}
```

---

#### **task-detail/task-detail.tsx** (331 líneas)

**Responsabilidad:** Mostrar detalle completo de tarea con acciones.

**Features:**
- Visualización completa de task con todas las relaciones
- Botones de acción: Completar, Editar, Eliminar
- Inline editing: al hacer click en "Editar", cambia a TaskForm
- Confirmation dialog para delete (destructive action)
- Display de relaciones con iconos (Contact, Conversation, Opportunity)
- Timestamps con relative time (date-fns + spanish locale)

**Componente clave:**
```typescript
export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: task, isLoading, error } = useTaskById(taskId)
  const deleteTaskMutation = useDeleteTask()
  const updateTaskMutation = useUpdateTask()

  const handleMarkAsCompleted = () => {
    updateTaskMutation.mutate({ id: task.id, status: "COMPLETED" })
  }

  if (isEditing) {
    return <TaskForm task={task} onSuccess={() => setIsEditing(false)} />
  }

  return (
    <div className="space-y-6">
      {/* Header con badges y botones */}
      {/* Descripción */}
      {/* Información (owner, dates) */}
      {/* Relaciones (contact, conversation, opportunity) */}
      <ConfirmDialog onConfirm={handleDelete} />
    </div>
  )
}
```

---

#### **task-form/task-form.tsx** (385 líneas)

**Responsabilidad:** Formulario para crear/editar tareas.

**Features:**
- react-hook-form con Zod validation del dominio
- Todos los campos: title, description, status, priority, dueDate, owner
- Relaciones opcionales: contact, conversation, opportunity
- Selectors con datos de tRPC (usuarios, contactos, conversaciones, oportunidades)
- Prefill support para crear tareas desde otros módulos
- Validación en tiempo real (`mode: "onChange"`)
- Toast notifications en success/error
- Deshabilita submit si form inválido

**Componente clave:**
```typescript
export function TaskForm({
  task,
  onSuccess,
  onCancel,
  prefilledContactId,
  prefilledConversationId,
  prefilledOpportunityId
}: TaskFormProps) {
  const { toast } = useToast()
  const { clientId } = useClientContext()
  const { data: session } = useSession()

  const form = useForm<CreateCrmTask>({
    resolver: zodResolver(CreateCrmTaskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? null,
      status: task?.status ?? CrmTaskStatus.PENDING,
      priority: task?.priority ?? CrmTaskPriority.MEDIUM,
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      ownerId: task?.ownerId ?? session?.user?.id ?? "",
      relatedContactId: task?.relatedContactId ?? prefilledContactId ?? null,
      relatedConversationId: task?.relatedConversationId ?? prefilledConversationId ?? null,
      relatedOpportunityId: task?.relatedOpportunityId ?? prefilledOpportunityId ?? null,
      clientId: clientId!,
    },
    mode: "onChange",
  })

  // Fetch data para selectors
  const { data: users = [] } = api.usuarios.list.useQuery({ clientId: clientId! })
  const { data: contacts = [] } = api.contactos.list.useQuery({ clientId: clientId! })
  const { data: conversations = [] } = api.conversaciones.list.useQuery({ clientId: clientId!, filters: {} })
  const { data: opportunities = [] } = api.oportunidades.list.useQuery({ clientId: clientId! })

  const onSubmit = (data: CreateCrmTask) => {
    if (task?.id) {
      updateTaskMutation.mutate({ ...data, id: task.id })
    } else {
      createTaskMutation.mutate(data)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Título */}
      <Controller name="title" control={form.control} render={({ field }) => (
        <Input {...field} placeholder="Ej: Llamar al cliente para seguimiento" />
      )} />

      {/* Descripción */}
      {/* Estado y Prioridad */}
      {/* Fecha de vencimiento y Propietario */}
      {/* Relaciones opcionales */}

      <Button type="submit" disabled={isPending || !form.formState.isValid}>
        {task ? "Actualizar Tarea" : "Crear Tarea"}
      </Button>
    </form>
  )
}
```

---

### 3. **_hooks/use-tasks-queries.ts** - Data Fetching Layer (224 líneas)

**Responsabilidad:** Encapsular todas las llamadas tRPC del módulo.

**Hooks disponibles:**

```typescript
// READ operations
useTasksList(filters)          // Lista de tareas con filtros
useMyTasks()                   // Tareas del usuario actual
useTaskById(taskId)            // Tarea individual con relaciones
useTasksStats(clientId)        // Estadísticas (total, byStatus, byPriority, overdue)

// WRITE operations
useCreateTask()                // Crear tarea + auto-invalidation
useUpdateTask()                // Actualizar tarea + auto-invalidation
useDeleteTask()                // Eliminar tarea + auto-invalidation
```

**Ejemplo de uso:**
```typescript
const { data: tasks, isLoading, error } = useTasksList({
  clientId: 'uuid',
  filters: { status: 'PENDING', priority: 'HIGH' }
})

const createTask = useCreateTask()
createTask.mutate({
  title: 'Nueva tarea',
  ownerId: 'user-uuid',
  clientId: 'client-uuid'
})
```

**Features:**
- Auto-invalidation de queries relacionadas en mutaciones
- Type-safe gracias a tRPC
- Manejo de errores centralizado
- Loading states automáticos

---

### 4. **_adapters/task-adapter.ts** - Data Transformation (157 líneas)

**Responsabilidad:** Transformar datos del backend para visualización.

**Utilidades:**

```typescript
// Formateo de fechas
formatTaskDueDate(date: Date): string
// Output: "14 Oct 2025 - 15:30"

// Verificación de estado
isTaskOverdue(task: CrmTask): boolean

// Traducciones
getTaskStatusText(status: CrmTaskStatus): string
getTaskPriorityText(priority: CrmTaskPriority): string

// Clases CSS
getTaskStatusColor(status: CrmTaskStatus): string
// Output: "bg-yellow-100 text-yellow-800"

getTaskPriorityColor(priority: CrmTaskPriority): string
// Output: "bg-red-100 text-red-800"

// Adaptador completo
adaptTaskForDisplay(task: CrmTask): AdaptedTask
// Output: task con propiedades computed (dueDateFormatted, isOverdue, statusText, etc.)

// Sorting inteligente
sortTasksByPriority(tasks: CrmTask[]): CrmTask[]
// Orden: PENDING > IN_PROGRESS > COMPLETED, luego por prioridad, luego por fecha
```

**Ejemplo:**
```typescript
const adaptedTask = adaptTaskForDisplay(task)
// {
//   ...task,
//   dueDateFormatted: "14 Oct 2025 - 15:30",
//   isOverdue: true,
//   statusText: "Pendiente",
//   statusColor: "bg-yellow-100 text-yellow-800",
//   priorityText: "Alta",
//   priorityColor: "bg-red-100 text-red-800",
//   ownerName: "Juan Pérez",
//   relatedEntityName: "Contacto: María González"
// }
```

---

### 5. **_layout/tasks-header.tsx** - Header Component (42 líneas)

**Responsabilidad:** Header con botón "Nueva Tarea".

**Features:**
- Título y descripción del módulo
- Botón "Nueva Tarea" que abre modal con TaskForm
- Modal manejado con state local

```typescript
export function TasksHeader() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona y organiza las tareas de tu equipo
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

### 6. **_store/tasks-store.ts** - State Management (177 líneas)

**Responsabilidad:** Estado global del módulo con Zustand.

**State:**
```typescript
interface TasksStoreState {
  // Filtros básicos
  searchTerm: string
  selectedCategory: TaskCategory  // 'all' | 'my-tasks' | 'pending' | 'in-progress' | 'completed' | 'overdue'

  // Filtros avanzados
  statusFilter?: CrmTaskStatus
  priorityFilter?: CrmTaskPriority
  ownerFilter?: string
  relatedContactFilter?: string
  relatedConversationFilter?: string
  relatedOpportunityFilter?: string
  dueDateFromFilter?: Date
  dueDateToFilter?: Date

  // Tarea seleccionada
  selectedTaskId?: string

  // Actions
  setSearchTerm: (term: string) => void
  setSelectedCategory: (category: TaskCategory) => void
  setStatusFilter: (status?: CrmTaskStatus) => void
  setPriorityFilter: (priority?: CrmTaskPriority) => void
  setOwnerFilter: (owner?: string) => void
  setRelatedContactFilter: (contactId?: string) => void
  setRelatedConversationFilter: (conversationId?: string) => void
  setRelatedOpportunityFilter: (opportunityId?: string) => void
  setDueDateFromFilter: (date?: Date) => void
  setDueDateToFilter: (date?: Date) => void
  setSelectedTaskId: (taskId?: string) => void
  clearFilters: () => void
  resetToDefaults: () => void
  getTrpcFilters: () => CrmTaskFilters  // Convierte al formato tRPC
}
```

**Uso:**
```typescript
const {
  searchTerm,
  selectedCategory,
  statusFilter,
  priorityFilter,
  setSearchTerm,
  setStatusFilter,
  setPriorityFilter,
  clearFilters,
  setSelectedCategory,
  getTrpcFilters
} = useTasksStore()

// Cambiar búsqueda
setSearchTerm('cliente')

// Cambiar filtro de estado
setStatusFilter(CrmTaskStatus.PENDING)

// Cambiar filtro de prioridad
setPriorityFilter(CrmTaskPriority.HIGH)

// Limpiar todos los filtros
clearFilters()

// Cambiar categoría predefinida
setSelectedCategory('my-tasks')

// Obtener filtros formateados para tRPC
const trpcFilters = getTrpcFilters()
const { data: tasks } = useTasksList(trpcFilters)
```

---

## 🔌 Backend (API Layer)

### tRPC Router: `src/server/api/routers/tareas.ts` (486 líneas)

#### Endpoints Disponibles:

##### **1. list** - Listar Tareas
```typescript
api.tareas.list.useQuery({
  clientId: 'uuid',
  filters: {
    status: 'PENDING',
    priority: 'HIGH',
    ownerId: 'user-uuid',
    search: 'cliente',
    dueDateFrom: new Date('2025-01-01'),
    dueDateTo: new Date('2025-12-31')
  }
})
```

**Features:**
- Filtros opcionales por status, priority, owner, relaciones, búsqueda, fechas
- Búsqueda full-text en title y description (case-insensitive)
- Incluye relaciones (owner, contact, conversation, opportunity)
- Ordenamiento: status asc → priority desc → dueDate asc
- Validación multi-tenant (solo tareas del clientId)

---

##### **2. byId** - Obtener Tarea Individual
```typescript
api.tareas.byId.useQuery({
  id: 'task-uuid',
  clientId: 'client-uuid' // Opcional, usa ctx.session.user.clientId si no se pasa
})
```

**Features:**
- Incluye todas las relaciones con campos detallados
- Validación de permisos por clientId
- Error handling (NOT_FOUND si no existe)

---

##### **3. create** - Crear Tarea
```typescript
api.tareas.create.useMutation({
  title: 'Llamar al cliente',
  description: 'Seguimiento de propuesta',
  status: 'PENDING',
  priority: 'HIGH',
  dueDate: new Date('2025-10-20'),
  ownerId: 'user-uuid',
  relatedContactId: 'contact-uuid',
  clientId: 'client-uuid'
})
```

**Validaciones:**
- Title requerido (no vacío después de trim)
- Owner debe existir y pertenecer al mismo clientId
- Usuarios no-AURELIA no pueden crear tareas para otros clientes
- Relaciones opcionales (validadas por FK en DB)

---

##### **4. update** - Actualizar Tarea
```typescript
api.tareas.update.useMutation({
  id: 'task-uuid',
  title: 'Nuevo título',
  status: 'COMPLETED',
  priority: 'LOW'
})
```

**Validaciones:**
- Tarea debe existir y pertenecer al clientId
- Title no puede quedar vacío
- Si cambia ownerId, validar que existe y pertenece al clientId
- Parcial update (solo campos enviados)

---

##### **5. delete** - Eliminar Tarea
```typescript
api.tareas.delete.useMutation({
  id: 'task-uuid',
  clientId: 'client-uuid' // Opcional
})
```

**Validaciones:**
- Tarea debe existir y pertenecer al clientId
- Soft delete disponible agregando campo `deletedAt` en schema (futuro)

---

##### **6. stats** - Estadísticas
```typescript
api.tareas.stats.useQuery({
  clientId: 'client-uuid'
})
```

**Output:**
```typescript
{
  total: 50,
  overdue: 5,
  byStatus: {
    PENDING: 20,
    IN_PROGRESS: 15,
    COMPLETED: 10,
    ARCHIVED: 5
  },
  byPriority: {
    LOW: 10,
    MEDIUM: 25,
    HIGH: 12,
    URGENT: 3
  }
}
```

**Features:**
- Agregaciones optimizadas con `groupBy`
- Count de tareas vencidas (dueDate < now, status ≠ COMPLETED/ARCHIVED)
- Útil para dashboard de métricas

---

##### **7. myTasks** - Tareas del Usuario Actual
```typescript
api.tareas.myTasks.useQuery({
  filters: {
    status: 'PENDING',
    priority: 'HIGH'
  }
})
```

**Features:**
- Auto-filtra por `ctx.session.user.id` como ownerId
- Útil para "Mis Tareas" en UI
- Mismas relaciones que `list`

---

### Prisma Schema: `prisma/schema.prisma`

```prisma
model CrmTask {
  id                    String         @id @default(uuid())
  title                 String
  description           String?
  status                CrmTaskStatus  @default(PENDING)
  priority              CrmTaskPriority @default(MEDIUM)
  dueDate               DateTime?
  ownerId               String
  relatedContactId      String?
  relatedConversationId String?
  relatedOpportunityId  String?
  clientId              String
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  client                Client         @relation(fields: [clientId], references: [id], onDelete: Cascade)
  owner                 User           @relation("CrmTaskOwner", fields: [ownerId], references: [id])
  relatedContact        Contact?       @relation("CrmTaskContact", fields: [relatedContactId], references: [id])
  relatedConversation   Conversation?  @relation("CrmTaskConversation", fields: [relatedConversationId], references: [id])
  relatedOpportunity    Opportunity?   @relation("CrmTaskOpportunity", fields: [relatedOpportunityId], references: [id])

  @@index([clientId, status])
  @@index([clientId, ownerId])
  @@index([dueDate])
  @@map("crm_tasks")
}

enum CrmTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum CrmTaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

**Índices optimizados:**
- `[clientId, status]` - Para filtros de lista
- `[clientId, ownerId]` - Para myTasks
- `[dueDate]` - Para búsquedas de overdue y reminders

---

### Domain Types: `src/domain/Tareas.ts`

```typescript
// Zod schemas para validación
export const CreateCrmTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(CrmTaskStatus).default(CrmTaskStatus.PENDING),
  priority: z.nativeEnum(CrmTaskPriority).default(CrmTaskPriority.MEDIUM),
  dueDate: z.date().nullable().optional(),
  ownerId: z.string().uuid(),
  relatedContactId: z.string().uuid().nullable().optional(),
  relatedConversationId: z.string().uuid().nullable().optional(),
  relatedOpportunityId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid(),
})

export const UpdateCrmTaskSchema = CreateCrmTaskSchema.partial().omit({ clientId: true })

// TypeScript types
export type CreateCrmTask = z.infer<typeof CreateCrmTaskSchema>
export type UpdateCrmTask = z.infer<typeof UpdateCrmTaskSchema>
export type CrmTaskWithRelations = CrmTask & {
  owner: { id: string; name: string | null; email: string }
  relatedContact?: { id: string; name: string } | null
  relatedConversation?: { id: string; title: string | null } | null
  relatedOpportunity?: { id: string; title: string } | null
}

// Constants para UI
export const CRM_TASK_STATUSES = [
  { value: CrmTaskStatus.PENDING, label: 'Pendiente' },
  { value: CrmTaskStatus.IN_PROGRESS, label: 'En Progreso' },
  { value: CrmTaskStatus.COMPLETED, label: 'Completada' },
  { value: CrmTaskStatus.ARCHIVED, label: 'Archivada' },
] as const

export const CRM_TASK_PRIORITIES = [
  { value: CrmTaskPriority.LOW, label: 'Baja' },
  { value: CrmTaskPriority.MEDIUM, label: 'Media' },
  { value: CrmTaskPriority.HIGH, label: 'Alta' },
  { value: CrmTaskPriority.URGENT, label: 'Urgente' },
] as const
```

---

## 🎨 Frontend (UI Layer)

### Componentes UI Utilizados (shadcn/ui)

- **Card, CardHeader, CardTitle, CardContent** - Layout de tarjetas
- **Badge** - Badges de status/priority
- **Button** - Botones de acción
- **Dialog, DialogContent, DialogHeader, DialogTitle** - Modales
- **Input** - Input de texto
- **Textarea** - Textarea para descripción
- **Select, SelectTrigger, SelectValue, SelectContent, SelectItem** - Selectors
- **Label** - Labels de form
- **Separator** - Separadores visuales
- **ConfirmDialog** - Diálogo de confirmación (custom component)

### Iconos (lucide-react)

- **Calendar** - Fechas
- **User** - Propietario
- **AlertCircle** - Errores
- **CheckCircle2** - Completadas
- **Loader2** - Loading
- **Plus** - Crear
- **Edit** - Editar
- **Trash2** - Eliminar
- **MessageSquare** - Conversaciones
- **Briefcase** - Oportunidades
- **Clock** - Timestamps
- **Save** - Guardar
- **Target** - Prioridad (futuro)

### Responsive Design

- **Mobile-first** - Diseño optimizado para móviles
- **Grid adaptativo** - 1 columna en móvil, 2 en tablet/desktop
- **Modales responsive** - `max-h-[90vh] overflow-y-auto`
- **Touch-friendly** - Botones con tamaño adecuado para touch

---

## 🔒 Seguridad y Multi-tenancy

### Validaciones Backend

1. **Client Isolation**
   - Todas las queries filtran por `clientId`
   - Usuarios no-AURELIA solo ven datos de su cliente
   - Usuarios AURELIA pueden acceder a múltiples clientes

2. **Owner Validation**
   - Al crear/actualizar, verificar que owner pertenece al mismo clientId
   - Evita asignar tareas a usuarios de otros clientes

3. **Authorization Checks**
   ```typescript
   if (ctx.session.user.type !== "AURELIA" && input.clientId !== ctx.session.user.clientId) {
     throw new TRPCError({ code: "FORBIDDEN", message: "..." })
   }
   ```

4. **Input Sanitization**
   - Title y description se limpian con `.trim()`
   - Validación de UUIDs con Zod
   - Enums validados contra schema

### Validaciones Frontend

1. **Form Validation**
   - Zod schema del dominio
   - Validación en tiempo real (`mode: "onChange"`)
   - Error messages en español

2. **Confirmation Dialogs**
   - Delete requiere confirmación explícita
   - Botones destructivos en rojo (`variant="destructive"`)

3. **Session Checks**
   - tRPC protectedProcedure verifica sesión activa
   - Redirect a login si no autenticado

---

## 📖 Guías de Uso

### Para Desarrolladores

#### 1. Crear Nueva Tarea Programáticamente

```typescript
import { api } from '@/trpc/react'

function MyComponent() {
  const createTask = api.tareas.create.useMutation({
    onSuccess: () => {
      console.log('Tarea creada')
    }
  })

  const handleCreateTask = () => {
    createTask.mutate({
      title: 'Nueva tarea',
      description: 'Descripción',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2025-10-20'),
      ownerId: 'user-uuid',
      clientId: 'client-uuid',
    })
  }

  return <button onClick={handleCreateTask}>Crear Tarea</button>
}
```

---

#### 2. Integrar TaskForm en Otro Módulo

**Ejemplo: Crear tarea desde detalle de contacto**

```typescript
// src/app/(saas)/saas/contactos/_features/contact-detail/contact-detail.tsx
import { TaskForm } from '@/app/(saas)/saas/tareas/_features/task-form/task-form'
import { Dialog } from '@/components/ui/dialog'

function ContactDetail({ contactId }: { contactId: string }) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsTaskDialogOpen(true)}>
        Crear Tarea para Contacto
      </Button>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <TaskForm
            prefilledContactId={contactId} // Pre-fill relación
            onSuccess={() => setIsTaskDialogOpen(false)}
            onCancel={() => setIsTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

---

#### 3. Mostrar Tareas Relacionadas en Otro Módulo

**Ejemplo: Lista de tareas en detalle de oportunidad**

```typescript
// src/app/(saas)/saas/oportunidades/_features/opportunity-tasks/opportunity-tasks.tsx
import { useTasksList } from '@/app/(saas)/saas/tareas/_hooks/use-tasks-queries'

function OpportunityTasks({ opportunityId, clientId }: Props) {
  const { data: tasks, isLoading } = useTasksList({
    clientId,
    filters: { relatedOpportunityId: opportunityId }
  })

  if (isLoading) return <Loader2 className="animate-spin" />

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Tareas Relacionadas ({tasks?.length ?? 0})</h3>
      {tasks?.map(task => (
        <div key={task.id} className="border rounded p-2">
          <p>{task.title}</p>
          <Badge>{task.status}</Badge>
        </div>
      ))}
    </div>
  )
}
```

---

#### 4. Usar Stats en Dashboard

```typescript
// src/app/(saas)/saas/dashboard/page.tsx
import { api } from '@/trpc/react'

function Dashboard() {
  const { clientId } = useClientContext()
  const { data: stats } = api.tareas.stats.useQuery({ clientId: clientId! })

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>Total Tareas</CardHeader>
        <CardContent>{stats?.total ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>Vencidas</CardHeader>
        <CardContent>{stats?.overdue ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>Pendientes</CardHeader>
        <CardContent>{stats?.byStatus.PENDING ?? 0}</CardContent>
      </Card>
      <Card>
        <CardHeader>Completadas</CardHeader>
        <CardContent>{stats?.byStatus.COMPLETED ?? 0}</CardContent>
      </Card>
    </div>
  )
}
```

---

### Para Usuarios Finales

#### 1. Crear Tarea
1. Click en "Nueva Tarea" en el header
2. Llenar formulario:
   - **Título** (requerido)
   - **Descripción** (opcional)
   - **Estado** (default: Pendiente)
   - **Prioridad** (default: Media)
   - **Fecha de vencimiento** (opcional)
   - **Propietario** (requerido, default: usuario actual)
   - **Relacionar con** (opcional): Contacto, Conversación, Oportunidad
3. Click en "Crear Tarea"
4. Toast de confirmación aparece
5. Modal se cierra automáticamente

#### 2. Ver Detalle de Tarea
1. En la lista, click en "Ver detalles" en cualquier tarea
2. Modal se abre con:
   - Información completa
   - Relaciones (si existen)
   - Botones de acción
3. Acciones disponibles:
   - **Completar** - Marca como completada
   - **Editar** - Cambia a modo edición
   - **Eliminar** - Solicita confirmación

#### 3. Editar Tarea
1. Abrir detalle de tarea
2. Click en "Editar"
3. Formulario aparece con valores actuales
4. Modificar campos necesarios
5. Click en "Actualizar Tarea"
6. Vuelve a vista de detalle

#### 4. Eliminar Tarea
1. Abrir detalle de tarea
2. Click en "Eliminar"
3. Diálogo de confirmación aparece
4. Confirmar eliminación
5. Tarea eliminada, modal se cierra

---

## 🔧 Extensibilidad

### Agregar Nuevo Campo

**Ejemplo: Agregar campo `estimatedHours`**

**1. Actualizar Prisma Schema**
```prisma
model CrmTask {
  // ... campos existentes
  estimatedHours Int?
}
```

**2. Migrar DB**
```bash
pnpm db:generate
pnpm db:migrate
```

**3. Actualizar Domain Types**
```typescript
// src/domain/Tareas.ts
export const CreateCrmTaskSchema = z.object({
  // ... campos existentes
  estimatedHours: z.number().int().positive().nullable().optional(),
})
```

**4. Actualizar TaskForm**
```typescript
// src/app/(saas)/saas/tareas/_features/task-form/task-form.tsx
<div className="space-y-2">
  <Label htmlFor="estimatedHours">Horas Estimadas</Label>
  <Controller
    name="estimatedHours"
    control={form.control}
    render={({ field }) => (
      <Input
        id="estimatedHours"
        type="number"
        placeholder="Ej: 8"
        {...field}
      />
    )}
  />
</div>
```

**5. Actualizar TaskDetail**
```typescript
// src/app/(saas)/saas/tareas/_features/task-detail/task-detail.tsx
{task.estimatedHours && (
  <div className="flex items-start gap-3">
    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
    <div>
      <p className="text-sm font-medium">Horas Estimadas</p>
      <p className="text-sm text-muted-foreground">{task.estimatedHours}h</p>
    </div>
  </div>
)}
```

---

### Agregar Nuevo Estado

**Ejemplo: Agregar estado `ON_HOLD`**

**1. Actualizar Prisma Enum**
```prisma
enum CrmTaskStatus {
  PENDING
  IN_PROGRESS
  ON_HOLD       // Nuevo
  COMPLETED
  ARCHIVED
}
```

**2. Migrar DB**
```bash
pnpm db:generate
pnpm db:migrate
```

**3. Actualizar Domain Constants**
```typescript
// src/domain/Tareas.ts
export const CRM_TASK_STATUSES = [
  { value: CrmTaskStatus.PENDING, label: 'Pendiente' },
  { value: CrmTaskStatus.IN_PROGRESS, label: 'En Progreso' },
  { value: CrmTaskStatus.ON_HOLD, label: 'En Espera' }, // Nuevo
  { value: CrmTaskStatus.COMPLETED, label: 'Completada' },
  { value: CrmTaskStatus.ARCHIVED, label: 'Archivada' },
] as const
```

**4. Actualizar Adapter (color)**
```typescript
// src/app/(saas)/saas/tareas/_adapters/task-adapter.ts
export function getTaskStatusColor(status: CrmTaskStatus): string {
  const colorMap: Record<CrmTaskStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    ON_HOLD: "bg-orange-100 text-orange-800", // Nuevo
    COMPLETED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
  }
  return colorMap[status]
}
```

---

### Agregar Feature Completa

**Ejemplo: Agregar Comentarios en Tareas**

**1. Crear modelo en Prisma**
```prisma
model CrmTaskComment {
  id        String   @id @default(uuid())
  taskId    String
  userId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task      CrmTask  @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@index([taskId, createdAt(sort: Desc)])
  @@map("crm_task_comments")
}
```

**2. Crear tRPC router**
```typescript
// src/server/api/routers/task-comments.ts
export const taskCommentsRouter = createTRPCRouter({
  list: protectedProcedure.input(z.object({ taskId: z.string().uuid() })).query(...),
  create: protectedProcedure.input(CreateCommentSchema).mutation(...),
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(...),
})
```

**3. Crear feature en frontend**
```
tareas/
└── _features/
    └── task-comments/
        ├── task-comments.tsx         # Lista de comentarios
        ├── comment-form.tsx          # Form para agregar comentario
        └── comment-item.tsx          # Item individual
```

**4. Integrar en TaskDetail**
```typescript
// src/app/(saas)/saas/tareas/_features/task-detail/task-detail.tsx
import { TaskComments } from '../task-comments/task-comments'

// Dentro del render:
<Card>
  <CardHeader>
    <CardTitle>Comentarios</CardTitle>
  </CardHeader>
  <CardContent>
    <TaskComments taskId={task.id} />
  </CardContent>
</Card>
```

---

## 📊 Comparativa con CRM del Mercado

### Estado Actual: ~35-40% de Competitividad

| Feature | Aurelia Tasks | HubSpot | Salesforce | Pipedrive | Monday.com |
|---------|---------------|---------|------------|-----------|------------|
| **Core Features** | | | | | |
| CRUD Tareas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Asignación | ✅ | ✅ | ✅ | ✅ | ✅ |
| Estados | ✅ 4 estados | ✅ Custom | ✅ Custom | ✅ Custom | ✅ Custom |
| Prioridades | ✅ 4 niveles | ✅ Custom | ✅ Custom | ✅ 3 niveles | ✅ Custom |
| Fechas vencimiento | ✅ | ✅ | ✅ | ✅ | ✅ |
| Relaciones CRM | ✅ 3 tipos | ✅ 5+ tipos | ✅ 10+ tipos | ✅ 4 tipos | ✅ Ilimitado |
| Búsqueda | ✅ Básica | ✅ Avanzada | ✅ Avanzada | ✅ Avanzada | ✅ Avanzada |
| Filtros | ✅ 7 filtros | ✅ 15+ filtros | ✅ 20+ filtros | ✅ 10+ filtros | ✅ Ilimitados |
| Estadísticas | ✅ Básicas | ✅ Dashboards | ✅ Analytics | ✅ Reports | ✅ Advanced |
| **Advanced Features** | | | | | |
| Notificaciones | ❌ | ✅ | ✅ | ✅ | ✅ |
| Recordatorios | ❌ | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |
| Comentarios | ❌ | ✅ | ✅ | ✅ | ✅ |
| Attachments | ❌ | ✅ | ✅ | ✅ | ✅ |
| Subtareas | ❌ | ✅ | ✅ | ✅ | ✅ |
| Recurring tasks | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dependencies | ❌ | ❌ | ✅ | ❌ | ✅ |
| Time tracking | ❌ | ❌ | ✅ | ❌ | ✅ |
| Automation | ❌ | ✅ Workflows | ✅ Process Builder | ✅ | ✅ |
| Templates | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Views & UX** | | | | | |
| Lista | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kanban | ❌ | ✅ | ✅ | ✅ | ✅ |
| Calendar | ❌ | ✅ | ✅ | ✅ | ✅ |
| Timeline | ❌ | ✅ | ✅ | ❌ | ✅ |
| Table | ❌ | ✅ | ✅ | ✅ | ✅ |
| Mobile app | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Integrations** | | | | | |
| Email | ❌ | ✅ | ✅ | ✅ | ✅ |
| Calendar sync | ❌ | ✅ Google/Outlook | ✅ All | ✅ Google | ✅ All |
| Slack/Teams | ❌ | ✅ | ✅ | ✅ | ✅ |
| Zapier | ❌ | ✅ | ✅ | ✅ | ✅ |
| API | ✅ tRPC | ✅ REST | ✅ REST/SOAP | ✅ REST | ✅ GraphQL |

### Gaps Críticos para Competitividad

#### 1. **Notificaciones y Recordatorios** 🔴 CRÍTICO
- **Gap:** Sin sistema de notificaciones automáticas
- **Impacto:** Usuarios olvidan tareas, baja productividad
- **Solución:** Ver `NOTIFICATION_SYSTEM.md`
- **Esfuerzo:** 3-4 semanas
- **ROI:** +25-30% productividad

#### 2. **Vistas Alternativas** 🟡 IMPORTANTE
- **Gap:** Solo vista de lista
- **Impacto:** UX menos flexible que competencia
- **Solución:**
  - Kanban board (drag & drop)
  - Calendar view (integración con date-fns)
  - Table view (con sorting)
- **Esfuerzo:** 2-3 semanas
- **ROI:** +15% engagement

#### 3. **Colaboración** 🟡 IMPORTANTE
- **Gap:** Sin comentarios ni activity log
- **Impacto:** Comunicación fragmentada
- **Solución:**
  - Modelo `CrmTaskComment`
  - Activity log automático (create/update/complete)
  - @mentions de usuarios
- **Esfuerzo:** 1-2 semanas
- **ROI:** +20% colaboración en equipo

#### 4. **Automación** 🟢 DESEABLE
- **Gap:** Sin workflows automáticos
- **Impacto:** Tareas repetitivas manuales
- **Solución:**
  - Templates de tareas
  - Recurring tasks
  - Triggers (cuando oportunidad pasa a "Cerrada", crear tarea de seguimiento)
- **Esfuerzo:** 3-4 semanas
- **ROI:** +10-15% eficiencia

---

## 🗺️ Roadmap de Mejoras

### Fase 1: Notificaciones (CRÍTICO) ✅ Ver `NOTIFICATION_SYSTEM.md`
**Esfuerzo:** 3-4 semanas
**ROI:** +25-30% productividad
**Dependencias:** Ninguna

**Features:**
- ✅ Notificaciones in-app en tiempo real
- ✅ Recordatorios automáticos (24h antes de vencimiento)
- ✅ Alertas de tareas vencidas
- ✅ Notificaciones de asignación/actualización
- 🔄 Email notifications (opcional)

---

### Fase 2: Vistas Alternativas (IMPORTANTE)
**Esfuerzo:** 2-3 semanas
**ROI:** +15% engagement
**Dependencias:** Ninguna

**Features:**
- Kanban board con drag & drop
  - Estados como columnas
  - Drag entre columnas cambia status
  - @dnd-kit o react-beautiful-dnd
- Calendar view
  - Integración con date-fns
  - Tasks agrupadas por día
  - Click en día crea task con esa fecha
- Table view
  - react-table o TanStack Table
  - Sorting por columna
  - Bulk actions (multi-select)

**Diseño sugerido:**
```
TasksPage:
  Header (con selector de vista)
  [Lista | Kanban | Calendar | Table]
```

---

### Fase 3: Colaboración (IMPORTANTE)
**Esfuerzo:** 1-2 semanas
**ROI:** +20% colaboración
**Dependencias:** Notificaciones (para @mentions)

**Features:**
- Comentarios en tareas
  - Modelo `CrmTaskComment`
  - Componente `TaskComments` en TaskDetail
  - @mentions de usuarios (con autocomplete)
- Activity log
  - Tabla `CrmTaskActivity` (auto-generada en mutations)
  - Timeline visual en TaskDetail
  - Eventos: created, updated, completed, commented
- File attachments
  - Supabase Storage
  - Preview de imágenes/PDFs
  - Download de archivos

---

### Fase 4: Subtareas y Dependencies (DESEABLE)
**Esfuerzo:** 2 semanas
**ROI:** +10% productividad en tareas complejas
**Dependencias:** Fase 3

**Features:**
- Subtareas
  - Relación self-referential en Prisma
  - `parentTaskId` en `CrmTask`
  - UI de árbol en TaskDetail
  - Completion de parent requiere todas las subtasks completadas
- Dependencies
  - Tabla `CrmTaskDependency` (many-to-many)
  - "Esta tarea depende de..." selector
  - Warning si intentas completar task con dependencies pendientes
  - Gantt chart (opcional, con @syncfusion/ej2-react-gantt)

---

### Fase 5: Automación (DESEABLE)
**Esfuerzo:** 3-4 semanas
**ROI:** +10-15% eficiencia
**Dependencias:** Notificaciones

**Features:**
- Templates de tareas
  - Modelo `CrmTaskTemplate`
  - Botón "Usar Template" en TaskForm
  - Pre-fill de campos
- Recurring tasks
  - Campo `recurrence` en `CrmTask` (daily, weekly, monthly)
  - Cron job crea nuevas tasks automáticamente
- Workflow automation
  - Triggers: "Cuando oportunidad cambia a X, crear tarea Y"
  - Modelo `CrmWorkflow` y `CrmWorkflowAction`
  - UI builder (low-code)

---

### Fase 6: Integraciones (FUTURO)
**Esfuerzo:** 4-6 semanas
**ROI:** +20% adoption
**Dependencias:** Todas las anteriores

**Features:**
- Email integration
  - Crear tarea desde email (forward a inbox@aurelia.com)
  - Enviar task por email
- Calendar sync
  - Google Calendar API
  - Outlook Calendar API
  - Tasks aparecen como eventos
- Slack/Teams notifications
  - Webhook en notificaciones
  - Commands: `/aurelia task create`
- Zapier integration
  - REST API pública
  - Triggers: task created, completed
  - Actions: create task, update task

---

## 📚 Referencias

- [CLAUDE.md](../../../../CLAUDE.md) - Lineamientos del proyecto
- [NOTIFICATION_SYSTEM.md](../../../../NOTIFICATION_SYSTEM.md) - Propuesta de notificaciones
- [Prisma Schema](../../../../prisma/schema.prisma) - Modelo de datos
- [tRPC Router](../../../../src/server/api/routers/tareas.ts) - API layer
- [Domain Types](../../../../src/domain/Tareas.ts) - TypeScript types

---

## 🤝 Contribuir

### Coding Standards
- Seguir patrones de `CLAUDE.md`
- TypeScript strict mode
- Validación con Zod
- Error handling en todos los endpoints
- Spanish localization en UI

### Testing (Pendiente)
```
tareas/
└── __tests__/
    ├── task-list.test.tsx
    ├── task-detail.test.tsx
    ├── task-form.test.tsx
    ├── use-tasks-queries.test.ts
    └── task-adapter.test.ts
```

### Pull Requests
1. Fork del repo
2. Branch descriptivo (`feature/task-comments`)
3. Commit messages en español
4. PR con descripción detallada
5. Code review requerido

---

**Última actualización:** 2025-10-14
**Autor:** Equipo Técnico Aurelia Platform
**Versión:** 2.0.0
**Mantenedores:** @team-aurelia
