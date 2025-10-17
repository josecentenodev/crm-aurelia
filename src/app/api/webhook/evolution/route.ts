import { NextResponse } from "next/server"

// memoria en runtime (se pierde en cada redeploy)
let lastEvents: any[] = []

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("🌐 Webhook recibido:", body)

    // guardamos en memoria para debug visual
    lastEvents.unshift({
      timestamp: new Date().toISOString(),
      body,
    })
    // limitamos a 20 eventos
    lastEvents = lastEvents.slice(0, 20)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Error procesando webhook:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

// exportamos para leer desde la página de debug
export function getLastEvents() {
  return lastEvents
}
