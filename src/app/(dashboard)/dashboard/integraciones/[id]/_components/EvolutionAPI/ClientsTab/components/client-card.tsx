"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ReactNode } from "react"

interface Props {
  client: { id: string; name: string }
  isActive: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  headerRight?: ReactNode
  children?: ReactNode
}

export function ClientCard({ client, isActive, isExpanded, onToggleExpand, headerRight, children }: Props) {
  return (
    <Card className="relative hover:shadow-lg transition-all duration-200 border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">{client.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">ID: {client.id}</p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
              {isActive ? "Activa" : "Inactiva"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onToggleExpand} className="h-8 w-8 p-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {headerRight}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}


