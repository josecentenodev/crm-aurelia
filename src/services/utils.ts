import type { APIError } from "./utils-types"

export const parseError = async function (response: Response): Promise<string> {
    try {
      const text = await response.text()
      try {
        const error = JSON.parse(text) as APIError
        return error.error || `HTTP ${response.status}`
      } catch {
        return `HTTP ${response.status}: ${text || 'no body'}`
      }
    } catch {
      return `HTTP ${response.status}`
    }
  }
