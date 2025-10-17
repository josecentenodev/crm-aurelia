import { vi } from 'vitest'

/**
 * Mock de Supabase Realtime Channel
 * Simula los diferentes estados de un canal: joining → joined → closed
 */
export class MockRealtimeChannel {
  private callbacks: Map<string, Function[]> = new Map()
  private postgresCallbacks: Array<{
    event: string
    schema: string
    table: string
    filter?: string
    callback: Function
  }> = []
  
  public state: 'joining' | 'joined' | 'closed' | 'errored' = 'joining'
  public topic: string

  constructor(topic: string) {
    this.topic = topic
  }

  on(
    type: 'postgres_changes',
    config: {
      event: string
      schema: string
      table: string
      filter?: string
    },
    callback: Function
  ): this
  on(type: string, callback: Function): this
  on(...args: any[]): this {
    if (args[0] === 'postgres_changes') {
      const [, config, callback] = args
      this.postgresCallbacks.push({ ...config, callback })
    } else {
      const [type, callback] = args
      if (!this.callbacks.has(type)) {
        this.callbacks.set(type, [])
      }
      this.callbacks.get(type)!.push(callback)
    }
    return this
  }

  subscribe(callback?: (status: string) => void): this {
    // Simulate async connection
    setTimeout(() => {
      this.state = 'joined'
      if (callback) {
        callback('SUBSCRIBED')
      }
      this.triggerCallbacks('subscription', 'SUBSCRIBED')
    }, 10)
    return this
  }

  async unsubscribe(): Promise<void> {
    this.state = 'closed'
    return Promise.resolve()
  }

  // Helper methods for testing
  triggerPostgresChange(event: string, table: string, payload: any) {
    this.postgresCallbacks
      .filter(cb => cb.event === event || cb.event === '*')
      .filter(cb => cb.table === table)
      .forEach(cb => cb.callback({ 
        eventType: event,
        new: payload.new,
        old: payload.old,
      }))
  }

  private triggerCallbacks(type: string, ...args: any[]) {
    const callbacks = this.callbacks.get(type) || []
    callbacks.forEach(cb => cb(...args))
  }

  simulateError() {
    this.state = 'errored'
    this.triggerCallbacks('error', new Error('Connection failed'))
  }

  simulateDisconnect() {
    this.state = 'closed'
    this.triggerCallbacks('close')
  }
}

/**
 * Mock del Supabase Client
 */
export const mockSupabaseClient = {
  channel: vi.fn((topic: string) => new MockRealtimeChannel(topic)),
  removeChannel: vi.fn((channel: MockRealtimeChannel) => Promise.resolve()),
}

/**
 * Helper para crear un mock del RealtimeChannelManager
 */
export function createMockRealtimeManager() {
  const channels = new Map<string, MockRealtimeChannel>()

  return {
    getOrCreateChannel: vi.fn(async (channelName: string, setupCallback: Function) => {
      if (!channels.has(channelName)) {
        const channel = new MockRealtimeChannel(channelName)
        setupCallback(channel)
        channels.set(channelName, channel)
      }
      return channels.get(channelName)!
    }),
    removeChannel: vi.fn(async (channelName: string) => {
      channels.delete(channelName)
      return Promise.resolve()
    }),
    getStatus: vi.fn(() => ({
      activeChannels: channels.size,
      pendingCleanups: 0,
      hasQueuedOperations: false,
      channels: Array.from(channels.keys()),
      cleaningUp: [],
    })),
    _getChannels: () => channels, // Helper for testing
  }
}

