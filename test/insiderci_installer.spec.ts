import { InsiderCiInstaller } from '../src/insiderci_installer'
import { loggerSpy } from './mocks'
import { ICache, IHttpClient } from '../src/interfaces'
import * as os from 'os'

jest.mock('os', () => ({
  platform: jest.fn(() => 'linux'),
  arch: jest.fn(() => 'x64')
}))

const makeSut = () => {
  const httpClientSpy: IHttpClient = {
    get: jest.fn()
  }
  const cacheSpy: ICache = {
    getTool: jest.fn(),
    extract: jest.fn(),
    cache: jest.fn()
  }
  const sut = new InsiderCiInstaller(httpClientSpy, cacheSpy, loggerSpy)

  return {
    sut,
    httpClientSpy,
    cacheSpy
  }
}
describe('#InsiderCiInstaller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#exec', () => {
    it('should return insider ci executable path when execute correctly in linux environment', async () => {
      const { sut, httpClientSpy, cacheSpy } = makeSut()
      jest.spyOn(httpClientSpy, 'get').mockResolvedValueOnce({ right: { tag_name: 'tag' } })
      jest.spyOn(cacheSpy, 'getTool').mockResolvedValueOnce({ right: 'tool_path' })
      jest.spyOn(cacheSpy, 'extract').mockResolvedValueOnce({ right: 'extracted_path' })
      jest.spyOn(cacheSpy, 'cache').mockResolvedValueOnce({ right: 'cached_path' })

      const result = await sut.exec('version')

      expect(result.left).toBeUndefined()
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
      expect(cacheSpy.getTool).toHaveBeenCalledTimes(1)
      expect(cacheSpy.extract).toHaveBeenCalledTimes(1)
      expect(cacheSpy.cache).toHaveBeenCalledTimes(1)
    })
    it('should return insider ci executable path when execute correctly in windows environment', async () => {
      const { sut, httpClientSpy, cacheSpy } = makeSut()
      jest.spyOn(os, 'platform').mockReturnValueOnce('win32')
      jest.spyOn(os, 'arch').mockReturnValueOnce('i386')
      jest.spyOn(httpClientSpy, 'get').mockResolvedValueOnce({ right: { tag_name: 'tag' } })
      jest.spyOn(cacheSpy, 'getTool').mockResolvedValueOnce({ right: 'tool_path' })
      jest.spyOn(cacheSpy, 'extract').mockResolvedValueOnce({ right: 'extracted_path' })
      jest.spyOn(cacheSpy, 'cache').mockResolvedValueOnce({ right: 'cached_path' })

      const result = await sut.exec('version')

      expect(result.left).toBeUndefined()
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
      expect(cacheSpy.getTool).toHaveBeenCalledTimes(1)
      expect(cacheSpy.extract).toHaveBeenCalledTimes(1)
      expect(cacheSpy.cache).toHaveBeenCalledTimes(1)
    })

    it('should return error if #httpClient.get returns error', async () => {
      const { sut, httpClientSpy } = makeSut()
      jest.spyOn(httpClientSpy, 'get').mockResolvedValueOnce({ left: new Error('') })

      const result = await sut.exec('version')

      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
    })

    it('should return error if #cache.getTool returns error', async () => {
      const { sut, httpClientSpy, cacheSpy } = makeSut()
      jest.spyOn(httpClientSpy, 'get').mockResolvedValueOnce({ right: { tag_name: 'tag' } })
      jest.spyOn(cacheSpy, 'getTool').mockResolvedValueOnce({ left: new Error('') })

      const result = await sut.exec('version')

      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
      expect(cacheSpy.getTool).toHaveBeenCalledTimes(1)
    })

    it('should return error if #cache.extract returns error', async () => {
      const { sut, httpClientSpy, cacheSpy } = makeSut()
      jest.spyOn(httpClientSpy, 'get').mockResolvedValueOnce({ right: { tag_name: 'tag' } })
      jest.spyOn(cacheSpy, 'getTool').mockResolvedValueOnce({ right: 'tool_path' })
      jest.spyOn(cacheSpy, 'extract').mockResolvedValueOnce({ left: new Error('') })

      const result = await sut.exec('version')

      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
      expect(cacheSpy.getTool).toHaveBeenCalledTimes(1)
      expect(cacheSpy.extract).toHaveBeenCalledTimes(1)
    })

    it('should return error if #cache.cache returns error', async () => {
      const { sut, httpClientSpy, cacheSpy } = makeSut()
      jest.spyOn(httpClientSpy, 'get').mockResolvedValueOnce({ right: { tag_name: 'tag' } })
      jest.spyOn(cacheSpy, 'getTool').mockResolvedValueOnce({ right: 'tool_path' })
      jest.spyOn(cacheSpy, 'extract').mockResolvedValueOnce({ right: 'extracted_path' })
      jest.spyOn(cacheSpy, 'cache').mockResolvedValueOnce({ left: new Error('') })

      const result = await sut.exec('version')

      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
      expect(httpClientSpy.get).toHaveBeenCalledTimes(1)
      expect(cacheSpy.getTool).toHaveBeenCalledTimes(1)
      expect(cacheSpy.extract).toHaveBeenCalledTimes(1)
      expect(cacheSpy.cache).toHaveBeenCalledTimes(1)
    })
  })
})
