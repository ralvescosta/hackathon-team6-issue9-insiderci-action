// import { ActionHelper } from './action_helper'
import { Logger } from './logger'

;(() => {
  const logger = new Logger()
  // const actionHelper = new ActionHelper(logger)
  logger.debug('hello tcha tcha tcha!')
  // const args = actionHelper.getActionArgs()
  // if (args.right) {
  //   logger.debug(args.right.flags.join(','))
  //   logger.debug(JSON.stringify(args.right.args))
  // }
})()
