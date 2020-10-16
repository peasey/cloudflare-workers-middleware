const log = require('../integration/logging/logger')('debug')

module.exports = async (request, response, next) => {
  try {
    const debug = context.environment.variable('DEBUG')
    if (debug) {
      if (debug === 'true') {
        const environment = context.environment.variable('ENVIRONMENT')
        const slot = context.environment.variable('SLOT')
        log.info(`environment: ENVIRONMENT=${environment}, SLOT=${slot}`)
        log.info(`request: ${JSON.stringify(request)}`)
        log.info(`headers: ${JSON.stringify([...request.headers])}`)
      }
    }
    next()
  } catch (err) {
    log.error('error processing debug middleware', err)
    response.error()
  }
}
