import { ActionHelper } from '../src/action_helper'
import { loggerSpy } from './mocks'

import * as path from 'path'
import * as core from '@actions/core'
import * as exec from '@actions/exec'

jest.mock('path', () => ({
  resolve: jest.fn(() => 'some_path')
}))
jest.mock('@actions/core', () => ({
  getInput: jest.fn(() => 'some_value'),
  setFailed: jest.fn()
}))
jest.mock('@actions/exec', () => ({
  exec: jest.fn(() => 1)
}))

const makeSut = () => {
  const sut = new ActionHelper(loggerSpy)

  return {
    sut
  }
}
describe('#ActionHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('#getActionArgs', () => {
    it('should return Args if execute correctly with tech', () => {
      process.env.GITHUB_WORKSPACE = 'some_workspace'
      jest.spyOn(core, 'getInput').mockImplementation((input) => {
        if (input === 'applicationId') return ''
        return 'some_value'
      })

      const { sut } = makeSut()

      const result = sut.getActionArgs()
      expect(result.left).toBeUndefined()
      expect(result.right).toEqual(
        {
          flags: ['-email', 'some_value', '-password', 'some_value', '-score', 'some_value', '-no-fail', '-tech', 'some_value'],
          args: { version: 'some_value', componentId: '', email: 'some_value', password: 'some_value', save: 'some_value', target: 'some_value', technology: 'some_value', security: 'some_value', noFail: 'some_value', githubWorkspacePath: 'some_path' }
        })
      expect(path.resolve).toHaveBeenCalledTimes(2)
      expect(core.getInput).toHaveBeenCalledTimes(9)
    })

    it('should return Args if execute correctly with applicationId', () => {
      process.env.GITHUB_WORKSPACE = 'some_workspace'
      jest.spyOn(core, 'getInput').mockImplementation((input) => {
        if (input === 'technology' || input === 'noFail') return ''
        return 'some_value'
      })

      const { sut } = makeSut()

      const result = sut.getActionArgs()
      expect(result.left).toBeUndefined()
      expect(result.right).toEqual(
        {
          flags: ['-email', 'some_value', '-password', 'some_value', '-score', 'some_value', '-component', 'some_value'],
          args: { version: 'some_value', componentId: 'some_value', email: 'some_value', password: 'some_value', save: 'some_value', target: 'some_value', technology: '', security: 'some_value', noFail: '', githubWorkspacePath: 'some_path' }
        })
      expect(path.resolve).toHaveBeenCalledTimes(2)
      expect(core.getInput).toHaveBeenCalledTimes(9)
    })

    it('should return error if GITHUB_WORKSPACE is empty', () => {
      process.env.GITHUB_WORKSPACE = ''
      const { sut } = makeSut()

      const result = sut.getActionArgs()
      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
    })

    it('should return error if technology or applicationId is empty', () => {
      process.env.GITHUB_WORKSPACE = 'some_workspace'
      jest.spyOn(core, 'getInput').mockImplementation((input) => {
        if (input === 'technology' || input === 'applicationId') return ''
        return 'some_value'
      })

      const { sut } = makeSut()

      const result = sut.getActionArgs()
      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
    })
  })
  describe('#actionFail', () => {
    it('should execute correctly', () => {
      const { sut } = makeSut()

      sut.actionFail('Error')

      expect(core.setFailed).toHaveBeenCalledTimes(1)
      expect(core.setFailed).toHaveBeenCalledWith('Error')
    })
  })
  describe('#exec', () => {
    it('should return result if execute correctly', async () => {
      const { sut } = makeSut()

      const result = await sut.exec('command', ['arg1'])

      expect(loggerSpy.info).toHaveBeenCalledTimes(1)
      expect(exec.exec).toHaveBeenCalledTimes(1)
      expect(exec.exec).toHaveBeenCalledWith('command', ['arg1'])
      expect(result.left).toBeUndefined()
    })

    it('should return error if some error occur in exec', async () => {
      jest.spyOn(exec, 'exec').mockRejectedValueOnce(new Error(''))

      const { sut } = makeSut()

      const result = await sut.exec('command', ['arg1'])

      expect(loggerSpy.info).toHaveBeenCalledTimes(1)
      expect(exec.exec).toHaveBeenCalledTimes(1)
      expect(exec.exec).toHaveBeenCalledWith('command', ['arg1'])
      expect(loggerSpy.error).toHaveBeenCalledTimes(1)
      expect(result.right).toBeUndefined()
      expect(result.left).toBeInstanceOf(Error)
    })
  })
})
