import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Aurelia - Automatización de Ventas con IA",
    description: "La plataforma de inteligencia artificial que automatiza todo tu proceso de ventas consultivas",
}

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
