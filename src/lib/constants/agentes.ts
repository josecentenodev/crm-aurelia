import { BookOpen, FileText, Settings, MessageSquare, HelpCircle, Zap, BarChart3, PlayCircle } from "lucide-react"

export const PASOS_FAQ = [
  {
    id: 1,
    titulo: "Información Básica",
    icono: BookOpen,
    descripcion: "Configura los datos básicos del asistente",
  },
  {
    id: 2,
    titulo: "Base de Conocimiento",
    icono: FileText,
    descripcion: "Sube documentos y crea FAQs",
  },
  {
    id: 3,
    titulo: "Configuración de Respuestas",
    icono: Settings,
    descripcion: "Define cómo responderá el asistente",
  },
  {
    id: 4,
    titulo: "Canales",
    icono: MessageSquare,
    descripcion: "Conecta los canales de comunicación",
  },
  {
    id: 5,
    titulo: "Escalamiento",
    icono: HelpCircle,
    descripcion: "Define cuándo transferir a humano",
  },
  {
    id: 6,
    titulo: "Automatizaciones",
    icono: Zap,
    descripcion: "Configura reglas automáticas",
  },
  {
    id: 7,
    titulo: "Revisión",
    icono: BarChart3,
    descripcion: "Revisa y activa tu asistente",
  },
  {
    id: 8,
    titulo: "Playground",
    icono: PlayCircle,
    descripcion: "Prueba tu asistente",
  },
]

export const CATEGORIAS_FAQ = [
  { id: "productos", nombre: "Productos y Servicios", color: "bg-blue-100 text-blue-800" },
  { id: "soporte", nombre: "Soporte Técnico", color: "bg-green-100 text-green-800" },
  { id: "facturacion", nombre: "Facturación y Pagos", color: "bg-yellow-100 text-yellow-800" },
  { id: "envios", nombre: "Envíos y Devoluciones", color: "bg-purple-100 text-purple-800" },
  { id: "cuenta", nombre: "Gestión de Cuenta", color: "bg-pink-100 text-pink-800" },
  { id: "politicas", nombre: "Políticas y Términos", color: "bg-gray-100 text-gray-800" },
  { id: "general", nombre: "Información General", color: "bg-orange-100 text-orange-800" },
]

export const CANALES_DISPONIBLES = [
  {
    id: "whatsapp",
    nombre: "WhatsApp Business",
    descripcion: "Respuestas automáticas por WhatsApp",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "web",
    nombre: "Chat Web",
    descripcion: "Widget de chat para tu sitio web",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "facebook",
    nombre: "Facebook Messenger",
    descripcion: "Respuestas en Messenger",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "email",
    nombre: "Email",
    descripcion: "Respuestas automáticas por email",
    color: "bg-gray-100 text-gray-800",
  },
]