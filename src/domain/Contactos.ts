// TODO: UNIFICAR TYPES 

export interface Contacto {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    company?: string
    status: "nuevo" | "calificado" | "agendado" | "cliente" | "descartado"
    source: "whatsapp" | "instagram" | "facebook" | "web"
    tags?: string[]
    created_at: string
}

export interface Contact {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  empresa?: string
  canal: string
  estado: string
  origen: string
  etiquetas: string[]
  notas?: string
  fechaCreacion: string
}

export interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
  onSave: (contact: Contact) => void
}