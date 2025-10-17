import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MockRealtimeChannel } from '../_tests/mocks/supabase-realtime'

// Mock del getSupabaseClient
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    channel: (name: string) => new MockRealtimeChannel(name),
    removeChannel: vi.fn(() => Promise.resolve()),
  }),
}))

// Import after mocks
import { realtimeManager } from './realtime-channel-manager'

describe('RealtimeChannelManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Cleanup: force remove all channels
    await (realtimeManager as any).forceCleanupAll()
  })

  describe('getOrCreateChannel', () => {
    it('previene creación duplicada del mismo canal', async () => {
      const channelName = 'test-channel-1'
      const setupCallback = vi.fn((ch) => ch.subscribe())

      // Intentar crear el mismo canal 3 veces en paralelo
      const [ch1, ch2, ch3] = await Promise.all([
        realtimeManager.getOrCreateChannel(channelName, setupCallback),
        realtimeManager.getOrCreateChannel(channelName, setupCallback),
        realtimeManager.getOrCreateChannel(channelName, setupCallback),
      ])

      // Todos deben retornar el MISMO canal
      expect(ch1).toBe(ch2)
      expect(ch2).toBe(ch3)

      // El setup solo se debe llamar UNA vez
      expect(setupCallback).toHaveBeenCalledTimes(1)

      // Verificar estado del manager
      const status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(1)
      expect(status.channels).toContain(channelName)
    })

    it('incrementa reference count correctamente', async () => {
      const channelName = 'test-channel-2'
      const setup = vi.fn((ch) => ch.subscribe())

      // Primera suscripción
      await realtimeManager.getOrCreateChannel(channelName, setup)
      let health = realtimeManager.getHealthStatus()
      expect(health.channelRefs[channelName]).toBe(1)

      // Segunda suscripción (mismo canal)
      await realtimeManager.getOrCreateChannel(channelName, setup)
      health = realtimeManager.getHealthStatus()
      expect(health.channelRefs[channelName]).toBe(2)

      // Tercera suscripción
      await realtimeManager.getOrCreateChannel(channelName, setup)
      health = realtimeManager.getHealthStatus()
      expect(health.channelRefs[channelName]).toBe(3)
    })

    it('reutiliza canal existente en estado joined', async () => {
      const channelName = 'test-channel-3'
      const setup1 = vi.fn((ch) => ch.subscribe())
      const setup2 = vi.fn((ch) => ch.subscribe())

      // Crear canal y esperar a que esté joined
      const channel1 = await realtimeManager.getOrCreateChannel(channelName, setup1)
      await new Promise(resolve => setTimeout(resolve, 20)) // Esperar a que subscribe() complete

      // Intentar crear de nuevo (debe reutilizar)
      const channel2 = await realtimeManager.getOrCreateChannel(channelName, setup2)

      expect(channel1).toBe(channel2)
      expect(setup1).toHaveBeenCalledTimes(1)
      // setup2 NO se debe llamar porque reutiliza el canal existente
      expect(setup2).toHaveBeenCalledTimes(0)
    })

    it('limpia canal obsoleto antes de recrear si no está joined', async () => {
      const channelName = 'test-channel-4'
      
      // Crear canal
      const channel1 = await realtimeManager.getOrCreateChannel(
        channelName,
        (ch) => ch.subscribe()
      )
      await new Promise(resolve => setTimeout(resolve, 20))

      // Simular que el canal se cierra inesperadamente
      ;(channel1 as any).state = 'closed'

      // Intentar crear de nuevo (debe limpiar el viejo y crear uno nuevo)
      const channel2 = await realtimeManager.getOrCreateChannel(
        channelName,
        (ch) => ch.subscribe()
      )

      // Debe ser un canal nuevo y válido
      expect(channel2).toBeDefined()
      // El estado puede ser joining o joined dependiendo del timing del subscribe()
      expect(['joining', 'joined']).toContain((channel2 as any).state)
    })
  })

  describe('removeChannel', () => {
    it('solo limpia canal cuando refs llega a 0', async () => {
      const channelName = 'test-channel-5'
      const setup = vi.fn((ch) => ch.subscribe())

      // Crear 3 referencias
      await realtimeManager.getOrCreateChannel(channelName, setup)
      await realtimeManager.getOrCreateChannel(channelName, setup)
      await realtimeManager.getOrCreateChannel(channelName, setup)

      let status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(1)

      // Remover 1ra referencia - canal sigue activo
      await realtimeManager.removeChannel(channelName)
      status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(1)

      // Remover 2da referencia - canal sigue activo
      await realtimeManager.removeChannel(channelName)
      status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(1)

      // Remover 3ra referencia - AHORA se limpia
      await realtimeManager.removeChannel(channelName)
      await new Promise(resolve => setTimeout(resolve, 600)) // Esperar cleanup
      
      status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(0)
      expect(status.channels).not.toContain(channelName)
    })

    it('maneja limpieza de canal inexistente sin errores', async () => {
      const channelName = 'non-existent-channel'

      // No debe lanzar error
      await expect(
        realtimeManager.removeChannel(channelName)
      ).resolves.toBeUndefined()

      const status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(0)
    })
  })

  describe('Cola global de operaciones', () => {
    it('serializa operaciones correctamente', async () => {
      const channelName = 'test-channel-6'
      const operations: string[] = []

      // Operación 1: Crear
      const p1 = realtimeManager.getOrCreateChannel(channelName, (ch) => {
        operations.push('create-1')
        return ch.subscribe()
      })

      // Operación 2: Crear (debe esperar a la primera)
      const p2 = realtimeManager.getOrCreateChannel(channelName, (ch) => {
        operations.push('create-2')
        return ch.subscribe()
      })

      // Operación 3: Remover (debe esperar a las anteriores)
      const p3 = (async () => {
        await p2
        operations.push('before-remove')
        await realtimeManager.removeChannel(channelName)
        operations.push('after-remove')
      })()

      await Promise.all([p1, p2, p3])

      // Verificar orden de ejecución
      expect(operations[0]).toBe('create-1')
      // create-2 puede o no ejecutarse dependiendo de si reutiliza el canal
      expect(operations).toContain('before-remove')
      expect(operations[operations.length - 1]).toBe('after-remove')
    })

    it('maneja múltiples canales diferentes en paralelo', async () => {
      const channel1 = 'channel-A'
      const channel2 = 'channel-B'
      const channel3 = 'channel-C'

      // Crear 3 canales diferentes en paralelo (permitido)
      await Promise.all([
        realtimeManager.getOrCreateChannel(channel1, (ch) => ch.subscribe()),
        realtimeManager.getOrCreateChannel(channel2, (ch) => ch.subscribe()),
        realtimeManager.getOrCreateChannel(channel3, (ch) => ch.subscribe()),
      ])

      const status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(3)
      expect(status.channels).toEqual(
        expect.arrayContaining([channel1, channel2, channel3])
      )
    })
  })

  describe('getStatus y getHealthStatus', () => {
    it('reporta estado correcto de canales activos', async () => {
      const ch1 = 'health-test-1'
      const ch2 = 'health-test-2'

      await realtimeManager.getOrCreateChannel(ch1, (ch) => ch.subscribe())
      await realtimeManager.getOrCreateChannel(ch2, (ch) => ch.subscribe())

      const status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(2)
      expect(status.channels).toHaveLength(2)

      const health = realtimeManager.getHealthStatus()
      expect(health.activeChannels).toBe(2)
      expect(health.isHealthy).toBe(true) // < 10 canales
      expect(health.warning).toBeNull()
    })

    it('reporta advertencia cuando hay muchos canales', async () => {
      // Crear 11 canales (supera MAX_CHANNELS_WARNING de 10)
      for (let i = 0; i < 11; i++) {
        await realtimeManager.getOrCreateChannel(`channel-${i}`, (ch) => ch.subscribe())
      }

      const health = realtimeManager.getHealthStatus()
      expect(health.activeChannels).toBe(11)
      expect(health.isHealthy).toBe(false)
      expect(health.warning).toContain('High channel count')
    })
  })

  describe('hasChannel', () => {
    it('retorna true para canales existentes', async () => {
      const channelName = 'existing-channel'
      await realtimeManager.getOrCreateChannel(channelName, (ch) => ch.subscribe())

      expect(realtimeManager.hasChannel(channelName)).toBe(true)
    })

    it('retorna false para canales inexistentes', () => {
      expect(realtimeManager.hasChannel('non-existent')).toBe(false)
    })
  })

  describe('cleanupAll', () => {
    it('limpia todos los canales correctamente', async () => {
      // Crear varios canales
      await realtimeManager.getOrCreateChannel('ch-1', (ch) => ch.subscribe())
      await realtimeManager.getOrCreateChannel('ch-2', (ch) => ch.subscribe())
      await realtimeManager.getOrCreateChannel('ch-3', (ch) => ch.subscribe())

      let status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(3)

      // Limpiar todos
      await realtimeManager.cleanupAll()
      await new Promise(resolve => setTimeout(resolve, 600))

      status = realtimeManager.getStatus()
      expect(status.activeChannels).toBe(0)
      expect(status.channels).toHaveLength(0)
    })
  })
})

