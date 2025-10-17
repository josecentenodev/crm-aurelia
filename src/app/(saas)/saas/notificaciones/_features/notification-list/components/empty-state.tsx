"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bell } from "lucide-react"

/**
 * Estado vacío cuando no hay notificaciones
 */
export function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Bell className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">No hay notificaciones</p>
          <p className="text-sm">
            Cuando recibas notificaciones aparecerán aquí
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
