import { Bot, MessageSquare, Home, Users, Target, Radio } from "lucide-react"

export const navigation = [
  { name: "Dashboard", href: "/crm", icon: Home },
  { name: "Agentes IA", href: "/crm/agentes", icon: Bot },
  { name: "Conversaciones", href: "/crm/conversaciones", icon: MessageSquare },
  { name: "Embudos", href: "/crm/pipelines", icon: Target },
  { name: "Contactos", href: "/crm/contactos", icon: Users },
  { name: "Canales", href: "/crm/canales", icon: Radio },
]