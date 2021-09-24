import { ILogger } from './interfaces'
import * as path from 'path'
import * as core from '@actions/core'

export class ActionHelper {
  constructor (private readonly _logger: ILogger) {}
  public getArguments (): string[] {
    let githubWorkspacePath = process.env.GITHUB_WORKSPACE
    if (!githubWorkspacePath) {
      throw new Error('GITHUB_WORKSPACE not defined')
    }
    githubWorkspacePath = path.resolve(githubWorkspacePath)
    this._logger.debug(`GITHUB_WORKSPACE = '${githubWorkspacePath}'`)

    const technology = core.getInput('technology')
    const target = core.getInput('target') || '.'
    const security = core.getInput('security')
    const noJson = core.getInput('noJson')
    const noHtml = core.getInput('noHtml')
    const noBanner = core.getInput('noBanner')

    githubWorkspacePath = path.resolve(githubWorkspacePath, target)

    // required flags
    const args = ['-tech', technology, '-target', githubWorkspacePath]

    if (security) {
      args.push('-security', security)
    }
    if (noJson) {
      args.push('-no-json')
    }
    if (noHtml) {
      args.push('-no-html')
    }
    if (noBanner) {
      args.push('-no-banner')
    }

    return args
  }
}
