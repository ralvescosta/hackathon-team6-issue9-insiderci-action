import { Logger } from './logger'
import { ActionHelper } from './action_helper'
import { InsiderCiInstaller } from './insiderci_installer'
import { Cache } from './cache'
import { HttpClient } from './http_client'

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

const INSIDER_CI_RELEASE_URL = 'https://github.com/insidersec/insiderci/releases'
const INSIDER_CI_DOWNLOAD_URL = `${INSIDER_CI_RELEASE_URL}/download`

const runner = async () => {
  const logger = new Logger()
  const actionHelper = new ActionHelper(logger)
  const cache = new Cache(INSIDER_CI_DOWNLOAD_URL, logger)
  const httpClient = new HttpClient(INSIDER_CI_RELEASE_URL)
  const insiderCiInstaller = new InsiderCiInstaller(httpClient, cache, logger)

  const args = actionHelper.getActionArgs()
  if (args.left && !args.right) {
    return core.setFailed(args.left.message)
  }

  const insiderCi = await insiderCiInstaller.exec(args.right?.args.version!)
  if (insiderCi.left && !insiderCi.right) {
    return core.setFailed(insiderCi.left.message)
  }

  const insiderCiPath = path.dirname(insiderCi.right!)
  logger.info(`📂 Using ${insiderCiPath} as working directory...`)
  // process.chdir(insiderCiPath)

  logger.info(`${insiderCi.right} ${args.right?.flags}`)
  // logger.info('🏃 Running Insider CI...')
  // await exec.exec(`${insiderCi.right}`, args.right?.flags)
  // logger.info(' Finished Insider')

  actionHelper.uploadArtifacts(args.right?.args.githubWorkspacePath!)
}

runner()
