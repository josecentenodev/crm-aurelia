import { Shield, Users, CreditCard, type LucideIcon } from "lucide-react"

export interface ConfigSection {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const CONFIG_SECTIONS: readonly ConfigSection[] = [
  {
    id: "permisos",
    title: "Permisos",
    description: "Gestiona los permisos del sistema y define qué acciones puede realizar cada usuario",
    icon: Shield
  },
  {
    id: "roles",
    title: "Roles",
    description: "Administra los roles de usuario y sus asignaciones",
    icon: Users
  },
  {
    id: "planes",
    title: "Planes",
    description: "Configura los planes de suscripción y sus características",
    icon: CreditCard
  }
] as const

export type ConfigSectionId = typeof CONFIG_SECTIONS[number]["id"]
