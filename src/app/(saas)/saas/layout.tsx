import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "@/styles/globals.css"
import { TRPCReactProvider } from "@/trpc/react"
import { Sidebar } from "./_components/sidebar"
import { Toaster } from "@/components"

const inter = Inter({ subsets: ["latin"] })

// TODO: podriamos implementar de cero un sistema de logs.
// TODO: implementar logica de permisos y roles por acceso/atributos para los usuarios dentro de Aurelia.
// IMPORTANT: Comenzar el desarrollo de la server api con trpc y prisma.


export const metadata: Metadata = {
  title: "Aurelia - Plataforma de IA para Ventas",
  description: "Tu plataforma de inteligencia artificial para automatizar ventas consultivas",
  generator: 'Aurelia'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <TRPCReactProvider>
          <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="main-content min-h-screen p-6">{children}</main>
          </div>
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
