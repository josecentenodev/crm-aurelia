"use client"

import { TaskGroupCard } from "./task-group-card"

interface PermissionListProps {
  taskGroups: any[]
  tasksByGroup: Record<string, any[]>
  onEditGroup: (group: any) => void
  onDeleteGroup: (groupId: string) => void
  onAddTask: (groupId: string) => void
  onEditTask: (task: any) => void
  onDeleteTask: (taskId: string) => void
  isDeletingGroup?: boolean
  isDeletingTask?: boolean
}

/**
 * Lista de grupos de tareas
 * Componente de composición que mapea TaskGroupCards
 */
export function PermissionList({
  taskGroups,
  tasksByGroup,
  onEditGroup,
  onDeleteGroup,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isDeletingGroup = false,
  isDeletingTask = false
}: PermissionListProps) {
  return (
    <div className="space-y-6">
      {taskGroups.map((group) => (
        <TaskGroupCard
          key={group.groupId}
          group={group}
          tasks={tasksByGroup[group.groupId] || []}
          onEditGroup={onEditGroup}
          onDeleteGroup={onDeleteGroup}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          isDeletingGroup={isDeletingGroup}
          isDeletingTask={isDeletingTask}
        />
      ))}
    </div>
  )
}
