import { GitHubRelease, ICache, Result } from './interfaces'
import toolCache from '@actions/tool-cache'
import path from 'path'

export class Cache implements ICache {
  constructor (private readonly baseURL: string) {}

  public async getTool (configuredRelease: GitHubRelease, runtime: string): Promise<Result<string>> {
    const url = `${this.baseURL}${configuredRelease.tag_name}/${runtime}`
    try {
      const result = await toolCache.downloadTool(url)
      return { right: result }
    } catch (error) {
      return { left: new Error('' + error) }
    }
  }

  async extract (osPlatform: string, downloadedPath: string): Promise<Result<string>> {
    try {
      if (osPlatform === 'win32') {
        const result = await toolCache.extractZip(downloadedPath)
        return { right: result }
      }

      const result = await toolCache.extractTar(downloadedPath)
      return { right: result }
    } catch (error) {
      return { left: new Error('' + error) }
    }
  }

  async cache (extractedPath: string, release: GitHubRelease, osPlatform: string): Promise<Result<string>> {
    const cachePath: string = await toolCache.cacheDir(
      extractedPath,
      'insiderci-action',
      release!.tag_name
    )

    const execPath = path.join(
      cachePath,
      osPlatform === 'win32' ? 'insiderci.exe' : 'insiderci'
    )

    return { right: execPath }
  }
}
