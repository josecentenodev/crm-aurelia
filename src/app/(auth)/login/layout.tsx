import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Aurelia - Login",
    description: "Ingreso a plataforma de Aurelia",
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
