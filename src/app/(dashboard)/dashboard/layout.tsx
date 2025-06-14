import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css"

export const metadata: Metadata = {
    title: "Aurelia - Automatización de Ventas con IA",
    description: "La plataforma de inteligencia artificial que automatiza todo tu proceso de ventas consultivas",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className="font-geomanist">{children}</body>
        </html>
    )
}
