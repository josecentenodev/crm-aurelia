"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import type { WebHookEventPayload } from "@/services/evolution-api-types"

export function WebhookEventsViewer() {
  const [events, setEvents] = useState<WebHookEventPayload[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/webhook/evolution/events")
      if (res.ok) {
        const json = await res.json() as { events?: WebHookEventPayload[] } | WebHookEventPayload[]
        const next = Array.isArray(json) ? json : (json.events ?? [])
        setEvents(next)
      }
    } catch (err) {
      console.error("Error cargando eventos", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Últimos eventos recibidos</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refrescar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {events.length === 0 && (
          <p className="text-sm text-gray-500">No se han recibido eventos aún.</p>
        )}

        {events.length > 0 && events.map((evt, idx) => (
          <div key={idx} className="p-3 border rounded-lg bg-gray-50 text-sm">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{evt.event}</Badge>
              <span className="text-gray-400 text-xs">
                {new Date(evt.createdAt as string).toLocaleString()}
              </span>
            </div>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(evt.data, null, 2)}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
