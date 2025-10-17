/**
 * Banner que se muestra cuando la IA está activa
 * Informa al usuario que la IA está manejando la conversación
 */

"use client"

import { Card, CardContent } from "@/components/ui"
import { Bot, Sparkles } from "lucide-react"

interface AIActiveBannerProps {
  isActive: boolean
}

export function AIActiveBanner({ isActive }: AIActiveBannerProps) {
  if (!isActive) return null

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-green-800">IA Activa</h3>
              <Sparkles className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-green-700 mt-1">
              La inteligencia artificial está manejando esta conversación automáticamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
