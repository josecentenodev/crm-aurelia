import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CRM - Configuración",
  description: "Gestiona tus configuraciones",
}

export default function ConfiguracionLayoutSEO({
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
