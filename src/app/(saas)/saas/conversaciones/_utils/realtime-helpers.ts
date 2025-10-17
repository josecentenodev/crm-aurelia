/**
 * Realtime helpers shared across hooks (backoff, guards)
 */

export function calculateReconnectDelay(retryCount: number, baseMs = 1000, maxMs = 30000): number {
  const delay = Math.min(baseMs * Math.pow(2, retryCount), maxMs)
  const jitter = Math.random() * 1000
  return delay + jitter
}

export function canAutoReconnect(canReconnect: boolean, isReconnecting: boolean, retryCount: number, maxRetries = 5): boolean {
  if (!canReconnect) return false
  if (isReconnecting) return false
  if (retryCount >= maxRetries) return false
  return true
}


