import { ActionHelper } from './action_helper'
import { Logger } from './logger'

;(() => {
  const logger = new Logger()
  const actionHelper = new ActionHelper(logger)
  logger.debug('hello tcha tcha tcha!')
  console.log('hello tcha tcha tcha!')
  const args = actionHelper.getActionArgs()
  if (args.right) {
    console.log(args.right.flags.join(','))
    console.log(JSON.stringify(args.right.args))
  }
})()
