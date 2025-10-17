import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import type { ReactNode } from 'react'

// Mock de tRPC
vi.mock('@/trpc/react', () => ({
  api: {
    useUtils: vi.fn(() => ({
      conversaciones: {
        listMessages: {
          invalidate: vi.fn()
        }
      }
    })),
    conversaciones: {
      listMessages: {
        useQuery: vi.fn()
      }
    }
  }
}))

// Mock del RealtimeChannelManager
vi.mock('../../_lib', () => ({
  realtimeManager: {
    getOrCreateChannel: vi.fn(),
    removeChannel: vi.fn()
  }
}))

// Import del hook después de los mocks
import { useMessages } from './use-messages'
import { api } from '@/trpc/react'
import { realtimeManager } from '../../_lib'

// Obtener las funciones mockeadas
const mockQuery = vi.mocked(api.conversaciones.listMessages.useQuery)
const mockGetOrCreateChannel = vi.mocked(realtimeManager.getOrCreateChannel)
const mockRemoveChannel = vi.mocked(realtimeManager.removeChannel)

describe('useMessages', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        }
      }
    })
    vi.clearAllMocks()
    
    // Default mock implementation
    mockQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })
    
    mockGetOrCreateChannel.mockResolvedValue({
      state: 'joined',
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('expone connectionError cuando Realtime falla', async () => {
    const error = new Error('Connection failed')
    mockGetOrCreateChannel.mockRejectedValueOnce(error)

    const { result } = renderHook(
      () => useMessages({
        conversationId: 'conv-123',
        clientId: 'client-123',
        enabled: true
      }),
      { wrapper }
    )

    // Esperar a que se procese el error
    await waitFor(() => {
      expect(result.current.connectionError).toBe('Connection failed')
    })
  })

  it('limpia connectionError cuando reconecta exitosamente', async () => {
    // Primera vez: falla
    const error = new Error('Connection failed')
    mockGetOrCreateChannel.mockRejectedValueOnce(error)

    const { result, rerender } = renderHook(
      () => useMessages({
        conversationId: 'conv-123',
        clientId: 'client-123',
        enabled: true
      }),
      { wrapper }
    )

    // Esperar a que se establezca el error
    await waitFor(() => {
      expect(result.current.connectionError).toBe('Connection failed')
    })

    // Segunda vez: éxito
    mockGetOrCreateChannel.mockResolvedValueOnce({
      state: 'joined',
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn((callback) => {
        callback?.('SUBSCRIBED')
        return { state: 'joined' }
      })
    })

    // Llamar a reconnect
    act(() => {
      result.current.reconnect()
    })

    // Esperar a que se limpie el error
    await waitFor(() => {
      expect(result.current.connectionError).toBeNull()
    }, { timeout: 2000 })
  })

  it('retorna mensajes vacíos inicialmente', () => {
    const { result } = renderHook(
      () => useMessages({
        conversationId: 'conv-123',
        clientId: 'client-123',
        enabled: true
      }),
      { wrapper }
    )

    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('retorna mensajes del servidor cuando los hay', async () => {
    const serverMessages = [
      {
        id: 'msg-1',
        conversationId: 'conv-123',
        content: 'Hello',
        role: 'USER',
        senderType: 'USER',
        messageType: 'TEXT',
        messageStatus: 'SENT',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]

    mockQuery.mockReturnValue({
      data: serverMessages,
      isLoading: false,
      error: null
    })

    const { result } = renderHook(
      () => useMessages({
        conversationId: 'conv-123',
        clientId: 'client-123',
        enabled: true
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0]?.id).toBe('msg-1')
    })
  })

  // Los tests de optimistic UI se prueban en integración ya que dependen
  // del mecanismo interno de re-render del hook con forceUpdate
  it.todo('agrega mensaje temporal correctamente - testear en integración')
  it.todo('actualiza mensaje temporal correctamente - testear en integración')
  it.todo('remueve mensaje temporal correctamente - testear en integración')

  it('no crea canal Realtime cuando enabled es false', () => {
    renderHook(
      () => useMessages({
        conversationId: 'conv-123',
        clientId: 'client-123',
        enabled: false
      }),
      { wrapper }
    )

    expect(mockGetOrCreateChannel).not.toHaveBeenCalled()
  })

  it('limpia canal Realtime en cleanup', async () => {
    const { unmount } = renderHook(
      () => useMessages({
        conversationId: 'conv-123',
        clientId: 'client-123',
        enabled: true
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(mockGetOrCreateChannel).toHaveBeenCalled()
    })

    unmount()

    await waitFor(() => {
      expect(mockRemoveChannel).toHaveBeenCalledWith('messages:conv-123')
    })
  })
})

