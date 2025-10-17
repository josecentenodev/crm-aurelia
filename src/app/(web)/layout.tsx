import type React from "react"
import type { Metadata } from "next"
import { Providers } from "@/providers"

export const metadata: Metadata = {
  title: "Aurelia - Plataforma de IA para Ventas",
  description: "Tu plataforma de inteligencia artificial para automatizar ventas consultivas",
  generator: 'Aurelia'
}

export default function WebLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      {children}
    </Providers>
  )
}
