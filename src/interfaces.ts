export interface ILogger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

export interface IHttpClient {
  get: (resource: string) => Promise<any>
}
