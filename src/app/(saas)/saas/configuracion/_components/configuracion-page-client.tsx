"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { CreditCard, Users, Puzzle, Target } from "lucide-react"
import { SectionHeader } from "../../../../../components/ui/section-header"
import { IntegrationsTab } from "./tabs/integrations-tab"
import { UsersTab } from "./tabs/users-tab"
import { PipelinesTab } from "./tabs/pipelines-tab"
import { PlanTab } from "./tabs/plan-tab"
import type { ConfiguracionPageState } from "./types"

export function ConfiguracionPageClient() {
  const [activeTab, setActiveTab] = useState<ConfiguracionPageState["activeTab"]>("integraciones")

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader 
        title="Configuración" 
        description="Gestiona tu cuenta, plan, equipo e integraciones" 
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="integraciones" className="rounded-xl">
            <Puzzle className="w-4 h-4 mr-2" />
            Integraciones
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="rounded-xl">
            <Users className="w-4 h-4 mr-2" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="rounded-xl">
            <Target className="w-4 h-4 mr-2" />
            Pipelines
          </TabsTrigger>
          <TabsTrigger value="plan" className="rounded-xl">
            <CreditCard className="w-4 h-4 mr-2" />
            Plan y Facturación
          </TabsTrigger>
        </TabsList>

        {/* Integraciones Tab */}
        <TabsContent value="integraciones" className="space-y-6">
          <IntegrationsTab />
        </TabsContent>

        {/* Usuarios Tab */}
        <TabsContent value="usuarios" className="space-y-6">
          <UsersTab />
        </TabsContent>

        {/* Pipelines Tab */}
        <TabsContent value="pipelines" className="space-y-6">
          <PipelinesTab />
        </TabsContent>

        {/* Plan y Facturación Tab */}
        <TabsContent value="plan" className="space-y-6">
          <PlanTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
