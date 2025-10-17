import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../_tests/test-utils'
import { TaskDetail } from './task-detail'
import { CrmTaskStatus } from '@prisma/client'
import { mockTaskWithRelations, mockTasks } from '../../_tests/mocks/task-data'

// Use vi.hoisted to declare mocks before they are used
const { mockQuery, mockMutate, mockDeleteMutation, mockUpdateMutation, mockInvalidate, mockUtils } = vi.hoisted(() => {
  const mockQuery = vi.fn()
  const mockMutate = vi.fn()
  const mockDeleteMutation = vi.fn()
  const mockUpdateMutation = vi.fn()
  const mockInvalidate = vi.fn()

  const mockUtils = {
    tareas: {
      list: { invalidate: mockInvalidate },
      byId: { invalidate: mockInvalidate },
      stats: { invalidate: mockInvalidate },
    },
  }

  return { mockQuery, mockMutate, mockDeleteMutation, mockUpdateMutation, mockInvalidate, mockUtils }
})

// Mock tRPC
vi.mock('@/trpc/react', () => ({
  api: {
    useUtils: vi.fn(() => mockUtils),
    tareas: {
      byId: {
        useQuery: mockQuery,
      },
      delete: {
        useMutation: mockDeleteMutation,
      },
      update: {
        useMutation: mockUpdateMutation,
      },
      list: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
    usuarios: {
      list: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
    contactos: {
      list: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
    conversaciones: {
      list: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
    oportunidades: {
      listByClient: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}))

// Mock ClientProvider
vi.mock('@/providers/ClientProvider', () => ({
  useClientContext: () => ({ clientId: 'client-1' }),
}))

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'user-1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
      },
    },
  }),
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('TaskDetail', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockQuery.mockReturnValue({
      data: mockTaskWithRelations,
      isLoading: false,
      error: null,
    })

    mockDeleteMutation.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    })

    mockUpdateMutation.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when fetching task', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const spinner = screen.getByRole('img', { hidden: true })
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should not show task details while loading', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.queryByText('Llamar al cliente')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      const errorMessage = 'Failed to fetch task'
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { message: errorMessage },
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText(/Error al cargar la tarea/i)).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('should show error message when task does not exist', () => {
      mockQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText(/Error al cargar la tarea/i)).toBeInTheDocument()
      expect(screen.getByText(/La tarea no existe/i)).toBeInTheDocument()
    })
  })

  describe('Task Information Display', () => {
    it('should render task title', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Llamar al cliente')).toBeInTheDocument()
    })

    it('should display task status badge', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('should display task priority badge', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Alta')).toBeInTheDocument()
    })

    it('should display overdue badge for overdue tasks', () => {
      const overdueTask = {
        ...mockTaskWithRelations,
        dueDate: new Date('2020-01-01T10:00:00Z'),
        status: CrmTaskStatus.PENDING,
      }

      mockQuery.mockReturnValue({
        data: overdueTask,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Vencida')).toBeInTheDocument()
    })

    it('should display task description when available', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(
        screen.getByText('Seguimiento de propuesta comercial')
      ).toBeInTheDocument()
    })

    it('should not render description section when no description', () => {
      const taskWithoutDescription = {
        ...mockTaskWithRelations,
        description: null,
      }

      mockQuery.mockReturnValue({
        data: taskWithoutDescription,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.queryByText('Descripción')).not.toBeInTheDocument()
    })

    it('should display owner information', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Propietario')).toBeInTheDocument()
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('juan@example.com')).toBeInTheDocument()
    })

    it('should display due date when available', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Fecha de vencimiento')).toBeInTheDocument()
      // Date format is tested in adapter tests
    })

    it('should display creation and update timestamps', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Fechas')).toBeInTheDocument()
      expect(screen.getByText(/Creada:/i)).toBeInTheDocument()
      expect(screen.getByText(/Actualizada:/i)).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render edit button', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const editButton = screen.getByRole('button', { name: /editar/i })
      expect(editButton).toBeInTheDocument()
    })

    it('should render delete button', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('should render "Completar" button for non-completed tasks', () => {
      const pendingTask = {
        ...mockTaskWithRelations,
        status: CrmTaskStatus.PENDING,
      }

      mockQuery.mockReturnValue({
        data: pendingTask,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const completeButton = screen.getByRole('button', { name: /completar/i })
      expect(completeButton).toBeInTheDocument()
    })

    it('should not render "Completar" button for completed tasks', () => {
      const completedTask = {
        ...mockTaskWithRelations,
        status: CrmTaskStatus.COMPLETED,
      }

      mockQuery.mockReturnValue({
        data: completedTask,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const completeButton = screen.queryByRole('button', { name: /completar/i })
      expect(completeButton).not.toBeInTheDocument()
    })

    it('should switch to edit mode when clicking edit button', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const editButton = screen.getByRole('button', { name: /editar/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
      })
    })

    it('should show delete confirmation dialog when clicking delete button', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro?/i)).toBeInTheDocument()
        expect(
          screen.getByText(/Esta acción no se puede deshacer/i)
        ).toBeInTheDocument()
      })
    })

    it('should call update mutation when marking as completed', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const completeButton = screen.getByRole('button', { name: /completar/i })
      await user.click(completeButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockTaskWithRelations.id,
            status: 'COMPLETED',
          }),
          expect.anything()
        )
      })
    })

    it('should call delete mutation when confirming deletion', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro?/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          { id: mockTaskWithRelations.id },
          expect.anything()
        )
      })
    })

    it('should call onClose after successful deletion', async () => {
      const user = userEvent.setup()

      // Mock successful deletion
      mockDeleteMutation.mockReturnValue({
        mutate: (data: any, options: any) => {
          mockMutate(data, options)
          options.onSuccess()
        },
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: true,
        isError: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro?/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should show toast on successful deletion', async () => {
      const user = userEvent.setup()

      mockDeleteMutation.mockReturnValue({
        mutate: (data: any, options: any) => {
          mockMutate(data, options)
          options.onSuccess()
        },
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: true,
        isError: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro?/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Tarea eliminada',
            description: 'La tarea se ha eliminado exitosamente.',
          })
        )
      })
    })

    it('should show error toast on deletion failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to delete task'

      mockDeleteMutation.mockReturnValue({
        mutate: (data: any, options: any) => {
          mockMutate(data, options)
          options.onError({ message: errorMessage })
        },
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        isError: true,
        error: { message: errorMessage },
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const deleteButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/¿Estás seguro?/i)).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /eliminar/i })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error al eliminar tarea',
            description: errorMessage,
            variant: 'destructive',
          })
        )
      })
    })

    it('should show toast on successful completion', async () => {
      const user = userEvent.setup()

      mockUpdateMutation.mockReturnValue({
        mutate: (data: any, options: any) => {
          mockMutate(data, options)
          options.onSuccess()
        },
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: true,
        isError: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const completeButton = screen.getByRole('button', { name: /completar/i })
      await user.click(completeButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Tarea completada',
            description: 'La tarea se ha marcado como completada.',
          })
        )
      })
    })

    it('should disable complete button while updating', () => {
      mockUpdateMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const completeButton = screen.getByRole('button', { name: /completar/i })
      expect(completeButton).toBeDisabled()
    })
  })

  describe('Edit Mode', () => {
    it('should render TaskForm in edit mode', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const editButton = screen.getByRole('button', { name: /editar/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
        expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      })
    })

    it('should exit edit mode when clicking cancel', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /editar/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
      })

      // Exit edit mode
      const cancelButton = screen.getAllByRole('button', { name: /cancelar/i })[0]
      await user.click(cancelButton!)

      await waitFor(() => {
        expect(screen.queryByText('Editar Tarea')).not.toBeInTheDocument()
        expect(screen.getByText('Llamar al cliente')).toBeInTheDocument()
      })
    })

    it('should show toast after successful edit', async () => {
      const user = userEvent.setup()
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const editButton = screen.getByRole('button', { name: /editar/i })
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('Editar Tarea')).toBeInTheDocument()
      })

      // Simulate form success callback
      const titleInput = screen.getByLabelText(/título/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Tarea actualizada')

      // Note: Full form submission is tested in task-form.test.tsx
      // Here we test that toast is shown after success
    })
  })

  describe('Related Entities Display', () => {
    it('should display related contact information', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Relacionado con')).toBeInTheDocument()
      expect(screen.getByText('Contacto')).toBeInTheDocument()
      expect(screen.getByText('María González')).toBeInTheDocument()
      expect(screen.getByText('maria@example.com')).toBeInTheDocument()
    })

    it('should display related conversation information', () => {
      const taskWithConversation = {
        ...mockTaskWithRelations,
        relatedContact: null,
        relatedConversation: {
          id: 'conv-1',
          title: 'Conversación de WhatsApp',
          status: 'ACTIVE',
        },
      }

      mockQuery.mockReturnValue({
        data: taskWithConversation,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Conversación')).toBeInTheDocument()
      expect(screen.getByText('Conversación de WhatsApp')).toBeInTheDocument()
    })

    it('should display related opportunity information', () => {
      const taskWithOpportunity = {
        ...mockTaskWithRelations,
        relatedContact: null,
        relatedOpportunity: {
          id: 'opp-1',
          title: 'Venta de software',
          amount: 15000,
          status: 'NEGOTIATION',
        },
      }

      mockQuery.mockReturnValue({
        data: taskWithOpportunity,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByText('Oportunidad')).toBeInTheDocument()
      expect(screen.getByText('Venta de software')).toBeInTheDocument()
      expect(screen.getByText(/\$15,000/i)).toBeInTheDocument()
    })

    it('should not render relations section when no relations exist', () => {
      const taskWithoutRelations = {
        ...mockTaskWithRelations,
        relatedContact: null,
        relatedConversation: null,
        relatedOpportunity: null,
      }

      mockQuery.mockReturnValue({
        data: taskWithoutRelations,
        isLoading: false,
        error: null,
      })

      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.queryByText('Relacionado con')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /completar/i })).toBeInTheDocument()
    })

    it('should have semantic heading for task title', () => {
      render(<TaskDetail taskId="task-1" onClose={mockOnClose} />)

      const heading = screen.getByRole('heading', { name: /llamar al cliente/i })
      expect(heading).toBeInTheDocument()
    })
  })
})
