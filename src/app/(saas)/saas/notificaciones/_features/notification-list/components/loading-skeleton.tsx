"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { NOTIFICATION_CONFIG } from "../../../_lib"

/**
 * Skeleton de carga para la lista de notificaciones
 */
export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: NOTIFICATION_CONFIG.ui.skeletonCount }).map(
        (_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}
