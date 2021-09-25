import { Logger } from './logger'
import { ActionHelper } from './action_helper'
import { InsiderCiInstaller } from './insiderci_installer'
import { Cache } from './cache'
import { HttpClient } from './http_client'

import AdmZip from 'adm-zip'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'

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
  const zip = new AdmZip()

  const files = await util.promisify(fs.readdir)(args.right?.args.githubWorkspacePath!)
  files.forEach(fileName => {
    const filePath = path.join(args.right?.args.githubWorkspacePath!, fileName)

    // const dir = path.dirname(fileName)
    const stats = fs.lstatSync(filePath)

    if (stats.isDirectory()) {
      // const zipDir = dir === '.' ? fileName : dir
      zip.addLocalFolder(filePath)
    } else {
      // const zipDir = dir === '.' ? '' : dir
      zip.addLocalFile(filePath)
    }
    console.log(`  - ${filePath}`)
  })

  const destPath = path.join(args.right?.args.githubWorkspacePath!, 'project.zip')
  zip.writeZip(destPath, (error) => logger.error(`${error}`))

  logger.info('[1]**')
  logger.info('**')
  logger.info(zip.getZipComment())
  logger.info('**')
  logger.info('**')

  args.right!.flags[args.right!.flags.length - 1] = destPath

  logger.info(`${insiderCi.right} ${args.right?.flags}`)
  logger.info('🏃 Running Insider CI...')
  try {
    await exec.exec(`${insiderCi.right}`, args.right?.flags)
  } catch (error) {
    logger.error(`${error}`)
  }

  logger.info(' Finished Insider')
}

runner()
