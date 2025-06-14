import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css"

export const metadata: Metadata = {
    title: "Aurelia - Login",
    description: "Ingreso a plataforma de Aurelia",
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
