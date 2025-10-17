import React, { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReactNode } from 'react'

interface OptimizedCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  showHeader?: boolean
  showDescription?: boolean
}

export const OptimizedCard = memo(function OptimizedCard({
  title,
  description,
  children,
  className = '',
  headerClassName = '',
  contentClassName = '',
  showHeader = true,
  showDescription = true
}: OptimizedCardProps) {
  return (
    <Card className={className}>
      {showHeader && (title ?? description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle>{title}</CardTitle>}
          {showDescription && description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  )
}) 