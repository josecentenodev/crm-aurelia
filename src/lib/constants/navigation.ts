import { Bot, MessageSquare, Home, Users, Target, Clipboard } from "lucide-react"

export const navigation = [
  { name: "Dashboard", href: "/saas", icon: Home },
  { name: "Conversaciones", href: "/saas/conversaciones", icon: MessageSquare },
  { name: "Contactos", href: "/saas/contactos", icon: Users },
  { name: "Agentes IA", href: "/saas/agentes", icon: Bot },
  { name: "Embudos", href: "/saas/pipelines", icon: Target },
  { name: "Tareas", href: "/saas/tareas", icon: Clipboard },
]