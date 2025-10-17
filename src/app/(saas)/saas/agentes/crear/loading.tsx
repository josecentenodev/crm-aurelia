export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="mt-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  )
} 