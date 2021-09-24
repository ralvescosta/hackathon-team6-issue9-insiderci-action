import { ActionHelper } from './action_helper'
import { Logger } from './logger'

;(() => {
  const logger = new Logger()
  const actionHelper = new ActionHelper(logger)
  logger.debug('hello tcha tcha tcha!')
  logger.debug(actionHelper.getArguments().join(','))
})()
