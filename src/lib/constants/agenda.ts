import { Calendar, Clock, Users, Settings, Bell, MessageSquare, Zap, BarChart3 } from "lucide-react"

export const PASOS_AGENDA = [
  {
    id: 1,
    titulo: "Información Básica",
    icono: Calendar,
    descripcion: "Configura los datos básicos del asistente",
  },
  {
    id: 2,
    titulo: "Disponibilidad",
    icono: Clock,
    descripcion: "Define horarios y días disponibles",
  },
  {
    id: 3,
    titulo: "Tipos de Reuniones",
    icono: Users,
    descripcion: "Configura los tipos de citas",
  },
  {
    id: 4,
    titulo: "Integraciones",
    icono: Settings,
    descripcion: "Conecta calendarios y herramientas",
  },
  {
    id: 5,
    titulo: "Confirmaciones",
    icono: Bell,
    descripcion: "Configura recordatorios automáticos",
  },
  {
    id: 6,
    titulo: "Canales",
    icono: MessageSquare,
    descripcion: "Selecciona canales de comunicación",
  },
  {
    id: 7,
    titulo: "Automatizaciones",
    icono: Zap,
    descripcion: "Configura reglas automáticas",
  },
  {
    id: 8,
    titulo: "Revisión",
    icono: BarChart3,
    descripcion: "Revisa y activa tu asistente",
  },
]

export const TIPOS_REUNION_PREDEFINIDOS = [
  { nombre: "Demostración", duracion: 30, descripcion: "Demo del producto" },
  { nombre: "Consulta Inicial", duracion: 15, descripcion: "Primera consulta gratuita" },
  { nombre: "Seguimiento", duracion: 20, descripcion: "Reunión de seguimiento" },
  { nombre: "Onboarding", duracion: 45, descripcion: "Sesión de incorporación" },
]

export const INTEGRACIONES_CALENDARIO = [
  { id: "google", nombre: "Google Calendar", icono: "📅", popular: true },
  { id: "outlook", nombre: "Microsoft Outlook", icono: "📧", popular: true },
  { id: "calendly", nombre: "Calendly", icono: "🗓️", popular: false },
  { id: "zoom", nombre: "Zoom", icono: "📹", popular: true },
]

export const TEMPLATES_AUTOMATIZACION_AGENDA = [
  {
    nombre: "Confirmación Automática",
    descripcion: "Envía confirmación inmediata cuando se agenda una cita",
    trigger: "Cita agendada",
    accion: "Enviar confirmación",
    popular: true,
  },
  {
    nombre: "Recordatorio 24h",
    descripcion: "Envía recordatorio 24 horas antes de la reunión",
    trigger: "Recordatorio enviado",
    accion: "Enviar recordatorio",
    popular: true,
  },
  {
    nombre: "Gestión de No Show",
    descripcion: "Registra automáticamente cuando alguien no asiste",
    trigger: "No show detectado",
    accion: "Registrar no show",
    popular: false,
  },
  {
    nombre: "Reprogramación Inteligente",
    descripcion: "Ofrece nuevos horarios cuando se cancela una cita",
    trigger: "Cita cancelada",
    accion: "Reprogramar automáticamente",
    popular: true,
  },
]
