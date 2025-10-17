/**
 * Formulario de creación de oportunidades
 * Permite crear nuevas oportunidades con todos sus campos
 */

"use client"

import { useState } from "react"
import { Card } from "@/components/ui"
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from "@/components/ui"
import type { OpportunityCreateFormProps } from "../../../_types"

export function OpportunityCreateForm({
  contacts,
  boardPipelines,
  sellers = [],
  onCreate,
  onCancel,
  isCreating = false,
}: OpportunityCreateFormProps) {
  const [newContactId, setNewContactId] = useState<string>("")
  const [newTitle, setNewTitle] = useState<string>("")
  const [newAmount, setNewAmount] = useState<string>("")
  const [newPipelineId, setNewPipelineId] = useState<string>("")
  const [newStageId, setNewStageId] = useState<string>("")
  const [newAssignedUserId, setNewAssignedUserId] = useState<string>("")
  const [newExpectedCloseDate, setNewExpectedCloseDate] = useState<string>("")

  const selectedPipeline = boardPipelines.find((p) => p.id === newPipelineId)
  const availableStages = selectedPipeline?.stages ?? []

  const handleSubmit = () => {
    if (!newTitle.trim() || !newContactId) return

    onCreate({
      contactId: newContactId,
      title: newTitle.trim(),
      amount: newAmount,
      pipelineId: newPipelineId || undefined,
      stageId: newStageId || undefined,
      assignedUserId: newAssignedUserId || undefined,
      expectedCloseDate: newExpectedCloseDate || undefined,
    })
  }

  return (
    <Card className="p-4">
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          {/* Contacto */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="contacto">Contacto</Label>
            <Select value={newContactId} onValueChange={setNewContactId}>
              <SelectTrigger id="contacto">
                <SelectValue placeholder="Selecciona contacto" />
              </SelectTrigger>
              <SelectContent>
                {contacts.length === 0 ? (
                  <SelectItem value="__no_contacts__" disabled>
                    No hay contactos disponibles
                  </SelectItem>
                ) : (
                  contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-500 min-h-[20px] block">
              {contacts.length > 0 ? `${contacts.length} contactos disponibles` : "\u00A0"}
            </span>
          </div>

          {/* Título */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej. Propuesta sitio web"
              autoComplete="off"
            />
            <span className="min-h-[20px] block" aria-hidden="true"></span>
          </div>

          {/* Monto */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Ej. 120000"
              autoComplete="off"
              inputMode="numeric"
            />
            <span className="min-h-[20px] block" aria-hidden="true"></span>
          </div>

          {/* Pipeline */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="pipeline">Pipeline</Label>
            <Select
              value={newPipelineId}
              onValueChange={(v) => {
                setNewPipelineId(v)
                setNewStageId("")
              }}
            >
              <SelectTrigger id="pipeline">
                <SelectValue placeholder="Selecciona pipeline" />
              </SelectTrigger>
              <SelectContent>
                {boardPipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="min-h-[20px] block" aria-hidden="true"></span>
          </div>

          {/* Etapa */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="etapa">Etapa</Label>
            <Select
              value={newStageId}
              onValueChange={setNewStageId}
              disabled={!newPipelineId}
            >
              <SelectTrigger id="etapa">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {availableStages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="min-h-[20px] block" aria-hidden="true"></span>
          </div>

          {/* Vendedor asignado */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="vendedor">Vendedor</Label>
            <Select value={newAssignedUserId} onValueChange={setNewAssignedUserId}>
              <SelectTrigger id="vendedor">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {sellers.length === 0 ? (
                  <SelectItem value="__no_users__" disabled>
                    No hay usuarios
                  </SelectItem>
                ) : (
                  sellers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <span className="min-h-[20px] block" aria-hidden="true"></span>
          </div>

          {/* Fecha de cierre tentativa */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="fecha-cierre">Fecha límite</Label>
            <Input
              id="fecha-cierre"
              type="date"
              value={newExpectedCloseDate}
              onChange={(e) => setNewExpectedCloseDate(e.target.value)}
              autoComplete="off"
            />
            <span className="min-h-[20px] block" aria-hidden="true"></span>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!newTitle.trim() || !newContactId || isCreating}
          >
            {isCreating ? "Creando..." : "Crear"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

