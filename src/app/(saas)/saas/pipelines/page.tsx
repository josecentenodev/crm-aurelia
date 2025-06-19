"use client"

import { useState } from "react"
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components"
import { Plus, Settings, MoreVertical, User, Calendar } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { mockCrmData } from "@/server/api/mock-data"
import { ChatViewModal } from "../_components/chat-view-modal"
import { SectionHeader } from "../_components/header"

// TODO: REFACTORIZAR ESTE COMPONENTE, SEPARAR RESPONSABILIDADES, MEJORAR LA ESCALABILIDAD, MODULARIZAR EL CÓDIGO.

export default function CrmPage() {
  const [columnas, setColumnas] = useState(mockCrmData.columnas)
  const [oportunidades, setOportunidades] = useState(mockCrmData.oportunidades)
  const [oportunidadSeleccionada, setOportunidadSeleccionada] = useState<string | null>(null)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      // Mover entre columnas
      const oportunidad = oportunidades.find((op) => op.id === draggableId)
      if (oportunidad) {
        const nuevaColumna = columnas.find((col) => col.id === destination.droppableId)
        if (nuevaColumna) {
          setOportunidades(
            oportunidades.map((op) =>
              op.id === draggableId ? { ...op, estado: nuevaColumna.nombre.toLowerCase() } : op,
            ),
          )
        }
      }
    }
  }

  const getOportunidadesPorColumna = (columnaId: string) => {
    const columna = columnas.find((col) => col.id === columnaId)
    if (!columna) return []

    return oportunidades.filter((op) => op.estado.toLowerCase() === columna.nombre.toLowerCase())
  }

  const getValorTotalColumna = (columnaId: string) => {
    const oportunidadesColumna = getOportunidadesPorColumna(columnaId)
    return oportunidadesColumna.reduce((total, op) => total + op.valor, 0)
  }

  const oportunidadActual = oportunidades.find((op) => op.id === oportunidadSeleccionada)

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader title={"CRM - Pipeline de Ventas"}
        description={"Gestiona tus oportunidades de venta con vista Kanban"}>
        <Button variant="outline" className="rounded-xl">
          <Settings className="w-4 h-4 mr-2" />
          Configurar Pipeline
        </Button>
        <Button className="bg-aurelia-primary hover:bg-purple-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Oportunidad
        </Button>
      </SectionHeader>

      {/* Kanban Board */}
      <div className="h-[calc(100vh-12rem)]">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-6 h-full">
            {columnas.map((columna) => (
              <div key={columna.id} className="flex flex-col">
                {/* Header de Columna */}
                <Card className="rounded-2xl shadow-sm border-0 bg-white mb-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: columna.color }}></div>
                        <CardTitle className="text-sm font-medium">{columna.nombre}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {getOportunidadesPorColumna(columna.id).length}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">${getValorTotalColumna(columna.id).toLocaleString()}</p>
                  </CardHeader>
                </Card>

                {/* Droppable Area */}
                <Droppable droppableId={columna.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 p-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-gray-100" : ""
                        }`}
                    >
                      {getOportunidadesPorColumna(columna.id).map((oportunidad, index) => (
                        <Draggable key={oportunidad.id} draggableId={oportunidad.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`rounded-2xl shadow-sm border-0 bg-white cursor-pointer hover:shadow-md transition-all ${snapshot.isDragging ? "rotate-3 shadow-lg" : ""
                                } ${oportunidadSeleccionada === oportunidad.id ? "ring-2 ring-aurelia-primary" : ""}`}
                              onClick={() => setOportunidadSeleccionada(oportunidad.id)}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Header de la tarjeta */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-xs">
                                          {oportunidad.contacto.charAt(0)}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900 text-sm">{oportunidad.contacto}</p>
                                        <p className="text-xs text-gray-500">{oportunidad.empresa}</p>
                                      </div>
                                    </div>
                                    <Badge
                                      className="text-xs border-0"
                                      style={{
                                        backgroundColor: `${columna.color}20`,
                                        color: columna.color,
                                      }}
                                    >
                                      {oportunidad.estado}
                                    </Badge>
                                  </div>

                                  {/* Valor */}
                                  <div className="text-lg font-bold text-gray-900">
                                    ${oportunidad.valor.toLocaleString()}
                                  </div>

                                  {/* Información adicional */}
                                  <div className="space-y-2 text-xs text-gray-500">
                                    <div className="flex items-center space-x-2">
                                      <User className="w-3 h-3" />
                                      <span>Vendedor: {oportunidad.vendedor}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-3 h-3" />
                                      <span>Cierre: {oportunidad.fechaCierre}</span>
                                    </div>
                                  </div>

                                  {/* Progreso */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-500">Progreso</span>
                                      <span className="font-medium">{oportunidad.probabilidad}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-aurelia-primary h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${oportunidad.probabilidad}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modal de Chat */}
      {oportunidadSeleccionada && oportunidadActual && (
        <ChatViewModal
          conversacion={{
            id: oportunidadActual.id,
            nombreLead: oportunidadActual.contacto,
            canal: "WhatsApp",
            estado: oportunidadActual.estado,
            fechaUltimoMensaje: "Hoy",
            vendedorAsignado: oportunidadActual.vendedor,
          }}
          onClose={() => setOportunidadSeleccionada(null)}
        />
      )}
    </div>
  )
}
