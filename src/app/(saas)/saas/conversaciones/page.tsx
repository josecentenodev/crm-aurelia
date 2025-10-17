/**
 * Página principal del módulo de chats
 * Solo SEO/Hydrate y montaje del cliente. Sin SSR de datos.
 */

import { HydrateClient } from '@/trpc/server'
import { ChatsLayout } from './_layout/chats-layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conversaciones - Aurelia',
  description: 'Gestiona tus conversaciones con tus clientes y recibe notificaciones en tiempo real.',
}

export default function ChatsPage() {
  return (
    <HydrateClient>
      <ChatsLayout />
    </HydrateClient>
  )
}