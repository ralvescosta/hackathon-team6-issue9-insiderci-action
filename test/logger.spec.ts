import { Logger } from '../src/logger'
import * as core from '@actions/core'

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warning: jest.fn(),
  error: jest.fn()
}))

const makeSut = () => {
  const sut = new Logger()

  return { sut }
}
describe('#Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('#info', () => {
    it('should execute correctly', () => {
      const { sut } = makeSut()

      sut.info('some message')

      expect(core.info).toHaveBeenCalledTimes(1)
      expect(core.info).toHaveBeenCalledWith('some message')
    })
  })
  describe('#debug', () => {
    it('should execute correctly', () => {
      const { sut } = makeSut()

      sut.debug('some message')

      expect(core.debug).toHaveBeenCalledTimes(1)
      expect(core.debug).toHaveBeenCalledWith('some message')
    })
  })
  describe('#warn', () => {
    it('should execute correctly', () => {
      const { sut } = makeSut()

      sut.warn('some message')

      expect(core.warning).toHaveBeenCalledTimes(1)
      expect(core.warning).toHaveBeenCalledWith('some message')
    })
  })
  describe('#error', () => {
    it('should execute correctly', () => {
      const { sut } = makeSut()

      sut.error('some message')

      expect(core.error).toHaveBeenCalledTimes(1)
      expect(core.error).toHaveBeenCalledWith('some message')
    })
  })
})
