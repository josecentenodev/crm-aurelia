/**
 * Indicador de typing de IA
 * Muestra animación de typing cuando la IA está escribiendo
 */

"use client"

import { useState, useEffect } from "react"

interface AiTypingIndicatorProps {
  isTyping: boolean
  typingStartTime?: number | null
}

export function AiTypingIndicator({ isTyping, typingStartTime }: AiTypingIndicatorProps) {
  const [typingDuration, setTypingDuration] = useState(0)

  useEffect(() => {
    if (isTyping && typingStartTime) {
      const interval = setInterval(() => {
        setTypingDuration(Math.floor((Date.now() - typingStartTime) / 1000))
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setTypingDuration(0)
    }
  }, [isTyping, typingStartTime])

  if (!isTyping) return null

  return (
    <div className="flex gap-2 justify-start">
      <div className="flex gap-2 max-w-[70%] flex-row">
        <div className="flex-shrink-0 pt-0.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="rounded-2xl rounded-tl-sm px-4 py-2 bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">IA está escribiendo</span>
              {typingDuration > 0 && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  {typingDuration}s
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
