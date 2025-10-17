import { vi } from 'vitest'
import { mockTasks, mockTaskWithRelations, mockTasksStats, mockUsers, mockContacts, mockConversations, mockOpportunities } from './task-data'

/**
 * Mock implementation of tRPC API for tasks module
 */
export const createMockTRPCApi = () => {
  const mockUtils = {
    tareas: {
      list: {
        invalidate: vi.fn(),
      },
      byId: {
        invalidate: vi.fn(),
      },
      stats: {
        invalidate: vi.fn(),
      },
      myTasks: {
        invalidate: vi.fn(),
      },
    },
  }

  const mockApi = {
    useUtils: vi.fn(() => mockUtils),

    tareas: {
      list: {
        useQuery: vi.fn(() => ({
          data: Object.values(mockTasks),
          isLoading: false,
          error: null,
        })),
      },
      byId: {
        useQuery: vi.fn(() => ({
          data: mockTaskWithRelations,
          isLoading: false,
          error: null,
        })),
      },
      create: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
          isSuccess: false,
          isError: false,
          error: null,
        })),
      },
      update: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
          isSuccess: false,
          isError: false,
          error: null,
        })),
      },
      delete: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
          isSuccess: false,
          isError: false,
          error: null,
        })),
      },
      stats: {
        useQuery: vi.fn(() => ({
          data: mockTasksStats,
          isLoading: false,
          error: null,
        })),
      },
      myTasks: {
        useQuery: vi.fn(() => ({
          data: [mockTasks.pending, mockTasks.inProgress],
          isLoading: false,
          error: null,
        })),
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
      list: {
        useQuery: vi.fn(() => ({
          data: mockOpportunities,
          isLoading: false,
          error: null,
        })),
      },
    },
  }

  return { mockApi, mockUtils }
}

/**
 * Setup mocks for tRPC
 */
export const setupTRPCMocks = () => {
  const { mockApi } = createMockTRPCApi()

  vi.mock('@/trpc/react', () => ({
    api: mockApi,
  }))

  return mockApi
}
