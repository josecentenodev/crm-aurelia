"use client"

import { Switch } from "@/components/ui/switch"

interface Props {
  isActive: boolean
  disabled?: boolean
  onToggle: (enable: boolean) => void
}

export function IntegrationSwitch({ isActive, disabled, onToggle }: Props) {
  return (
    <Switch checked={isActive} onCheckedChange={onToggle} disabled={disabled} />
  )
}


