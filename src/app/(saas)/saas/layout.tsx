import type React from "react"
import type { Metadata } from "next"
import { Sidebar } from "./_global_features/sidebar"
import { Toaster } from "@/components/ui"
import { Providers } from "@/providers"
import { ClientProvider } from "@/providers/ClientProvider"
import { RealtimeNotificationsProvider } from "./_global_features/client-selector/realtime-notifications-provider"

export const metadata: Metadata = {
  title: "Aurelia - Plataforma de IA para Ventas",
  description: "Tu plataforma de inteligencia artificial para automatizar ventas consultivas",
  generator: 'Aurelia'
}

export default function SaasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <ClientProvider>
        <RealtimeNotificationsProvider />
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="main-content min-h-screen">
            {children}
          </main>
        </div>
        <Toaster />
      </ClientProvider>
    </Providers>
  )
}
