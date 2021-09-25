import { Logger } from './logger'
import { ActionHelper } from './action_helper'
import { InsiderCiInstaller } from './insiderci_installer'
import { Cache } from './cache'
import { HttpClient } from './http_client'
import { ZipeFiles } from './zip'

import * as core from '@actions/core'
import * as exec from '@actions/exec'

const INSIDER_CI_RELEASE_URL = 'https://github.com/insidersec/insiderci/releases'
const INSIDER_CI_DOWNLOAD_URL = `${INSIDER_CI_RELEASE_URL}/download`

const runner = async () => {
  const logger = new Logger()
  const actionHelper = new ActionHelper(logger)
  const cache = new Cache(INSIDER_CI_DOWNLOAD_URL, logger)
  const httpClient = new HttpClient(INSIDER_CI_RELEASE_URL)
  const insiderCiInstaller = new InsiderCiInstaller(httpClient, cache, logger)
  const zipFiles = new ZipeFiles(logger)

  const args = actionHelper.getActionArgs()
  if (args.left && !args.right) {
    return core.setFailed(args.left.message)
  }

  const insiderCi = await insiderCiInstaller.exec(args.right?.args.version!)
  if (insiderCi.left && !insiderCi.right) {
    return core.setFailed(insiderCi.left.message)
  }

  const zipPath = await zipFiles.zip(args.right?.args.githubWorkspacePath!)
  if (zipPath.left && !zipPath.right) {
    return core.setFailed(zipPath.left.message)
  }

  args.right!.flags.push(zipPath.right!)

  logger.info('****** 🏃 Running Insider CI... ******')
  try {
    await exec.exec(`${insiderCi.right}`, args.right?.flags)
  } catch (error) {
    logger.error(`${error}`)
    return core.setFailed(`${error}`)
  }

  logger.info('******  Finished Insider ******')
}

runner()
