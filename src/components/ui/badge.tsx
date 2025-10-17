import * as React from "react"
import { cn } from "@/lib/utils/client-utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

  const variants = {
    default: "border-transparent bg-violet-600 text-white hover:bg-violet-700",
    secondary: "border-transparent bg-gray-200 text-gray-900 hover:bg-gray-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-yellow-700 border-yellow-300"
  }

  return (
    <div className={cn(baseClasses, variants[variant], className)} {...props} />
  )
}

export { Badge }
