import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CRM - Usuarios",
  description: "Gestiona tus usuarios y sus permisos en el módulo de Usuarios.",
  generator: 'Aurelia'
}

export default function UsuariosLayoutSEO({
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
