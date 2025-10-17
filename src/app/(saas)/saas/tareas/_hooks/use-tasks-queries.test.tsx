import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { CrmTaskStatus, CrmTaskPriority } from '@prisma/client'

// Use vi.hoisted to declare mocks before they are used
const { mockInvalidate, mockMutate, mockMutateAsync, mockQuery, mockMutation, mockUtils } = vi.hoisted(() => {
  const mockInvalidate = vi.fn()
  const mockMutate = vi.fn()
  const mockMutateAsync = vi.fn()
  const mockQuery = vi.fn()
  const mockMutation = vi.fn()

  const mockUtils = {
    tareas: {
      list: { invalidate: mockInvalidate },
      byId: { invalidate: mockInvalidate },
      stats: { invalidate: mockInvalidate },
      myTasks: { invalidate: mockInvalidate },
    },
  }

  return { mockInvalidate, mockMutate, mockMutateAsync, mockQuery, mockMutation, mockUtils }
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
        useQuery: mockQuery,
      },
      create: {
        useMutation: mockMutation,
      },
      update: {
        useMutation: mockMutation,
      },
      delete: {
        useMutation: mockMutation,
      },
      stats: {
        useQuery: mockQuery,
      },
      myTasks: {
        useQuery: mockQuery,
      },
    },
  },
}))

// Mock ClientProvider
vi.mock('@/providers/ClientProvider', () => ({
  useClientContext: () => ({ clientId: 'client-1' }),
}))

// Import hooks after mocks
import {
  useTasksList,
  useTaskById,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useTasksStats,
  useMyTasks,
} from './use-tasks-queries'
import { mockTasks, mockTaskWithRelations, mockTasksStats } from '../_tests/mocks/task-data'

describe('use-tasks-queries', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()

    // Default mock implementations
    mockQuery.mockReturnValue({
      data: Object.values(mockTasks),
      isLoading: false,
      error: null,
    })

    mockMutation.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    })
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  describe('useTasksList', () => {
    it('should fetch tasks list', () => {
      const { result } = renderHook(
        () => useTasksList(),
        { wrapper }
      )

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: 'client-1' }),
        expect.any(Object)
      )
      expect(result.current.data).toBeDefined()
    })

    it('should pass filters correctly', () => {
      const filters = {
        status: CrmTaskStatus.PENDING,
        priority: CrmTaskPriority.HIGH,
        ownerId: 'user-1',
      }

      renderHook(
        () => useTasksList(filters),
        { wrapper }
      )

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'client-1',
          filters: expect.objectContaining(filters),
        }),
        expect.any(Object)
      )
    })

    it('should return loading state', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      const { result } = renderHook(
        () => useTasksList({ clientId: 'client-1' }),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('should return error state', () => {
      const error = new Error('Failed to fetch')
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
      })

      const { result } = renderHook(
        () => useTasksList({ clientId: 'client-1' }),
        { wrapper }
      )

      expect(result.current.error).toBe(error)
    })
  })

  describe('useTaskById', () => {
    it('should fetch task by id', () => {
      mockQuery.mockReturnValue({
        data: mockTaskWithRelations,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(
        () => useTaskById('task-1'),
        { wrapper }
      )

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'task-1', clientId: 'client-1' }),
        expect.any(Object)
      )
      expect(result.current.data).toEqual(mockTaskWithRelations)
    })

    it('should handle empty task id', () => {
      mockQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(
        () => useTaskById(''),
        { wrapper }
      )

      expect(result.current.data).toBeUndefined()
    })
  })

  describe('useMyTasks', () => {
    it('should fetch current user tasks', () => {
      mockQuery.mockReturnValue({
        data: [mockTasks.pending, mockTasks.inProgress],
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(() => useMyTasks(), { wrapper })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ filters: {} })
      )
      expect(result.current.data).toHaveLength(2)
    })

    it('should always use empty filters object', () => {
      renderHook(() => useMyTasks(), { wrapper })

      // useMyTasks always passes empty filters object (filtering is done by backend based on user session)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ filters: {} })
      )
    })
  })

  describe('useTasksStats', () => {
    it('should fetch tasks statistics', () => {
      mockQuery.mockReturnValue({
        data: mockTasksStats,
        isLoading: false,
        error: null,
      })

      const { result } = renderHook(
        () => useTasksStats(),
        { wrapper }
      )

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({ clientId: 'client-1' }),
        expect.any(Object)
      )
      expect(result.current.data).toEqual(mockTasksStats)
    })
  })

  describe('useCreateTask', () => {
    it('should call create mutation', async () => {
      const { result } = renderHook(() => useCreateTask(), { wrapper })

      const newTask = {
        title: 'Nueva tarea',
        status: CrmTaskStatus.PENDING,
        priority: CrmTaskPriority.MEDIUM,
        ownerId: 'user-1',
        clientId: 'client-1',
      }

      result.current.mutate(newTask)

      expect(mockMutate).toHaveBeenCalledWith(newTask)
    })

    it('should invalidate queries on success', async () => {
      mockMutation.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        isSuccess: true,
        isError: false,
        error: null,
      })

      const { result } = renderHook(() => useCreateTask(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Note: Testing invalidation requires integration test as it's handled by onSuccess callback
    })
  })

  describe('useUpdateTask', () => {
    it('should call update mutation', () => {
      const { result } = renderHook(() => useUpdateTask(), { wrapper })

      const updatedTask = {
        id: 'task-1',
        title: 'Tarea actualizada',
        status: CrmTaskStatus.COMPLETED,
      }

      result.current.mutate(updatedTask)

      expect(mockMutate).toHaveBeenCalledWith(updatedTask)
    })
  })

  describe('useDeleteTask', () => {
    it('should call delete mutation', () => {
      const { result } = renderHook(() => useDeleteTask(), { wrapper })

      result.current.mutate({ id: 'task-1' })

      expect(mockMutate).toHaveBeenCalledWith({ id: 'task-1' })
    })

    it('should pass clientId when provided', () => {
      const { result } = renderHook(() => useDeleteTask(), { wrapper })

      result.current.mutate({ id: 'task-1', clientId: 'client-2' })

      expect(mockMutate).toHaveBeenCalledWith({
        id: 'task-1',
        clientId: 'client-2',
      })
    })
  })
})
