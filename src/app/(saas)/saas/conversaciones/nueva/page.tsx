/**
 * Página para crear nueva conversación
 * Solo SEO/Metadata y montaje del cliente. Sin SSR de datos.
 */

import { HydrateClient } from '@/trpc/server'
import { CreateConversationForm } from '../_features/create-conversation/create-conversation-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nueva Conversación - Aurelia',
  description: 'Crea una nueva conversación con un contacto',
}

export default function NuevaConversacionPage() {
  return (
    <HydrateClient>
      <CreateConversationForm />
    </HydrateClient>
  )
}

