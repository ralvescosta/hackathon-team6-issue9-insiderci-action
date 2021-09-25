import { Cache } from '../src/cache'
import { GitHubRelease } from '../src/interfaces'

import * as toolCache from '@actions/tool-cache'

jest.mock('@actions/tool-cache', () => ({
  downloadTool: jest.fn(() => 'some_path'),
  extractZip: jest.fn(() => 'extracted_path'),
  extractTar: jest.fn(() => 'extracted_path'),
  cacheDir: jest.fn(() => 'cached_path')
}))

const makeSut = () => {
  const baseURL = 'some_url'
  const sut = new Cache(baseURL)
  const configuredRelease: GitHubRelease = {
    id: 1,
    tag_name: 'tag'
  }

  return { sut, baseURL, configuredRelease }
}
describe('#Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#getTool', () => {
    it('should return toolPath when execute correctly', async () => {
      const { sut, configuredRelease } = makeSut()

      const toolPath = await sut.getTool(configuredRelease, 'runtime')

      expect(toolPath.left).toBeUndefined()
      expect(toolPath.right).toEqual('some_path')
      expect(toolCache.downloadTool).toHaveBeenCalledTimes(1)
    })

    it('should return error when some error occur', async () => {
      const { sut, configuredRelease } = makeSut()
      jest.spyOn(toolCache, 'downloadTool').mockRejectedValueOnce(new Error(''))

      const toolPath = await sut.getTool(configuredRelease, 'runtime')

      expect(toolPath.right).toBeUndefined()
      expect(toolPath.left).toBeInstanceOf(Error)
      expect(toolCache.downloadTool).toHaveBeenCalledTimes(1)
    })
  })
  describe('#extract', () => {
    it('should return extracted path when execute correctly in windows environment', async () => {
      const { sut } = makeSut()

      const extracted = await sut.extract('win32', 'some_path')

      expect(extracted.left).toBeUndefined()
      expect(extracted.right).toEqual('extracted_path')
      expect(toolCache.extractZip).toHaveBeenCalledTimes(1)
    })

    it('should return extracted path when execute correctly in linux environment', async () => {
      const { sut } = makeSut()

      const extracted = await sut.extract('linux', 'some_path')

      expect(extracted.left).toBeUndefined()
      expect(extracted.right).toEqual('extracted_path')
      expect(toolCache.extractTar).toHaveBeenCalledTimes(1)
    })

    it('should return error when some error occur', async () => {
      const { sut } = makeSut()
      jest.spyOn(toolCache, 'extractTar').mockRejectedValueOnce(new Error(''))

      const extracted = await sut.extract('linux', 'some_path')

      expect(extracted.right).toBeUndefined()
      expect(extracted.left).toBeInstanceOf(Error)
      expect(toolCache.extractTar).toHaveBeenCalledTimes(1)
    })
  })
  describe('#cache', () => {
    it('should return cached path when execute correctly in windows environment', async () => {
      const { sut, configuredRelease } = makeSut()

      const extracted = await sut.cache('some_path', configuredRelease, 'win32')

      expect(extracted.left).toBeUndefined()
      expect(extracted.right).toEqual('cached_path/insiderci.exe')
      expect(toolCache.cacheDir).toHaveBeenCalledTimes(1)
    })

    it('should return cached path when execute correctly in linux environment', async () => {
      const { sut, configuredRelease } = makeSut()

      const extracted = await sut.cache('some_path', configuredRelease, 'linux')

      expect(extracted.left).toBeUndefined()
      expect(extracted.right).toEqual('cached_path/insiderci')
      expect(toolCache.cacheDir).toHaveBeenCalledTimes(1)
    })
  })
})
