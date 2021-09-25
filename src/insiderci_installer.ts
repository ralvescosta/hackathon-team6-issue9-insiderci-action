import { IHttpClient, ILogger, ICache, Result } from './interfaces'
import * as os from 'os'

export class InsiderCiInstaller {
  private readonly _osPlatform: string
  private readonly _osArch: string

  constructor (
    private readonly _httpClient: IHttpClient,
    private readonly _cache: ICache,
    private readonly _logger: ILogger
  ) {
    this._osPlatform = os.platform()
    this._osArch = os.arch()
  }

  public async exec (version: string): Promise<Result<string>> {
    const release = await this._httpClient.get(version)
    if (release.left && !release.right) {
      this._logger.error('****** Something went wrong during the release check ******')
      return release
    }
    this._logger.info(`****** Insider CI version found: ${release.right!.tag_name} ******`)

    const runtimeInfo = this._getRuntimeInfo()

    this._logger.info('⬇️ Downloading Insider CI')
    const toolPath = await this._cache.getTool(release.right!, runtimeInfo)
    if (toolPath.left && !toolPath.right) {
      this._logger.error('****** Something went wrong during the download ******')
      return toolPath
    }

    this._logger.info('****** Extracting Insider CI... ******')
    const extractedPath = await this._cache.extract(this._osPlatform, toolPath.right!)
    if (extractedPath.left && !extractedPath.right) {
      this._logger.error('****** Something went wrong during the extract process******')
      return extractedPath
    }
    this._logger.info(`****** Extracted to ${extractedPath.right!} ******`)

    this._logger.info('****** Caching... ******')
    const cachedPath = await this._cache.cache(extractedPath.right!, release.right!, this._osPlatform)
    if (cachedPath.left && !cachedPath.right) {
      return cachedPath
    }
    this._logger.info(`****** Cached. Exe path is ${cachedPath.right!} ******`)

    return cachedPath
  }

  private _getRuntimeInfo () {
    const currentPlatform = this._osPlatform === 'win32' ? 'windows' : this._osPlatform
    const currentArch = this._osArch === 'x64' ? 'x86_64' : 'i386'
    const ext = this._osPlatform === 'win32' ? 'zip' : 'tar.gz'

    return `insiderci_${currentPlatform}_${currentArch}.${ext}`
  }
}
