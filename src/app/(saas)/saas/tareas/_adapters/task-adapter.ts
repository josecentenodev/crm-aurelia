import type { CrmTask, CrmTaskWithRelations } from "@/domain/Tareas"
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Format a task's due date for display
 */
export function formatTaskDueDate(dueDate: Date | null | undefined): string {
  if (!dueDate) return "Sin fecha"

  const date = new Date(dueDate)

  if (isToday(date)) {
    return "Hoy"
  }

  if (isTomorrow(date)) {
    return "Mañana"
  }

  if (isPast(date)) {
    const days = Math.abs(differenceInDays(date, new Date()))
    return `Vencida hace ${days} ${days === 1 ? "día" : "días"}`
  }

  const days = differenceInDays(date, new Date())
  if (days <= 7) {
    return `En ${days} ${days === 1 ? "día" : "días"}`
  }

  return format(date, "dd MMM yyyy", { locale: es })
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: CrmTask): boolean {
  if (!task.dueDate) return false
  if (task.status === "COMPLETED" || task.status === "ARCHIVED") return false
  return isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
}

/**
 * Get display text for task status
 */
export function getTaskStatusText(status: CrmTask["status"]): string {
  const statusMap: Record<CrmTask["status"], string> = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completada",
    ARCHIVED: "Archivada",
  }
  return statusMap[status]
}

/**
 * Get display text for task priority
 */
export function getTaskPriorityText(priority: CrmTask["priority"]): string {
  const priorityMap: Record<CrmTask["priority"], string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente",
  }
  return priorityMap[priority]
}

/**
 * Get color class for task status
 */
export function getTaskStatusColor(status: CrmTask["status"]): string {
  const colorMap: Record<CrmTask["status"], string> = {
    PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
    IN_PROGRESS: "text-blue-600 bg-blue-50 border-blue-200",
    COMPLETED: "text-green-600 bg-green-50 border-green-200",
    ARCHIVED: "text-gray-600 bg-gray-50 border-gray-200",
  }
  return colorMap[status]
}

/**
 * Get color class for task priority
 */
export function getTaskPriorityColor(priority: CrmTask["priority"]): string {
  const colorMap: Record<CrmTask["priority"], string> = {
    LOW: "text-gray-600 bg-gray-50 border-gray-200",
    MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
    HIGH: "text-red-600 bg-red-50 border-red-200",
    URGENT: "text-red-700 bg-red-100 border-red-300",
  }
  return colorMap[priority]
}

/**
 * Transform API task to display format
 */
export function adaptTaskForDisplay(task: CrmTaskWithRelations) {
  return {
    ...task,
    dueDateFormatted: formatTaskDueDate(task.dueDate),
    isOverdue: isTaskOverdue(task),
    statusText: getTaskStatusText(task.status),
    priorityText: getTaskPriorityText(task.priority),
    statusColor: getTaskStatusColor(task.status),
    priorityColor: getTaskPriorityColor(task.priority),
    ownerName: task.owner?.name ?? task.owner?.email ?? "Sin asignar",
    relatedEntityName:
      task.relatedContact?.name ??
      task.relatedConversation?.title ??
      task.relatedOpportunity?.title ??
      null,
  }
}

/**
 * Sort tasks by priority and due date
 */
export function sortTasksByPriority(tasks: CrmTask[]): CrmTask[] {
  const priorityWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
  const statusWeight = { PENDING: 3, IN_PROGRESS: 2, COMPLETED: 1, ARCHIVED: 0 }

  return [...tasks].sort((a, b) => {
    // First, sort by status (PENDING > IN_PROGRESS > COMPLETED > ARCHIVED)
    const statusDiff = statusWeight[b.status] - statusWeight[a.status]
    if (statusDiff !== 0) return statusDiff

    // Then by priority
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then by due date (soonest first)
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}
