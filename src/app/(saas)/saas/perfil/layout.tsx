import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CRM - Perfil",
  description: "Gestiona tu perfil.",
  generator: 'Aurelia'
}

export default function PerfilLayoutSEO({
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