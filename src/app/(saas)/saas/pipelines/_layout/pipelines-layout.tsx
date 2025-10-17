/**
 * Layout principal del módulo de Pipelines
 * Componente orquestador que maneja la lógica principal y coordina todos los features
 */

"use client"

import { useState } from "react"
import { Button, Card, Badge } from "@/components/ui"
import { Plus, Palette, Loader2 } from "lucide-react"
import Link from "next/link"
import { SectionHeader } from "../../../../../components/ui/section-header"
import { KanbanBoard } from "../_features/kanban-board"
import { OpportunityCreateForm } from "../_features/opportunity-management"
import { BoardCustomizationPanel } from "../_features/board-customization"
import { usePipelineData, useOpportunityMutations, useDragAndDrop, useSellerUsers } from "../_hooks"

export function PipelinesLayout() {
  // UI State
  const [colWidth, setColWidth] = useState<number>(24)
  const [headerHeight, setHeaderHeight] = useState<number>(4)
  const [showCustomization, setShowCustomization] = useState<boolean>(false)
  const [showCreate, setShowCreate] = useState<boolean>(false)

  // Data & Business Logic
  const pipelineData = usePipelineData()
  const mutations = useOpportunityMutations()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { users: sellerUsers } = useSellerUsers()
  
  const { 
    handleDragEnd, 
    processedData, 
    pendingMoves,
    hasPendingMoves,
  } = useDragAndDrop(
    pipelineData.typedOpportunities,
    (opportunityId: string, toStageId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mutations.moveToStage.mutate({ opportunityId, toStageId })
    },
    pipelineData.unassigned,
    pipelineData.opportunitiesByStage,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    mutations.moveToStage.status
  )

  const handleCreateOpportunity = (data: {
    contactId: string
    title: string
    amount: string
    pipelineId?: string
    stageId?: string
    assignedUserId?: string
    expectedCloseDate?: string
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (mutations.createOpportunity.mutate as any)({
      clientId: pipelineData.clientId!,
      contactId: data.contactId,
      title: data.title,
      amount: Number(data.amount) > 0 ? Number(data.amount) : undefined,
      pipelineId: data.pipelineId,
      stageId: data.stageId,
      assignedUserId: data.assignedUserId,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={"CRM - Pipeline de Ventas"} 
        description={"Gestiona tus oportunidades, etapas y resultados"}
      >
        <div className="flex items-center gap-2">
          {/* Indicador de operaciones pendientes */}
          {hasPendingMoves && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {pendingMoves.length} operación{pendingMoves.length > 1 ? 'es' : ''} pendiente{pendingMoves.length > 1 ? 's' : ''}
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomization(!showCustomization)}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
          </Button>
          <Button
            className="bg-violet-500 hover:bg-purple-700 rounded-xl"
            onClick={() => setShowCreate(v => !v)}
            disabled={pipelineData.contacts.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Oportunidad
          </Button>
        </div>
      </SectionHeader>

      {pipelineData.contacts.length === 0 && !pipelineData.isLoading && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-sm">⚠️ No hay contactos disponibles. Debes crear contactos antes de poder crear oportunidades.</span>
            <Link href="/saas/contactos">
              <Button variant="outline" size="sm" className="text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                Ir a Contactos
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {showCreate && (
        <OpportunityCreateForm
          contacts={pipelineData.contacts}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          boardPipelines={pipelineData.board?.pipelines ?? []}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          sellers={sellerUsers as never}
          onCreate={handleCreateOpportunity}
          onCancel={() => setShowCreate(false)}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          isCreating={mutations.createOpportunity.status === 'pending'}
        />
      )}

      {showCustomization && (
        <BoardCustomizationPanel
          colWidth={colWidth}
          headerHeight={headerHeight}
          onColWidthChange={setColWidth}
          onHeaderHeightChange={setHeaderHeight}
          onClose={() => setShowCustomization(false)}
        />
      )}

      <div className="h-[calc(100vh-12rem)]">
        <KanbanBoard
          unassigned={processedData.unassigned}
          columns={pipelineData.stageColumns}
          opportunitiesByStage={processedData.opportunitiesByStage}
          onDragEnd={handleDragEnd}
          disableUnassignedDrop
          colWidthRem={colWidth}
          headerHeightRem={headerHeight}
        />
      </div>
    </div>
  )
}

