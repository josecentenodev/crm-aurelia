import type { ReactNode } from "react"
import { memo } from "react"
import { Loader2, AlertCircle, Users } from "lucide-react"
import { Button } from "@/components/ui"

type Props = {
  isEmpty: boolean
  isLoading?: boolean
  error?: string | null | undefined
  children: ReactNode
  onRetry?: () => void
  emptyMessage?: string
}

export const EmptyStateWrapper = memo(function EmptyStateWrapper({ 
  isEmpty, 
  isLoading, 
  error, 
  children, 
  onRetry, 
  emptyMessage 
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }
  if (error && error !== "null" && error !== "undefined") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error al cargar datos</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
        </div>
      </div>
    )
  }
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin registros</h3>
        <p className="text-gray-500 mb-6">{emptyMessage ?? "No hay datos para mostrar."}</p>
      </div>
    )
  }
  return <>{children}</>
}) 