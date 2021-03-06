import { ILogger, IZipeFiles, Result } from './interfaces'

import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import AdmZip from 'adm-zip'

export class ZipeFiles implements IZipeFiles {
  private readonly ZIP_DESTINATION = 'project.zip'

  constructor (private readonly _logger: ILogger) {}

  public async zip (dir: string): Promise<Result<string>> {
    this._logger.info('****** Compress files... ******')
    const zip = new AdmZip()
    try {
      const files = await util.promisify(fs.readdir)(dir)
      files.forEach(fileName => {
        const filePath = path.join(dir, fileName)

        const stats = fs.lstatSync(filePath)

        if (stats.isDirectory()) {
          zip.addLocalFolder(filePath)
        } else {
          zip.addLocalFile(filePath)
        }
      })

      const destPath = path.join(dir, this.ZIP_DESTINATION)
      await util.promisify(zip.writeZip)(destPath)
      return { right: destPath }
    } catch (error) {
      this._logger.error('****** Something went wrong during the compress process ******')
      return { left: new Error(`${error}`) }
    }
  }
}
