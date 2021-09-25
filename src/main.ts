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
  fs.readdir(args.right?.args.githubWorkspacePath!, (_err, files) => {
    if (_err) { return _err }

    if (!files) return false

    files.forEach(fileName => {
      const filePath = path.join(args.right?.args.githubWorkspacePath!, fileName)

      if (!fs.existsSync(filePath)) {
        console.log(`  - ${fileName} (Not Found)`)
        return
      }

      const dir = path.dirname(fileName)
      const stats = fs.lstatSync(filePath)

      if (stats.isDirectory()) {
        const zipDir = dir === '.' ? fileName : dir
        zip.addLocalFolder(filePath, zipDir)
      } else {
        const zipDir = dir === '.' ? '' : dir
        zip.addLocalFile(filePath, zipDir)
      }

      console.log(`  - ${fileName}`)
    })
  })

  const destPath = path.join(args.right?.args.githubWorkspacePath!, 'result.zip')
  zip.writeZip(destPath)

  args.right!.flags[args.right!.flags.length - 1] = destPath

  logger.info(`${insiderCi.right} ${args.right?.flags}`)
  logger.info('🏃 Running Insider CI...')
  await exec.exec(`${insiderCi.right}`, args.right?.flags)
  logger.info(' Finished Insider')
}

runner()
