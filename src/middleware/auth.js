const log = require('../integration/logging/logger')('auth')

module.exports = async (request, response, next) => {
  try {
    if (request.headers.get('unauthorised') === 'true') {
      log.info(`request unauthorised`)
      response.unauthorised()
    } else {
      log.info(`request authorised`)
      next()
    }
  } catch (err) {
    log.error('error processing auth middleware', err)
    response.error()
  }
}
