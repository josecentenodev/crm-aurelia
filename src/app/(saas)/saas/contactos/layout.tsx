import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CRM - Contactos",
  description: "Gestiona tus contactos, información, historial de comunicaciones y más en el módulo de Contactos.",
}

export default function ContactosLayoutSEO({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <div className="min-h-screen p-10">
    {children}
    </div>
  )
}
