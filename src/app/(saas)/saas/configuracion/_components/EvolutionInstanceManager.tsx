"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { QRCodeModal } from "./QRCodeModal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EvolutionWebhookConfig } from "./EvolutionWebhookConfig"
import { InstanceHeader } from "./InstanceHeader"
import { InstanceForm } from "./InstanceForm"
import { InstanceCard } from "./InstanceCard"
import { EmptyState } from "./EmptyState"
import { useInstanceManagement } from "./hooks/useInstanceManagement"
import type { Integration } from "@/domain/Integraciones"

interface EvolutionInstanceManagerProps {
  integration: Integration
  onUpdate: () => void
}

export function EvolutionInstanceManager({ integration, onUpdate }: EvolutionInstanceManagerProps) {
  const {
    state,
    actions,
    instances,
    maxInstances,
    currentInstances,
    canCreateMore,
    remainingInstances,
    mutations
  } = useInstanceManagement(integration, onUpdate)

  const handleToggleExpand = (instanceId: string) => {
    actions.setExpandedInstance(
      state.expandedInstance === instanceId ? null : instanceId
    )
  }

  const handleConnect = (instanceId: string) => {
    actions.setShowQRModal(instanceId)
  }

  const handleCloseQR = () => {
    actions.setShowQRModal(null)
  }

  const handleDelete = (instanceId: string) => {
    actions.setShowDeleteConfirm(instanceId)
  }

  const handleConfirmDelete = async () => {
    if (state.showDeleteConfirm) {
      await actions.deleteInstance(state.showDeleteConfirm)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con información de límites */}
      <InstanceHeader
        currentInstances={currentInstances}
        maxInstances={maxInstances}
        remainingInstances={remainingInstances}
        canCreateMore={canCreateMore}
        onCreateNew={() => actions.setShowCreateForm(true)}
      />

      {/* Alerta si no se pueden crear más instancias */}
      {!canCreateMore && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Has alcanzado el límite máximo de {maxInstances} instancias para esta integración. 
            Elimina una instancia existente o actualiza tu plan para crear más.
          </AlertDescription>
        </Alert>
      )}

      {/* Formulario de creación */}
      {state.showCreateForm && (
        <InstanceForm
          formData={state.formData}
          isCreating={state.isCreatingInstance}
          canCreateMore={canCreateMore}
          onFormDataChange={actions.updateFormData}
          onCreateInstance={actions.createInstance}
          onCancel={() => actions.setShowCreateForm(false)}
        />
      )}

      {/* Lista de instancias */}
      {instances.length === 0 ? (
        <EmptyState
          canCreateMore={canCreateMore}
          onCreateNew={() => actions.setShowCreateForm(true)}
        />
      ) : (
        <div className="grid gap-4">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              isExpanded={state.expandedInstance === instance.id}
              isDisconnecting={mutations.disconnectInstance.isPending}
              isDeleting={mutations.deleteInstance.isPending}
              onToggleExpand={handleToggleExpand}
              onConnect={handleConnect}
              onDisconnect={actions.disconnectInstance}
              onDelete={handleDelete}
              onShowWebhookConfig={actions.setShowWebhookConfig}
            />
          ))}
        </div>
      )}

      {/* Modal para mostrar QR */}
      {state.showQRModal && (
        <QRCodeModal
          instanceId={state.showQRModal}
          isOpen={!!state.showQRModal}
          onClose={handleCloseQR}
          onSuccess={actions.handleConnected}
        />
      )}

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        open={!!state.showDeleteConfirm}
        onOpenChange={(open) => !open && actions.setShowDeleteConfirm(null)}
        title="Eliminar Instancia"
        description="¿Estás seguro de que quieres eliminar esta instancia? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />

      {/* Modal para configuración de webhooks */}
      {state.showWebhookConfig && (
        <EvolutionWebhookConfig
          instanceId={state.showWebhookConfig}
          instanceName={instances.find(i => i.id === state.showWebhookConfig)?.instanceName ?? ""}
          clientId={integration.clientIntegration?.clientId}
          isOpen={!!state.showWebhookConfig}
          onClose={() => actions.setShowWebhookConfig(null)}
        />
      )}
    </div>
  )
}
