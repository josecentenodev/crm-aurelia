"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { CONFIG_SECTIONS, type ConfigSectionId } from "./_lib/constants"
import { useConfiguracionNav } from "./_hooks/use-configuracion-nav"
import { PermissionsFeature } from "./_features/permissions/permissions"
import { RolesFeature } from "./_features/roles/roles"
// Import other features when ready:
// import { PlansFeature } from "./_features/plans/plans"

/**
 * Main Configuration Page
 *
 * This page follows a feature-based modular architecture where each
 * configuration section is a self-contained feature with its own:
 * - Data fetching hooks
 * - UI components
 * - Business logic
 *
 * The page itself only handles navigation between features.
 */
export default function ConfiguracionPage() {
  const { selectedSection, navigateToSection, navigateBack, isInMainMenu } =
    useConfiguracionNav()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {isInMainMenu ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración del Sistema
            </h1>
            <p className="text-gray-600 mt-1">
              Administra la configuración global del sistema
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={navigateBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Menú
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {CONFIG_SECTIONS.find((s) => s.id === selectedSection)?.title}
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      {isInMainMenu ? (
        /* Main Menu - Feature Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONFIG_SECTIONS.map((section) => {
            const IconComponent = section.icon
            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-purple-300"
                onClick={() => navigateToSection(section.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconComponent className="w-5 h-5 mr-2" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{section.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Feature Content - Render Selected Feature */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {renderFeature(selectedSection)}
        </div>
      )}
    </div>
  )
}

/**
 * Render the selected feature component
 * Each feature is lazy-loaded and self-contained
 */
function renderFeature(sectionId: ConfigSectionId | null) {
  switch (sectionId) {
    case "permisos":
      return <PermissionsFeature />
    case "roles":
      return <RolesFeature />
    case "planes":
      // TODO: Implement PlansFeature following the same pattern
      return <PlaceholderFeature name="Planes" />
    default:
      return null
  }
}

/**
 * Temporary placeholder for features not yet refactored
 */
function PlaceholderFeature({ name }: { name: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {name} Feature
          </h3>
          <p className="text-gray-500">
            This feature is being refactored following the new modular
            architecture.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Check out the Permissions feature as a reference implementation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
