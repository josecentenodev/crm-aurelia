"use client"

import { useState } from "react"
import { Button, Input, Badge, Checkbox, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components"
import { Search, Filter, Users, Plus, Mail, Phone, Calendar, Tag, Download, Upload, Trash2, Loader2, AlertCircle } from "lucide-react"
import { ContactModal } from "../_components/contact-modal"
import { useToast } from "@/hooks/use-toast"

// TODO: REFACTORIZAR PAGINA DE CONTACTOS. ÉSTE SERÁ EL PUNTO DE PARTIDA PARA MEJORAR LA ESTRUCTURA Y FUNCIONALIDAD

export default function ContactosPage() {
  const { toast } = useToast()

  // Mock data y funciones simuladas

  type Contacto = {
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

  const [contacts, setContacts] = useState<Contacto[]>([
    {
      id: "1",
      first_name: "Juan",
      last_name: "Pérez",
      email: "juan.perez@email.com",
      phone: "123456789",
      company: "Empresa A",
      status: "nuevo",
      source: "whatsapp",
      tags: ["Lead", "VIP"],
      created_at: "2024-05-01T10:00:00Z",
    },
    {
      id: "2",
      first_name: "Ana",
      last_name: "García",
      email: "ana.garcia@email.com",
      phone: "987654321",
      company: "Empresa B",
      status: "calificado",
      source: "instagram",
      tags: ["Cliente"],
      created_at: "2024-05-02T11:30:00Z",
    },
    {
      id: "3",
      first_name: "Carlos",
      last_name: "López",
      email: "carlos.lopez@email.com",
      phone: "555123456",
      company: "Empresa C",
      status: "cliente",
      source: "facebook",
      tags: ["Recurrente", "Newsletter", "Promoción"],
      created_at: "2024-05-03T09:15:00Z",
    },
    {
      id: "4",
      first_name: "Lucía",
      last_name: "Martínez",
      email: "lucia.martinez@email.com",
      phone: "444987654",
      company: "",
      status: "descartado",
      source: "web",
      tags: [],
      created_at: "2024-05-04T14:45:00Z",
    },
    {
      id: "5",
      first_name: "Pedro",
      last_name: "Sánchez",
      email: "pedro.sanchez@email.com",
      phone: "333222111",
      company: "Empresa D",
      status: "agendado",
      source: "whatsapp",
      tags: ["Demo"],
      created_at: "2024-05-05T16:20:00Z",
    },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createContact = async (contactData: Omit<Contacto, "id" | "created_at">) => {
    // Simula creación
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setContacts((prev) => [
          ...prev,
          {
            ...contactData,
            id: (Math.random() * 100000).toFixed(0),
            created_at: new Date().toISOString(),
          },
        ])
        resolve()
      }, 500)
    })
  }

  const updateContact = async (id: string, contactData: Partial<Contacto>) => {
    // Simula actualización
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...contactData } : c))
        )
        resolve()
      }, 500)
    })
  }

  const deleteContact = async (id: string) => {
    // Simula eliminación
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setContacts((prev) => prev.filter((c) => c.id !== id))
        resolve()
      }, 500)
    })
  }

  const deleteMultipleContacts = async (ids: string[]) => {
    // Simula eliminación múltiple
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setContacts((prev) => prev.filter((c) => !ids.includes(c.id)))
        resolve()
      }, 500)
    })
  }

  const [contactosSeleccionados, setContactosSeleccionados] = useState<string[]>([])
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroCanal, setFiltroCanal] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [contactToDelete, setContactToDelete] = useState(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Filtrar contactos
  const contactosFiltrados = contacts.filter((contacto) => {
    const matchEstado = filtroEstado === "todos" || contacto.status === filtroEstado
    const matchCanal = filtroCanal === "todos" || contacto.source === filtroCanal
    const matchBusqueda =
      contacto.first_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      contacto.last_name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      contacto.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      contacto.phone?.includes(busqueda)
    return matchEstado && matchCanal && matchBusqueda
  })

  const handleSeleccionarTodos = (checked: boolean) => {
    if (checked) {
      setContactosSeleccionados(contactosFiltrados.map((c) => c.id))
    } else {
      setContactosSeleccionados([])
    }
  }

  const handleSeleccionarContacto = (contactoId: string, checked: boolean) => {
    if (checked) {
      setContactosSeleccionados([...contactosSeleccionados, contactoId])
    } else {
      setContactosSeleccionados(contactosSeleccionados.filter((id) => id !== contactoId))
    }
  }

  const handleOpenContact = (contacto: any) => {
    setSelectedContact(contacto)
    setShowContactModal(true)
  }

  const handleCreateContact = () => {
    setSelectedContact(null)
    setShowContactModal(true)
  }

  const handleSaveContact = async (contactData: any) => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, contactData)
        toast({
          title: "Contacto actualizado",
          description: "El contacto se ha actualizado correctamente.",
        })
      } else {
        await createContact(contactData)
        toast({
          title: "Contacto creado",
          description: "El contacto se ha creado correctamente.",
        })
      }
      setShowContactModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al guardar el contacto.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContact = (contacto: any) => {
    setContactToDelete(contacto)
    setShowDeleteDialog(true)
  }

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true)
  }

  const confirmDeleteContact = async () => {
    if (contactToDelete) {
      setDeleting(true)
      try {
        await deleteContact(contactToDelete.id)
        toast({
          title: "Contacto eliminado",
          description: "El contacto se ha eliminado correctamente.",
        })
        setShowDeleteDialog(false)
        setContactToDelete(null)
      } catch (error) {
        toast({
          title: "Error",
          description: "Hubo un error al eliminar el contacto.",
          variant: "destructive",
        })
      } finally {
        setDeleting(false)
      }
    }
  }

  const confirmBulkDelete = async () => {
    setDeleting(true)
    try {
      await deleteMultipleContacts(contactosSeleccionados)
      toast({
        title: "Contactos eliminados",
        description: `Se han eliminado ${contactosSeleccionados.length} contactos correctamente.`,
      })
      setContactosSeleccionados([])
      setShowBulkDeleteDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar los contactos.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return "bg-blue-100 text-blue-800"
      case "calificado":
        return "bg-green-100 text-green-800"
      case "agendado":
        return "bg-purple-100 text-purple-800"
      case "descartado":
        return "bg-red-100 text-red-800"
      case "cliente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCanalColor = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "bg-green-100 text-green-800"
      case "instagram":
        return "bg-pink-100 text-pink-800"
      case "facebook":
        return "bg-blue-100 text-blue-800"
      case "web":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando contactos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error al cargar contactos</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de datos de contactos y leads</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-aurelia-primary hover:bg-purple-700 rounded-xl" onClick={handleCreateContact}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-aurelia-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {contacts.filter((c) => c.status === "nuevo").length}
                </p>
              </div>
              <span className="text-2xl">🆕</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calificados</p>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter((c) => c.status === "calificado").length}
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {contacts.filter((c) => c.status === "cliente").length}
                </p>
              </div>
              <span className="text-2xl">👑</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Seleccionados</p>
                <p className="text-2xl font-bold text-purple-600">{contactosSeleccionados.length}</p>
              </div>
              <span className="text-2xl">☑️</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje cuando no hay contactos */}
      {contacts.length === 0 && !loading && !error && (
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay contactos</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tu primer contacto para gestionar tu base de datos.</p>
            <Button className="bg-aurelia-primary hover:bg-purple-700 rounded-xl" onClick={handleCreateContact}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Contacto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resto del contenido solo si hay contactos */}
      {contacts.length > 0 && (
        <>
          {/* Filtros y Búsqueda */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre, email o teléfono..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-40 rounded-xl">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="nuevo">Nuevos</SelectItem>
                      <SelectItem value="calificado">Calificados</SelectItem>
                      <SelectItem value="agendado">Agendados</SelectItem>
                      <SelectItem value="cliente">Clientes</SelectItem>
                      <SelectItem value="descartado">Descartados</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filtroCanal} onValueChange={setFiltroCanal}>
                    <SelectTrigger className="w-40 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los canales</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Acciones masivas */}
              {contactosSeleccionados.length > 0 && (
                <div className="mt-4 p-4 bg-aurelia-primary/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-aurelia-primary">
                      {contactosSeleccionados.length} contactos seleccionados
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="rounded-xl">
                        Asignar Vendedor
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl">
                        Cambiar Estado
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl">
                        Exportar Selección
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl"
                        onClick={handleBulkDelete}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Eliminar Contactos
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabla de Contactos */}
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle>Lista de Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <Checkbox
                          checked={
                            contactosSeleccionados.length === contactosFiltrados.length && contactosFiltrados.length > 0
                          }
                          onCheckedChange={handleSeleccionarTodos}
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Contacto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Teléfono</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Canal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Origen</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Etiquetas</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha Creación</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactosFiltrados.map((contacto) => (
                      <tr
                        key={contacto.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOpenContact(contacto)}
                      >
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={contactosSeleccionados.includes(contacto.id)}
                            onCheckedChange={(checked) => handleSeleccionarContacto(contacto.id, checked as boolean)}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {contacto.first_name?.charAt(0) || ""}
                                {contacto.last_name?.charAt(0) || ""}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {contacto.first_name} {contacto.last_name}
                              </p>
                              <p className="text-sm text-gray-500">{contacto.company || "Sin empresa"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{contacto.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{contacto.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getCanalColor(contacto.source)} border-0`}>{contacto.source}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getEstadoColor(contacto.status)} border-0`}>{contacto.status}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{contacto.source}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {contacto.tags?.slice(0, 2).map((etiqueta, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {etiqueta}
                              </Badge>
                            ))}
                            {(contacto.tags?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(contacto.tags?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(contacto.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => handleOpenContact(contacto)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-xl"
                              onClick={() => handleDeleteContact(contacto)}
                              disabled={deleting}
                            >
                              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Mostrando {contactosFiltrados.length} de {contacts.length} contactos
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal de Contacto */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contact={selectedContact}
        onSave={handleSaveContact}
      />

      {/* Diálogo de confirmación para eliminar un contacto */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar a{" "}
              <span className="font-semibold">
                {contactToDelete?.first_name} {contactToDelete?.last_name}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-xl"
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteContact} className="rounded-xl" disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar múltiples contactos */}
      {showBulkDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación múltiple</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="font-semibold">{contactosSeleccionados.length} contactos</span>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex space-x-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteDialog(false)}
                className="rounded-xl"
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmBulkDelete} className="rounded-xl" disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  `Eliminar ${contactosSeleccionados.length} contactos`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
