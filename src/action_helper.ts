import { Args, IActionHelper, ILogger, Result } from './interfaces'
import * as path from 'path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

export class ActionHelper implements IActionHelper {
  constructor (private readonly _logger: ILogger) {}
  public getActionArgs (): Result<Args> {
    this._logger.info('****** Reading action args... ******')
    let githubWorkspacePath = process.env.GITHUB_WORKSPACE
    if (!githubWorkspacePath) {
      return { left: new Error('GITHUB_WORKSPACE not defined') }
    }
    githubWorkspacePath = path.resolve(githubWorkspacePath)

    const technology = core.getInput('technology')
    const componentId = core.getInput('applicationId')
    if (!technology && !componentId) {
      return { left: new Error('You need to set technology or applicationId variable') }
    }

    const version = core.getInput('version')
    const email = core.getInput('email')
    const password = core.getInput('password')
    const save = core.getInput('save')
    const target = core.getInput('target')
    const security = core.getInput('security')
    const noFail = core.getInput('noFail')

    githubWorkspacePath = path.resolve(githubWorkspacePath, target)

    return this._toArgsResponse({ version, componentId, email, password, save, target, technology, security, noFail, githubWorkspacePath })
  }

  public actionFail (error: string | Error): void {
    core.setFailed(error)
  }

  public async exec (command: string, args: string[]): Promise<Result<number>> {
    this._logger.info('****** 🏃 Running Insider CI... ******')
    try {
      const result = await exec.exec(command, args)
      return { right: result }
    } catch (error) {
      this._logger.error('****** Your Application have some security problems ******')
      return { left: new Error('Your Application have some security problems') }
    }
  }

  private _toArgsResponse ({ version, componentId, email, password, save, target, technology, security, noFail, githubWorkspacePath }: {[Key: string]: string}): Result<Args> {
    const flags = ['-email', email, '-password', password, '-score', security]

    if (noFail) {
      flags.push('-no-fail')
    }

    if (componentId) {
      flags.push('-component', componentId)
    } else {
      flags.push('-tech', technology)
    }

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
