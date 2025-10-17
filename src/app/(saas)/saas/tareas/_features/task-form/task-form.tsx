"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import { useClientContext } from "@/providers/ClientProvider"
import { useSession } from "next-auth/react"
import { useCreateTask, useUpdateTask } from "../../_hooks/use-tasks-queries"
import {
  CreateCrmTaskSchema,
  CRM_TASK_STATUSES,
  CRM_TASK_PRIORITIES,
  CrmTaskStatus,
  CrmTaskPriority,
  type CreateCrmTask,
  type CrmTaskWithRelations
} from "@/domain/Tareas"
import { useEffect, useMemo } from "react"

interface TaskFormProps {
  task?: any // Task with relations from tRPC
  onSuccess?: () => void
  onCancel?: () => void
  prefilledContactId?: string
  prefilledConversationId?: string
  prefilledOpportunityId?: string
}

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

  // Fetch users for owner selector
  const { data: users = [], isLoading: isLoadingUsers } = api.usuarios.list.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  )

  // Fetch contacts for optional relationship
  const { data: contacts = [], isLoading: isLoadingContacts } = api.contactos.list.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  )

  // Fetch conversations for optional relationship
  const { data: conversations = [], isLoading: isLoadingConversations } = api.conversaciones.list.useQuery(
    { clientId: clientId!, filters: {} },
    { enabled: !!clientId }
  )

  // Fetch opportunities for optional relationship
  const { data: opportunities = [], isLoading: isLoadingOpportunities } = api.oportunidades.listByClient.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId }
  )

  // Use custom hooks with proper invalidation
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  // Watch for contact changes and filter conversations accordingly
  const selectedContactId = form.watch("relatedContactId")

  // Filter conversations by selected contact
  const filteredConversations = useMemo(() => {
    if (!selectedContactId) {
      return conversations
    }
    return conversations.filter((conv: any) => conv.contactId === selectedContactId)
  }, [conversations, selectedContactId])

  // Reset conversation when contact changes
  useEffect(() => {
    const currentConversationId = form.getValues("relatedConversationId")
    if (currentConversationId && selectedContactId) {
      // Check if current conversation belongs to selected contact
      const conversationBelongsToContact = conversations.some(
        (conv: any) => conv.id === currentConversationId && conv.contactId === selectedContactId
      )
      if (!conversationBelongsToContact) {
        // Reset conversation if it doesn't belong to the selected contact
        form.setValue("relatedConversationId", null)
      }
    }
  }, [selectedContactId, conversations, form])

  const onSubmit = (data: CreateCrmTask) => {
    if (task?.id) {
      updateTaskMutation.mutate(
        { ...data, id: task.id },
        {
          onSuccess: () => {
            toast({
              title: "Tarea actualizada",
              description: "La tarea se ha actualizado exitosamente.",
            })
            onSuccess?.()
          },
          onError: (error) => {
            toast({
              title: "Error al actualizar tarea",
              description: error.message,
              variant: "destructive",
            })
          },
        }
      )
    } else {
      createTaskMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Tarea creada",
            description: "La tarea se ha creado exitosamente.",
          })
          onSuccess?.()
        },
        onError: (error) => {
          toast({
            title: "Error al crear tarea",
            description: error.message,
            variant: "destructive",
          })
        },
      })
    }
  }

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              id="title"
              placeholder="Ej: Llamar al cliente para seguimiento"
              {...field}
            />
          )}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder="Detalles adicionales sobre la tarea..."
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value || null)}
              className="min-h-[100px]"
            />
          )}
        />
      </div>

      {/* Estado y Prioridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {CRM_TASK_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {CRM_TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Fecha de vencimiento y Propietario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha de vencimiento</Label>
          <Controller
            name="dueDate"
            control={form.control}
            render={({ field }) => (
              <Input
                id="dueDate"
                type="datetime-local"
                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerId">Propietario *</Label>
          <Controller
            name="ownerId"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoadingUsers}
              >
                <SelectTrigger id="ownerId">
                  <SelectValue placeholder={isLoadingUsers ? "Cargando..." : "Seleccionar propietario"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name ?? user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.ownerId && (
            <p className="text-sm text-red-500">{form.formState.errors.ownerId.message}</p>
          )}
        </div>
      </div>

      {/* Relaciones opcionales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Relacionar con (opcional)</h3>

        <div className="grid grid-cols-1 gap-4">
          {/* Contacto */}
          <div className="space-y-2">
            <Label htmlFor="relatedContactId">Contacto</Label>
            <Controller
              name="relatedContactId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  disabled={isLoadingContacts}
                >
                  <SelectTrigger id="relatedContactId">
                    <SelectValue placeholder={isLoadingContacts ? "Cargando..." : "Sin contacto"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin contacto</SelectItem>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Conversación */}
          <div className="space-y-2">
            <Label htmlFor="relatedConversationId">Conversación</Label>
            <Controller
              name="relatedConversationId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  disabled={isLoadingConversations || Boolean(selectedContactId && filteredConversations.length === 0)}
                >
                  <SelectTrigger id="relatedConversationId">
                    <SelectValue placeholder={
                      isLoadingConversations
                        ? "Cargando..."
                        : selectedContactId && filteredConversations.length === 0
                        ? "No hay conversaciones para este contacto"
                        : "Sin conversación"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin conversación</SelectItem>
                    {filteredConversations.map((conversation: any) => (
                      <SelectItem key={conversation.id} value={conversation.id}>
                        {conversation.title ?? `Conversación con ${conversation.contact?.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {selectedContactId && filteredConversations.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay conversaciones disponibles para el contacto seleccionado
              </p>
            )}
            {selectedContactId && filteredConversations.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Mostrando solo conversaciones del contacto seleccionado
              </p>
            )}
            {!selectedContactId && conversations.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selecciona un contacto para filtrar las conversaciones
              </p>
            )}
          </div>

          {/* Oportunidad */}
          <div className="space-y-2">
            <Label htmlFor="relatedOpportunityId">Oportunidad</Label>
            <Controller
              name="relatedOpportunityId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  disabled={isLoadingOpportunities}
                >
                  <SelectTrigger id="relatedOpportunityId">
                    <SelectValue placeholder={isLoadingOpportunities ? "Cargando..." : "Sin oportunidad"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin oportunidad</SelectItem>
                    {opportunities.map((opportunity) => (
                      <SelectItem key={opportunity.id} value={opportunity.id}>
                        {opportunity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {task ? "Actualizando..." : "Creando..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {task ? "Actualizar Tarea" : "Crear Tarea"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
