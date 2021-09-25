import { ZipeFiles } from '../src/zip'
import { loggerSpy } from './mocks'

import * as fs from 'fs'
import * as util from 'util'

jest.mock('adm-zip', () => {
  const admZipExtractAllMock = jest.fn()
  return {
    __esModule: true,
    admZipExtractAllMock,
    default: jest.fn(() => ({ addLocalFolder: jest.fn(), addLocalFile: jest.fn(), writeZip: jest.fn() }))
  }
})
jest.mock('util', () => ({
  promisify: jest.fn(fn => jest.fn(() => fn()))
}))
jest.mock('path', () => ({
  join: jest.fn(() => 'some_path')
}))
jest.mock('fs', () => ({
  readdir: jest.fn(() => ['some_dir']),
  lstatSync: jest.fn(() => ({
    isDirectory: jest.fn(() => true)
  }))
}))

const makeSut = () => {
  const sut = new ZipeFiles(loggerSpy)

  return { sut }
}

describe('#ZipeFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#zip', () => {
    it('should return a zip directory when execute correctly when have only directory', async () => {
      const { sut } = makeSut()

      const result = await sut.zip('some_dir')

      expect(result.left).toBeUndefined()
      expect(result.right).toEqual('some_path')
    })

    it('should return a zip directory when execute correctly when have only files', async () => {
      const { sut } = makeSut()
      jest.spyOn(fs, 'lstatSync').mockImplementation(() => ({
        isDirectory: jest.fn(() => false)
      }) as any)
      const result = await sut.zip('some_dir')

      expect(result.left).toBeUndefined()
      expect(result.right).toEqual('some_path')
    })

    it('should return error when some erro occur', async () => {
      const { sut } = makeSut()
      jest.spyOn(util, 'promisify').mockImplementation(fn => jest.fn(() => { throw new Error() }) as any)

      const result = await sut.zip('some_dir')

      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
    })
  })
})
