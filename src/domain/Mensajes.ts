import { z } from "zod"

// Tipos para los mensajes del chat (renombrados para evitar conflictos con Prisma)
export type ChatMessageType = "user" | "assistant" | "system"

export type ChatMessageRole = "user" | "assistant" | "system"

export type ChatMessageSenderType = "contact" | "agent" | "user"

// Schema para mensajes del playground
export const PlaygroundMessageSchema = z.object({
  id: z.string(),
  type: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.date(),
  feedback: z.enum(["positive", "negative"]).optional().nullable(),
  isLoading: z.boolean().optional()
})

export type PlaygroundMessage = z.infer<typeof PlaygroundMessageSchema>

// Props para el componente de chat del playground
export interface PlaygroundChatProps {
  assistantName: string
  assistantAvatar?: string
  initialMessages?: PlaygroundMessage[]
  onFeedbackSubmit?: (message: PlaygroundMessage, correctedAnswer?: string) => void
  className?: string
}

// Metadata para mensajes
export interface MessageMetadata {
  attachments?: Array<{
    type: "image" | "document" | "audio" | "video"
    url: string
    name: string
    size?: number
  }>
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  contact?: {
    name: string
    phone: string
    email?: string
  }
  quickReplies?: string[]
  buttons?: Array<{
    text: string
    value: string
    type: "reply" | "url" | "phone"
  }>
}