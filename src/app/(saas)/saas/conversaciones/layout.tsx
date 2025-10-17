import type React from "react"

interface ChatsLayoutProps {
  children: React.ReactNode
}

export default function ChatsLayout({ children }: ChatsLayoutProps) {
  return <>{children}</>
}