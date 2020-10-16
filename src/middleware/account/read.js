const log = require('../../integration/logging/logger')('account:read')

module.exports = async (request, response) => {
  try {
    log.info(`reading data...`)

    const dummyData = {
      id: request.routeComponents.id,
    }

    response.ok(dummyData)
  } catch (err) {
    log.error('error processing account/read middleware', err)
    response.error()
  }
}
