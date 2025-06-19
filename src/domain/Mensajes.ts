// Tipos para los mensajes
export type MessageType = "user" | "assistant"

export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  feedback?: "positive" | "negative" | null
  isLoading?: boolean
}

export interface PlaygroundChatProps {
  assistantName: string
  assistantAvatar?: string
  initialMessages?: Message[]
  onFeedbackSubmit?: (message: Message, correctedAnswer?: string) => void
  className?: string
}