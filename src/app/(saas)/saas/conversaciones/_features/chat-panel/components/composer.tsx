/**
 * Composer para escribir mensajes
 * Incluye soporte para archivos y emojis
 */

"use client"

import { Button, Input } from "@/components/ui"
import { Send, Paperclip, Image, FileText } from "lucide-react"
import type { ComposerProps } from '../../../_types/conversations.types'
import { useState, useRef } from "react"

export function Composer({ disabled, onSend, onFileSelect }: ComposerProps) {
  const [showFileOptions, setShowFileOptions] = useState(false)
  const [value, setValue] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (type: 'image' | 'document') => {
    const inputRef = type === 'image' ? imageInputRef : fileInputRef
    const el = inputRef.current
    if (el) el.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = event.target.files?.[0]
    if (file && onFileSelect) onFileSelect(file, type)
    event.currentTarget.value = ''
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const content = value.trim()
    if (!disabled && content) {
      onSend(content)
      setValue("")
    }
  }

  return (
    <div className="border-t border-gray-100 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            placeholder={disabled ? "Para tomar conversación apagar IA" : "Escribe un mensaje..."}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            disabled={disabled}
            className={`rounded-xl ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />

          {/* Botón de adjuntar archivos */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => setShowFileOptions(!showFileOptions)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
            </Button>

            {/* Opciones de archivo */}
            {showFileOptions && !disabled && (
              <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleFileSelect('image')
                    setShowFileOptions(false)
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Adjuntar imagen"
                >
                  <Image className="w-4 h-4 text-green-600" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleFileSelect('document')
                    setShowFileOptions(false)
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title="Adjuntar documento"
                >
                  <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={disabled}
          className={`rounded-xl ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-violet-500 hover:bg-purple-700"}`}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Inputs ocultos para selección de archivos */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={(e) => handleFileChange(e, 'document')}
        className="hidden"
      />
    </div>
  )
}
