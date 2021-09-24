import { Logger } from './logger'
import { ActionHelper } from './action_helper'
import { InsiderCiInstaller } from './insiderci_installer'
import { Cache } from './cache'
import { HttpClient } from './http_client'

import * as core from '@actions/core'
import * as path from 'path'

const runner = async () => {
  console.log('[1] - tcha tcha tcha!')
  const logger = new Logger()
  const actionHelper = new ActionHelper(logger)
  const cache = new Cache('https://github.com/insidersec/insider/releases/download')
  const httpClient = new HttpClient('https://github.com/insidersec/insiderci/releases')
  const insiderCiInstaller = new InsiderCiInstaller(httpClient, cache, logger)
  console.log('[2] - tcha tcha tcha!')

  const args = actionHelper.getActionArgs()
  if (args.left && !args.right) {
    return core.setFailed(args.left.message)
  }
  console.log('[3] - tcha tcha tcha!')

  const insiderCi = await insiderCiInstaller.exec(args.right?.args.version!)
  if (insiderCi.left && !insiderCi.right) {
    return core.setFailed(insiderCi.left.message)
  }
  console.log('[4] - tcha tcha tcha!')
  const insiderCiPath = path.dirname(insiderCi.right!)
  console.log(`[5] - 📂 Using ${insiderCiPath} as working directory...`)
  logger.info(`📂 Using ${insiderCiPath} as working directory...`)
}

runner()
