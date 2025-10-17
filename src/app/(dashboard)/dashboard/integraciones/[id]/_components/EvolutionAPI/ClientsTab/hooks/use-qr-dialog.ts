"use client"

import { useState } from "react"

interface State {
  open: boolean
  instanceName?: string
  qrBase64?: string
  isConnected?: boolean
}

export function useQrDialog() {
  const [state, setState] = useState<State>({ open: false })

  function openWith(params: { instanceName?: string; qrBase64?: string }) {
    setState({ open: true, instanceName: params.instanceName, qrBase64: params.qrBase64, isConnected: false })
  }

  function setQr(qrBase64?: string) {
    setState((s) => ({ ...s, qrBase64 }))
  }

  function setConnected(connected: boolean) {
    setState((s) => ({ ...s, isConnected: connected, qrBase64: connected ? undefined : s.qrBase64 }))
  }

  function close() {
    setState({ open: false })
  }

  return { state, openWith, setQr, setConnected, close }
}


