import core from '@actions/core'
import { ILogger } from './interfaces'

export class Logger implements ILogger {
  public info (message: string): void {
    core.info(message)
  }

  public debug (message: string): void {
    core.debug(message)
  }

  public warn (message: string): void {
    core.warning(message)
  }

  public error (message: string): void {
    core.error(message)
  }
}
