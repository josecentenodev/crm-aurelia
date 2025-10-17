import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function LoadingPage() {
  return (
    <div className="flex space-x-8">
      {/* Sidebar skeleton */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-6">
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="border-0 bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-3" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Progress skeleton */}
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                
                <Skeleton className="w-full h-2 rounded-full" />

                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="w-12 h-5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview skeleton */}
          <div className="mt-6">
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-8 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 space-y-8">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-28" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="border-b pb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <div key={j} className="mb-2">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
} 