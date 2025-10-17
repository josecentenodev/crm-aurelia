"use client"

import { useState } from "react"
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@/components/ui"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui"
import { Filter, X, RotateCcw } from "lucide-react"
import { useChatsFiltersStore } from "../../../_store/chats-filters-store"
import type { ConversationStatus, ContactChannel } from "@/domain/Conversaciones"

interface ChatsFiltersDialogProps {
  instances?: Array<{ id: string; instanceName: string; phoneNumber?: string | null }>
}

export function ChatsFiltersDialog({ instances = [] }: ChatsFiltersDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    statusFilter,
    channelFilter,
    instanceFilter,
    phoneNumberFilter,
    setStatusFilter,
    setChannelFilter,
    setInstanceFilter,
    setPhoneNumberFilter,
    clearFilters,
    resetToDefaults
  } = useChatsFiltersStore()

  const hasActiveFilters = statusFilter || channelFilter || instanceFilter || phoneNumberFilter

  const statusOptions = [
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'PAUSADA', label: 'Pausada' },
    { value: 'FINALIZADA', label: 'Finalizada' },
    { value: 'ARCHIVADA', label: 'Archivada' },
  ]

  const channelOptions = [
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'TELEGRAM', label: 'Telegram' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'FACEBOOK', label: 'Facebook' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl border-gray-300 relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-purple-600 text-white text-xs rounded-full">
              !
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filtros Avanzados</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpiar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefaults}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Configura filtros avanzados para encontrar conversaciones específicas. Los filtros se aplican automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtro por Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value as ConversationStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Canal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Canal</label>
            <Select value={channelFilter || 'all'} onValueChange={(value) => setChannelFilter(value === 'all' ? undefined : value as ContactChannel)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los canales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                {channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Instancia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Instancia</label>
              {instanceFilter && (
                <span className="text-xs text-gray-500">Solo este grupo</span>
              )}
            </div>
            <Select value={instanceFilter || 'all'} onValueChange={(value) => setInstanceFilter(value === 'all' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las instancias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las instancias</SelectItem>
                {instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id}>
                    {instance.instanceName}
                    {instance.phoneNumber && ` (${instance.phoneNumber})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Filtra para ver solo las conversaciones de una instancia específica
            </p>
          </div>

          {/* Filtro por Número de Teléfono */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Número de Teléfono</label>
            <Input
              placeholder="Buscar por número de teléfono..."
              value={phoneNumberFilter || ''}
              onChange={(e) => setPhoneNumberFilter(e.target.value || undefined)}
              className="rounded-xl"
            />
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-gray-700 mb-2">Filtros activos:</div>
              <div className="flex flex-wrap gap-2">
                {statusFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Estado: {statusOptions.find(o => o.value === statusFilter)?.label}
                  </Badge>
                )}
                {channelFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Canal: {channelOptions.find(o => o.value === channelFilter)?.label}
                  </Badge>
                )}
                {instanceFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Instancia: {instances.find(i => i.id === instanceFilter)?.instanceName}
                  </Badge>
                )}
                {phoneNumberFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Teléfono: {phoneNumberFilter}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
