import { Logger } from './logger'
import { ActionHelper } from './action_helper'
import { InsiderCiInstaller } from './insiderci_installer'
import { Cache } from './cache'
import { HttpClient } from './http_client'

import * as core from '@actions/core'
import * as path from 'path'

const INSIDER_CI_RELEASE_URL = 'https://github.com/insidersec/insider/releases'
const INSIDER_CI_DOWNLOAD_URL = `${INSIDER_CI_RELEASE_URL}/download`

const runner = async () => {
  const logger = new Logger()
  const actionHelper = new ActionHelper(logger)
  const cache = new Cache(INSIDER_CI_DOWNLOAD_URL, logger)
  const httpClient = new HttpClient(INSIDER_CI_RELEASE_URL)
  const insiderCiInstaller = new InsiderCiInstaller(httpClient, cache, logger)

  logger.info('[2] - tcha tcha tcha!')
  const args = actionHelper.getActionArgs()
  if (args.left && !args.right) {
    return core.setFailed(args.left.message)
  }
  logger.info('[3] - tcha tcha tcha!')

  const insiderCi = await insiderCiInstaller.exec(args.right?.args.version!)
  if (insiderCi.left && !insiderCi.right) {
    return core.setFailed(insiderCi.left.message)
  }
  logger.info('[4] - tcha tcha tcha!')
  const insiderCiPath = path.dirname(insiderCi.right!)
  logger.info(`[5] - 📂 Using ${insiderCiPath} as working directory...`)
  logger.info(`📂 Using ${insiderCiPath} as working directory...`)
}

runner()
