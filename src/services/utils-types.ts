// ERROR HANDLING

export interface APIError {
  error: string;
  status_code?: number;
  details?: unknown;
  timestamp?: string;
}
