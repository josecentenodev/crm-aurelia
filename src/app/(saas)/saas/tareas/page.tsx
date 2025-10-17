import { TasksHeader } from "./_layout/tasks-header"
import { TaskList } from "./_features/task-list/task-list"

export default function TasksPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <TasksHeader />
      <TaskList />
    </div>
  )
}
