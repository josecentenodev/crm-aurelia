import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CRM - Pipeline de Ventas",
  description: "Gestiona tus oportunidades, etapas y resultados en el módulo de Pipelines.",
}

export default function PipelinesLayoutSEO({
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
