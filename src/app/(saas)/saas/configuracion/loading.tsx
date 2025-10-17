import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui"

// TODO: ACA HAY UN LOADER!! EVALUAR SI DEBERIA EXTRAERSE EN SHARED 
// IMPORTANT: Hay un tema con como nextjs utiliza los loaders y los componentes de UI. ANALIZAR
export default function ConfiguracionLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-2xl" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm border-0">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-0">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
