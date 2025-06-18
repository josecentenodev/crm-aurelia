import { Bot, MessageSquare, Home, Users, Target, Radio } from "lucide-react"

export const navigation = [
  { name: "Dashboard", href: "/saas", icon: Home },
  { name: "Agentes IA", href: "/saas/agentes", icon: Bot },
  { name: "Conversaciones", href: "/saas/conversaciones", icon: MessageSquare },
  { name: "Embudos", href: "/saas/pipelines", icon: Target },
  { name: "Contactos", href: "/saas/contactos", icon: Users },
  { name: "Canales", href: "/saas/canales", icon: Radio },
]