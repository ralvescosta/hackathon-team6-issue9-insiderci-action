export interface ILogger {
  info: (message: string) => void
  debug: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

export interface GitHubRelease {
  id: number
  tag_name: string
}

export interface BaseError {
  message: string
}

export interface Result<Right = any, Left = BaseError> {
  right?: Right,
  left?: Left
}

export interface Args {
  flags: string[]
    args: {
      version: string
      componentId: string
      email: string
      password: string
      save: string
      target: string
      technology: string
      security: string
      noFail: string
      githubWorkspacePath: string
  }
}

export interface IHttpClient {
  get (resource: string): Promise<Result<any>>
}
export interface ICache {
  getTool: (configuredRelease: GitHubRelease, runtime: string) => Promise<Result<string>>
  extract: (osPlatform: string, downloadedPath: string) => Promise<Result<string>>
  cache: (extractionPath: string, release: GitHubRelease, osPlatform: string) => Promise<Result<string>>
}
export interface IActionHelper {
  getActionArgs: () => any
  uploadArtifacts: (path: string) => Promise<Result>
}
