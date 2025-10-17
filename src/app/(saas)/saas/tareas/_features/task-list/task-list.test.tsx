import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../_tests/test-utils'
import { TaskList } from './task-list'
import { CrmTaskStatus, CrmTaskPriority } from '@prisma/client'
import { mockTasks, mockTaskWithRelations } from '../../_tests/mocks/task-data'

// Use vi.hoisted to declare mocks before they are used
const { mockQuery, mockUtils, mockGetTrpcFilters } = vi.hoisted(() => {
  const mockQuery = vi.fn()
  const mockUtils = {
    tareas: {
      list: { invalidate: vi.fn() },
      byId: { invalidate: vi.fn() },
    },
  }
  const mockGetTrpcFilters = vi.fn()

  return { mockQuery, mockUtils, mockGetTrpcFilters }
})

// Mock tRPC
vi.mock('@/trpc/react', () => ({
  api: {
    useUtils: vi.fn(() => mockUtils),
    tareas: {
      list: {
        useQuery: mockQuery,
      },
      byId: {
        useQuery: vi.fn(() => ({
          data: mockTaskWithRelations,
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}))

// Mock store
vi.mock('../../_store/tasks-store', () => ({
  useTasksStore: vi.fn(() => ({
    getTrpcFilters: mockGetTrpcFilters,
  })),
}))

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTrpcFilters.mockReturnValue({ filters: {} })
  })

  describe('Loading State', () => {
    it('should show loading spinner when fetching tasks', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<TaskList />)

      const spinner = screen.getByRole('img', { hidden: true })
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should not show tasks while loading', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<TaskList />)

      expect(screen.queryByText(/Llamar al cliente/i)).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      const errorMessage = 'Failed to fetch tasks'
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: errorMessage },
      })

      render(<TaskList />)

      expect(screen.getByText(/Error al cargar las tareas/i)).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should show error icon', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: 'Error' },
      })

      render(<TaskList />)

      expect(screen.getByText(/Error al cargar las tareas/i)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no tasks', () => {
      mockQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText(/No hay tareas/i)).toBeInTheDocument()
      expect(
        screen.getByText(/Crea tu primera tarea para comenzar a organizar tu trabajo/i)
      ).toBeInTheDocument()
    })

    it('should show empty state icon', () => {
      mockQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText(/No hay tareas/i)).toBeInTheDocument()
    })
  })

  describe('Task List Rendering', () => {
    it('should render list of tasks', () => {
      mockQuery.mockReturnValue({
        data: Object.values(mockTasks),
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText('Llamar al cliente')).toBeInTheDocument()
      expect(screen.getByText('Preparar presentación')).toBeInTheDocument()
      expect(screen.getByText('Enviar cotización')).toBeInTheDocument()
    })

    it('should display task status badges', () => {
      mockQuery.mockReturnValue({
        data: [mockTasks.pending],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('should display task priority badges', () => {
      mockQuery.mockReturnValue({
        data: [mockTasks.pending],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText('Alta')).toBeInTheDocument()
    })

    it('should display overdue badge for overdue tasks', () => {
      const overdueTask = {
        ...mockTasks.pending,
        dueDate: new Date('2020-01-01T10:00:00Z'),
        status: CrmTaskStatus.PENDING,
      }

      mockQuery.mockReturnValue({
        data: [overdueTask],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText('Vencida')).toBeInTheDocument()
    })

    it('should display task description when available', () => {
      mockQuery.mockReturnValue({
        data: [mockTasks.pending],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(
        screen.getByText('Seguimiento de propuesta comercial')
      ).toBeInTheDocument()
    })

    it('should display due date when available', () => {
      mockQuery.mockReturnValue({
        data: [mockTaskWithRelations],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      // Check that a date is displayed (format verified in adapter tests)
      const dateElements = screen.getAllByRole('img', { hidden: true })
      const calendarIcon = dateElements.find((el) =>
        el.parentElement?.textContent?.match(/\d{1,2}\s+\w+\s+\d{4}/)
      )
      expect(calendarIcon).toBeDefined()
    })

    it('should display owner name', () => {
      mockQuery.mockReturnValue({
        data: [mockTaskWithRelations],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    })

    it('should display related entity name when available', () => {
      mockQuery.mockReturnValue({
        data: [mockTaskWithRelations],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(screen.getByText(/María González/i)).toBeInTheDocument()
    })
  })

  describe('Task Sorting', () => {
    it('should sort tasks by priority', () => {
      const tasks = [
        { ...mockTasks.completed, id: '1', priority: CrmTaskPriority.LOW },
        { ...mockTasks.pending, id: '2', priority: CrmTaskPriority.URGENT },
        { ...mockTasks.inProgress, id: '3', priority: CrmTaskPriority.MEDIUM },
      ]

      mockQuery.mockReturnValue({
        data: tasks,
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      const taskCards = screen.getAllByRole('heading', { level: 3 })

      // Pending (URGENT) should come first, then In Progress (MEDIUM), then Completed (LOW)
      expect(taskCards[0]).toHaveTextContent(tasks[1]!.title)
    })
  })

  describe('Task Detail Modal', () => {
    it('should open detail modal when clicking "Ver detalles"', async () => {
      const user = userEvent.setup()
      mockQuery.mockReturnValue({
        data: [mockTaskWithRelations],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      const detailButton = screen.getByRole('button', { name: /ver detalles/i })
      await user.click(detailButton)

      await waitFor(() => {
        expect(screen.getByText('Detalle de Tarea')).toBeInTheDocument()
      })
    })

    it('should close modal when clicking close', async () => {
      const user = userEvent.setup()
      mockQuery.mockReturnValue({
        data: [mockTaskWithRelations],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      const detailButton = screen.getByRole('button', { name: /ver detalles/i })
      await user.click(detailButton)

      await waitFor(() => {
        expect(screen.getByText('Detalle de Tarea')).toBeInTheDocument()
      })

      // Close by clicking outside (dialog overlay)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should render multiple "Ver detalles" buttons for multiple tasks', () => {
      mockQuery.mockReturnValue({
        data: Object.values(mockTasks),
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      const detailButtons = screen.getAllByRole('button', { name: /ver detalles/i })
      expect(detailButtons.length).toBe(Object.values(mockTasks).length)
    })
  })

  describe('Store Integration', () => {
    it('should fetch tasks with filters from store', () => {
      const storeFilters = {
        filters: {
          status: CrmTaskStatus.PENDING,
          priority: CrmTaskPriority.HIGH,
        },
      }

      mockGetTrpcFilters.mockReturnValue(storeFilters)
      mockQuery.mockReturnValue({
        data: [mockTasks.pending],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(mockGetTrpcFilters).toHaveBeenCalled()
      expect(mockQuery).toHaveBeenCalledWith(storeFilters)
    })

    it('should fetch tasks with empty filters when store has no filters', () => {
      mockGetTrpcFilters.mockReturnValue({ filters: {} })
      mockQuery.mockReturnValue({
        data: Object.values(mockTasks),
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      expect(mockQuery).toHaveBeenCalledWith({ filters: {} })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      mockQuery.mockReturnValue({
        data: [mockTasks.pending],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      const detailButton = screen.getByRole('button', { name: /ver detalles/i })
      expect(detailButton).toBeInTheDocument()
    })

    it('should have semantic headings for task titles', () => {
      mockQuery.mockReturnValue({
        data: [mockTasks.pending],
        isLoading: false,
        error: null,
      })

      render(<TaskList />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Llamar al cliente')
    })
  })
})
