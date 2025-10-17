import { NextResponse } from "next/server"
import { getLastEvents } from "../route"

export async function GET() {
    const loseventos = getLastEvents()
    console.log(loseventos)
  return NextResponse.json({ events: loseventos })
}
