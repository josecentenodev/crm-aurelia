"use client"

import { useState } from "react"
import { Button, Input, Badge, Checkbox, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Search, Filter, Users, Plus, Mail, Phone, Calendar, Tag, Download, Upload, Trash2, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SectionHeader } from "../../../../components/ui/section-header"
import { type Contact, ContactStatus, ContactChannel, type CreateContact, type UpdateContact } from "@/domain/Contactos"
import { useContactosProvider } from "@/providers/ContactosProvider"
import { ContactTable } from "./_components/ContactTable"
import { ContactStats } from "./_components/ContactStats"
import { ContactFilters } from "./_components/ContactFilters"
import { ContactActions } from "./_components/ContactActions"
import { EmptyStateWrapper } from "./_components/EmptyStateWrapper"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { QuickEditContactModal } from "./_components/QuickEditContactModal"
import { api } from "@/trpc/react"

// TODO: REFACTORIZAR PAGINA DE CONTACTOS. ÉSTE SERÁ EL PUNTO DE PARTIDA PARA MEJORAR LA ESTRUCTURA Y FUNCIONALIDAD

export default function ContactosPage() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showQuickEditModal, setShowQuickEditModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<{ estado: ContactStatus | "todos"; canal: ContactChannel | "todos"; busqueda: string }>({
    estado: "todos",
    canal: "todos",
    busqueda: ""
  })

  // Provider hook
  const { 
    contactos: contacts = [], 
    isLoading, 
    error, 
    createContacto: createContact,
    updateContacto: updateContact,
    deleteContacto: deleteContact,
    isCreatingContacto,
    isUpdatingContacto,
    isDeletingContacto
  } = useContactosProvider()

  // Utils para invalidar cache
  const utils = api.useUtils()

  // Filtros y búsqueda
  const filteredContacts = contacts.filter((contact) => {
    const matchEstado = filters.estado === "todos" || contact.status === filters.estado
    const matchCanal = filters.canal === "todos" || contact.channel === filters.canal
    const matchBusqueda =
      contact.name?.toLowerCase().includes(filters.busqueda.toLowerCase()) ??
      contact.email?.toLowerCase().includes(filters.busqueda.toLowerCase()) ??
      contact.phone?.includes(filters.busqueda)
    return matchEstado && matchCanal && matchBusqueda
  })

  // Handlers
  const handleOpenContact = (contact: Contact | null) => {
    if (contact) {
      // Navegar a la página de edición completa
      router.push(`/saas/contactos/${contact.id}/editar`)
    } else {
      // Navegar a la página de creación
      router.push("/saas/contactos/nuevo")
    }
  }

  const handleQuickEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setShowQuickEditModal(true)
  }
  
  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact({ id })
      
      // Invalidar cache después de eliminar
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
      
      toast({ 
        title: "¡Contacto eliminado!", 
        description: "El contacto se ha eliminado correctamente.",
        variant: "success"
      })
    } catch (error: any) {
      console.error("Error al eliminar contacto:", error)
      
      let errorMessage = "No se pudo eliminar el contacto"
      if (error?.message) {
        if (error.message.includes("no encontrado")) {
          errorMessage = "El contacto ya no existe o ya fue eliminado"
        } else if (error.message.includes("permisos")) {
          errorMessage = "No tienes permisos para eliminar este contacto"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({ 
        title: "Error al eliminar contacto", 
        description: errorMessage, 
        variant: "destructive" 
      })
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    
    try {
      await Promise.all(selectedIds.map(id => deleteContact({ id })))
      
      // Invalidar cache después de eliminar múltiples
      await Promise.all([
        utils.contactos.list.invalidate(),
        utils.contactos.stats.invalidate()
      ])
      
      toast({ 
        title: "¡Contactos eliminados!", 
        description: `${selectedIds.length} contactos han sido eliminados correctamente.`,
        variant: "success"
      })
      
      // Limpiar selección
      setSelectedIds([])
    } catch (error: any) {
      console.error("Error al eliminar contactos múltiples:", error)
      
      let errorMessage = "Error al eliminar algunos contactos"
      if (error?.message) {
        if (error.message.includes("no encontrado")) {
          errorMessage = "Algunos contactos ya no existen o fueron eliminados previamente"
        } else if (error.message.includes("permisos")) {
          errorMessage = "No tienes permisos para eliminar algunos de estos contactos"
        } else {
          errorMessage = error.message
        }
      }
      
      toast({ 
        title: "Error al eliminar contactos", 
        description: errorMessage, 
        variant: "destructive" 
      })
    }
  }

  console.log("ContactosPage", {
    contacts,
    filteredContacts,
    isLoading,
    error,
    selectedIds,
  })

  return (
    <div className="space-y-6">
      <SectionHeader title="Contactos" description="Gestiona tu base de datos de contactos y leads" />
      
      <ContactActions 
        onCreate={() => handleOpenContact(null)} 
        selectedIds={selectedIds} 
        onDelete={handleDeleteSelected}
        isLoading={isDeletingContacto}
      />
      
      <ContactStats contacts={contacts} selectedIds={selectedIds} />
      <ContactFilters filters={filters} setFilters={setFilters} />
      
      <EmptyStateWrapper isEmpty={filteredContacts.length === 0} isLoading={isLoading} error={error ? (typeof error === 'string' ? error : error?.message || 'Error desconocido') : null}>
        <ContactTable
          contacts={filteredContacts}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEdit={handleOpenContact}
          onQuickEdit={handleQuickEdit}
          onDelete={handleDeleteContact}
        />
      </EmptyStateWrapper>

      {/* Modal de Edición Rápida */}
      <QuickEditContactModal
        contact={selectedContact}
        isOpen={showQuickEditModal}
        onClose={() => {
          setShowQuickEditModal(false)
          setSelectedContact(null)
        }}
        onSuccess={() => {
          // Refrescar la lista después de la edición
         void utils.contactos.list.invalidate()
        }}
      />
    </div>
  )
}
