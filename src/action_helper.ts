import { Args, IActionHelper, ILogger, Result } from './interfaces'
import * as path from 'path'
import * as core from '@actions/core'
import * as artifact from '@actions/artifact'
import * as glob from '@actions/glob'

export class ActionHelper implements IActionHelper {
  constructor (private readonly _logger: ILogger) {}
  public getActionArgs (): Result<Args> {
    let githubWorkspacePath = process.env.GITHUB_WORKSPACE
    if (!githubWorkspacePath) {
      return { left: new Error('GITHUB_WORKSPACE not defined') }
    }
    githubWorkspacePath = path.resolve(githubWorkspacePath)
    this._logger.debug(`GITHUB_WORKSPACE = '${githubWorkspacePath}'`)

    const technology = core.getInput('technology')
    const componentId = core.getInput('componentId')
    if (!technology && !componentId) {
      return { left: new Error('You need to set technology or componentId variable') }
    }

    const version = core.getInput('version') || 'latest'
    const email = core.getInput('email')
    const password = core.getInput('password')
    const save = core.getInput('save')
    const target = core.getInput('target') || '.'
    const security = core.getInput('security') || '0'
    const noFail = core.getInput('noFail')

    githubWorkspacePath = path.resolve(githubWorkspacePath, target)

    return this._toArgsResponse({ version, componentId, email, password, save, target, technology, security, noFail, githubWorkspacePath })
  }

  public async uploadArtifacts (path: string): Promise<Result> {
    const artifactClient = artifact.create()
    const artifactName = 'insiderci-artifact'

    const files = await this._getReportFiles()
    if (files.left && !files.right) {
      return files
    }

    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      files.right!,
      path,
      { continueOnError: false }
    )

    this._logger.info('[1] ****')
    this._logger.info(uploadResponse.artifactItems.join(','))
    this._logger.info('[2] ****')
    this._logger.info(uploadResponse.failedItems.join(','))
    this._logger.info('[3] ****')

    if (uploadResponse.failedItems.length > 0) {
      return { left: Error(`Error to upload artifacts: ${uploadResponse.failedItems}`) }
    }

    return { right: true }
  }

  private async _getReportFiles (): Promise<Result<string[]>> {
    const patterns = ['report-*.html', 'report-*.json']
    try {
      const globber = await glob.create(patterns.join('\n'))
      const files = await globber.glob()
      return { right: files }
    } catch (error) {
      return { left: new Error('' + error) }
    }
  }

  private _toArgsResponse ({ version, componentId, email, password, save, target, technology, security, noFail, githubWorkspacePath }: {[Key: string]: string}): Result<Args> {
    const flags = ['-email', email, '-password', password, '-score', security]

    if (save) {
      flags.push('-save')
    }
    if (noFail) {
      flags.push('-no-fail')
    }

    if (componentId) {
      flags.push('-component', componentId)
    } else {
      flags.push('-tech', technology)
    }

    flags.push(githubWorkspacePath)

    return {
      right: {
        flags,
        args: {
          version,
          componentId,
          email,
          password,
          save,
          target,
          technology,
          security,
          noFail,
          githubWorkspacePath
        }
      }
    }
  }
}
