const log = require('../../integration/logging/logger')('account:validate')

module.exports = async (request, response, next) => {
  try {
    if (request.headers.get('invalid') === 'true') {
      log.info(`request invalid`)
      response.invalid()
    } else {
      log.info(`request valid`)
      next()
    }
  } catch (err) {
    log.error('error processing account/validate middleware', err)
    response.error()
  }
}
