import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CRM - Agentes",
  description: "Gestiona tus agentes, información, probalos en playground de comunicaciones y más en el módulo de Agentes.",
}

export default function AgentesLayoutSEO({
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
