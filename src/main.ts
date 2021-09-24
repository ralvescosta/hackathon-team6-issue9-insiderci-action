import { ActionHelper } from './action_helper'
import { Logger } from './logger'

;(() => {
  const logger = new Logger()
  const actionHelpper = new ActionHelper(logger)
  logger.debug('hello tcha tcha tcha!')
  logger.debug(actionHelpper.getArguments().join(','))
})()
