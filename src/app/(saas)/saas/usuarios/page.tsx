"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Label, Badge, Switch, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components"
import { UserCog, Plus, Search, Filter, Mail, Phone, Shield, Eye, Users, Crown, Settings, Trash2, Edit } from "lucide-react"

// TODO: ESTE COMPONENTE DEBE SER EXTRAIDO DEL ROUTER PRINCIPAL (LOGICA DE CRM) Y REFACTORIZAR.

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([
    {
      id: "1",
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan.perez@empresa.com",
      telefono: "+54 9 11 1234-5678",
      rol: "administrador",
      equipo: "Ventas",
      estado: "activo",
      ultimoAcceso: "Hace 2 horas",
      fechaCreacion: "15 Oct 2024",
      oportunidadesAsignadas: 12,
    },
    {
      id: "2",
      nombre: "María",
      apellido: "García",
      email: "maria.garcia@empresa.com",
      telefono: "+54 9 11 2345-6789",
      rol: "supervisor",
      equipo: "Ventas",
      estado: "activo",
      ultimoAcceso: "Hace 1 hora",
      fechaCreacion: "10 Oct 2024",
      oportunidadesAsignadas: 8,
    },
    {
      id: "3",
      nombre: "Carlos",
      apellido: "López",
      email: "carlos.lopez@empresa.com",
      telefono: "+54 9 11 3456-7890",
      rol: "vendedor",
      equipo: "Ventas",
      estado: "activo",
      ultimoAcceso: "Hace 30 min",
      fechaCreacion: "05 Oct 2024",
      oportunidadesAsignadas: 15,
    },
    {
      id: "4",
      nombre: "Ana",
      apellido: "Martínez",
      email: "ana.martinez@empresa.com",
      telefono: "+54 9 11 4567-8901",
      rol: "vendedor",
      equipo: "Ventas",
      estado: "inactivo",
      ultimoAcceso: "Hace 2 días",
      fechaCreacion: "01 Oct 2024",
      oportunidadesAsignadas: 5,
    },
  ])

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [filtroRol, setFiltroRol] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rol: "",
    equipo: "",
    activo: true,
  })

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchRol = filtroRol === "todos" || usuario.rol === filtroRol
    const matchEstado = filtroEstado === "todos" || usuario.estado === filtroEstado
    const matchBusqueda =
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase())
    return matchRol && matchEstado && matchBusqueda
  })

  const handleCrearUsuario = () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.rol) {
      return
    }

    const usuario = {
      id: Date.now().toString(),
      ...nuevoUsuario,
      estado: nuevoUsuario.activo ? "activo" : "inactivo",
      ultimoAcceso: "Nunca",
      fechaCreacion: new Date().toLocaleDateString("es-ES"),
      oportunidadesAsignadas: 0,
    }

    setUsuarios([...usuarios, usuario])
    setNuevoUsuario({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      rol: "",
      equipo: "",
      activo: true,
    })
    setMostrarFormulario(false)
  }

  const handleToggleEstado = (id: string) => {
    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id ? { ...usuario, estado: usuario.estado === "activo" ? "inactivo" : "activo" } : usuario,
      ),
    )
  }

  const handleEliminar = (id: string) => {
    setUsuarios(usuarios.filter((usuario) => usuario.id !== id))
  }

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "administrador":
        return "bg-red-100 text-red-800"
      case "supervisor":
        return "bg-blue-100 text-blue-800"
      case "vendedor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case "administrador":
        return <Crown className="w-4 h-4" />
      case "supervisor":
        return <Shield className="w-4 h-4" />
      case "vendedor":
        return <Users className="w-4 h-4" />
      default:
        return <UserCog className="w-4 h-4" />
    }
  }

  const getEstadoColor = (estado: string) => {
    return estado === "activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios y permisos de tu equipo de ventas</p>
        </div>
        <Button
          onClick={() => setMostrarFormulario(true)}
          className="bg-aurelia-primary hover:bg-purple-700 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
              <UserCog className="h-8 w-8 text-aurelia-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-red-600">
                  {usuarios.filter((u) => u.rol === "administrador").length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Supervisores</p>
                <p className="text-2xl font-bold text-blue-600">
                  {usuarios.filter((u) => u.rol === "supervisor").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendedores</p>
                <p className="text-2xl font-bold text-green-600">
                  {usuarios.filter((u) => u.rol === "vendedor").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario Nuevo Usuario */}
      {mostrarFormulario && (
        <Card className="rounded-2xl shadow-sm border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-aurelia-primary" />
              <span>Nuevo Usuario</span>
            </CardTitle>
            <CardDescription>Agrega un nuevo miembro a tu equipo de ventas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Nombre del usuario"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Apellido del usuario"
                    value={nuevoUsuario.apellido}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@empresa.com"
                    value={nuevoUsuario.email}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="+54 9 11 1234-5678"
                    value={nuevoUsuario.telefono}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select
                    value={nuevoUsuario.rol}
                    onValueChange={(value) => setNuevoUsuario({ ...nuevoUsuario, rol: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipo">Equipo</Label>
                  <Select
                    value={nuevoUsuario.equipo}
                    onValueChange={(value) => setNuevoUsuario({ ...nuevoUsuario, equipo: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ventas">Ventas</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Soporte">Soporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={nuevoUsuario.activo}
                    onCheckedChange={(checked) => setNuevoUsuario({ ...nuevoUsuario, activo: checked })}
                  />
                  <Label>Usuario activo</Label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button onClick={handleCrearUsuario} className="bg-aurelia-primary hover:bg-purple-700 rounded-xl">
                <UserCog className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
              <Button variant="outline" onClick={() => setMostrarFormulario(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger className="w-40 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="administrador">Administradores</SelectItem>
                  <SelectItem value="supervisor">Supervisores</SelectItem>
                  <SelectItem value="vendedor">Vendedores</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      <div className="space-y-4">
        {usuariosFiltrados.map((usuario) => (
          <Card key={usuario.id} className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre} ${usuario.apellido}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-aurelia-primary to-aurelia-secondary text-white">
                      {usuario.nombre.charAt(0)}
                      {usuario.apellido.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info Principal */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {usuario.nombre} {usuario.apellido}
                      </h3>
                      <Badge className={`${getRolColor(usuario.rol)} border-0`}>
                        {getRolIcon(usuario.rol)}
                        <span className="ml-1">{usuario.rol}</span>
                      </Badge>
                      <Badge className={`${getEstadoColor(usuario.estado)} border-0`}>{usuario.estado}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{usuario.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{usuario.telefono}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Equipo: {usuario.equipo}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs text-gray-500 mt-2">
                      <span>Oportunidades: {usuario.oportunidadesAsignadas}</span>
                      <span>•</span>
                      <span>Último acceso: {usuario.ultimoAcceso}</span>
                      <span>•</span>
                      <span>Creado: {usuario.fechaCreacion}</span>
                    </div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEstado(usuario.id)}
                    className="rounded-xl"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEliminar(usuario.id)}
                    className="rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información de Permisos */}
      <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-aurelia-primary">Permisos por Rol</CardTitle>
          <CardDescription>Comprende qué puede hacer cada tipo de usuario en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Administrador</h3>
                      <p className="text-sm text-gray-600">Acceso completo</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ver todas las oportunidades</li>
                    <li>• Gestionar usuarios</li>
                    <li>• Configurar automatizaciones</li>
                    <li>• Acceso a métricas globales</li>
                    <li>• Configurar integraciones</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Supervisor</h3>
                      <p className="text-sm text-gray-600">Gestión de equipo</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ver oportunidades del equipo</li>
                    <li>• Asignar leads a vendedores</li>
                    <li>• Métricas del equipo</li>
                    <li>• Gestionar conversaciones</li>
                    <li>• Reportes de rendimiento</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Vendedor</h3>
                      <p className="text-sm text-gray-600">Gestión personal</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Ver sus oportunidades</li>
                    <li>• Gestionar sus contactos</li>
                    <li>• Chat con leads asignados</li>
                    <li>• Métricas personales</li>
                    <li>• Actualizar estados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
