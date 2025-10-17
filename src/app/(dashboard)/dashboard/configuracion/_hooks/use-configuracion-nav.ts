import { useState, useCallback } from "react"
import type { ConfigSectionId } from "../_lib/constants"

export function useConfiguracionNav() {
  const [selectedSection, setSelectedSection] = useState<ConfigSectionId | null>(null)

  const navigateToSection = useCallback((sectionId: ConfigSectionId) => {
    setSelectedSection(sectionId)
  }, [])

  const navigateBack = useCallback(() => {
    setSelectedSection(null)
  }, [])

  return {
    selectedSection,
    navigateToSection,
    navigateBack,
    isInMainMenu: selectedSection === null
  }
}
