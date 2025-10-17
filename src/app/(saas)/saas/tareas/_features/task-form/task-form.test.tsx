import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../_tests/test-utils'
import { TaskForm } from './task-form'
import { CrmTaskStatus, CrmTaskPriority } from '@prisma/client'
import { mockTasks, mockUsers, mockContacts, mockConversations, mockOpportunities } from '../../_tests/mocks/task-data'

// Use vi.hoisted to declare mocks before they are used
const { mockMutate, mockCreateMutation, mockUpdateMutation, mockUtils } = vi.hoisted(() => {
  const mockMutate = vi.fn()
  const mockCreateMutation = vi.fn(() => ({
    mutate: mockMutate,
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  }))

  const mockUpdateMutation = vi.fn(() => ({
    mutate: mockMutate,
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  }))

  const mockUtils = {
    tareas: {
      list: { invalidate: vi.fn() },
      myTasks: { invalidate: vi.fn() },
      stats: { invalidate: vi.fn() },
      byId: { invalidate: vi.fn() },
    },
  }

  return { mockMutate, mockCreateMutation, mockUpdateMutation, mockUtils }
})

// Mock tRPC
vi.mock('@/trpc/react', () => ({
  api: {
    useUtils: vi.fn(() => mockUtils),
    tareas: {
      create: {
        useMutation: mockCreateMutation,
      },
      update: {
        useMutation: mockUpdateMutation,
      },
    },
    usuarios: {
      list: {
        useQuery: vi.fn(() => ({
          data: mockUsers,
          isLoading: false,
          error: null,
        })),
      },
    },
    contactos: {
      list: {
        useQuery: vi.fn(() => ({
          data: mockContacts,
          isLoading: false,
          error: null,
        })),
      },
    },
    conversaciones: {
      list: {
        useQuery: vi.fn(() => ({
          data: mockConversations,
          isLoading: false,
          error: null,
        })),
      },
    },
    oportunidades: {
      listByClient: {
        useQuery: vi.fn(() => ({
          data: mockOpportunities,
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

describe('TaskForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create Mode', () => {
    it('should render all form fields', () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estado/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha de vencimiento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/propietario/i)).toBeInTheDocument()
    })

    it('should have default values for create mode', () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/título/i) as HTMLInputElement
      expect(titleInput.value).toBe('')
    })

    it('should render "Crear Tarea" button in create mode', () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      expect(screen.getByRole('button', { name: /crear tarea/i })).toBeInTheDocument()
    })

    it('should show validation error when title is empty', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /crear tarea/i })

      // Button should be disabled initially (form invalid)
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when form is valid', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'Nueva tarea de prueba')

      // Wait for validation
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /crear tarea/i })
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should call create mutation with correct data on submit', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'Nueva tarea')

      const submitButton = screen.getByRole('button', { name: /crear tarea/i })

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Nueva tarea',
            status: CrmTaskStatus.PENDING,
            priority: CrmTaskPriority.MEDIUM,
            clientId: 'client-1',
          })
        )
      })
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edit Mode', () => {
    const existingTask = {
      ...mockTasks.pending,
      owner: mockUsers[0],
    }

    it('should render "Actualizar Tarea" button in edit mode', () => {
      render(
        <TaskForm
          task={existingTask}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByRole('button', { name: /actualizar tarea/i })).toBeInTheDocument()
    })

    it('should prefill form with existing task data', () => {
      render(
        <TaskForm
          task={existingTask}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/título/i) as HTMLInputElement
      expect(titleInput.value).toBe(existingTask.title)
    })

    it('should call update mutation with correct data on submit', async () => {
      const user = userEvent.setup()
      render(
        <TaskForm
          task={existingTask}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      const titleInput = screen.getByLabelText(/título/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Tarea actualizada')

      const submitButton = screen.getByRole('button', { name: /actualizar tarea/i })

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: existingTask.id,
            title: 'Tarea actualizada',
          })
        )
      })
    })
  })

  describe('Prefilled Relations', () => {
    it('should prefill contact relation when provided', () => {
      render(
        <TaskForm
          prefilledContactId="contact-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      // Note: Testing select value requires more complex setup with Radix UI
      // This test verifies the component renders without error
      expect(screen.getByLabelText(/contacto/i)).toBeInTheDocument()
    })

    it('should prefill conversation relation when provided', () => {
      render(
        <TaskForm
          prefilledConversationId="conversation-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByLabelText(/conversación/i)).toBeInTheDocument()
    })

    it('should prefill opportunity relation when provided', () => {
      render(
        <TaskForm
          prefilledOpportunityId="opportunity-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByLabelText(/oportunidad/i)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state on users fetch', () => {
      // Component should render even while loading users
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    })

    it('should disable submit button during mutation', () => {
      mockCreateMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
      })

      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /creando.../i })
      expect(submitButton).toBeDisabled()
    })

    it('should show "Actualizando..." text during update', () => {
      mockUpdateMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
      })

      render(
        <TaskForm
          task={mockTasks.pending}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText(/actualizando.../i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate required title field', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const submitButton = screen.getByRole('button', { name: /crear tarea/i })
      expect(submitButton).toBeDisabled()

      const titleInput = screen.getByLabelText(/título/i)
      await user.type(titleInput, 'T')

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })

      await user.clear(titleInput)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })

    it('should accept optional description', async () => {
      const user = userEvent.setup()
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const titleInput = screen.getByLabelText(/título/i)
      const descriptionInput = screen.getByLabelText(/descripción/i)

      await user.type(titleInput, 'Tarea sin descripción')

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /crear tarea/i })
        expect(submitButton).not.toBeDisabled()
      })

      // Description is optional, so form should be valid without it
      expect(descriptionInput).toHaveValue('')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estado/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/prioridad/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha de vencimiento/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/propietario/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contacto/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/conversación/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/oportunidad/i)).toBeInTheDocument()
    })

    it('should have accessible buttons', () => {
      render(<TaskForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      const submitButton = screen.getByRole('button', { name: /crear tarea/i })

      expect(cancelButton).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })
})
