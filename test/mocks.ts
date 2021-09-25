import { ILogger } from '../src/interfaces'

export const loggerSpy: ILogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
