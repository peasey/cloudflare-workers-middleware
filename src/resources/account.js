const HttpMethod = require('../integration/http/method')
const HttpResponse = require('../integration/http/response')
const Middleware = require('../integration/middleware/middleware')
const RouteMatcher = require('../integration/middleware/route-matcher')

const log = require('../integration/logging/logger')('resource:account')

async function resource(event) {
  return new Promise((resolve) => {
    try {
      const basePath = 'account'
      const response = new HttpResponse({ request: event.request, route: basePath, resolve })

      const middleware = new Middleware({
        routeMatcher: new RouteMatcher(basePath),
      })

      middleware
        .on({ method: HttpMethod.GET, route: '/:id' })
        .use(require('../middleware/debug'))
        .use(require('../middleware/auth'))
        .use(require('../middleware/account/validate'))
        .use(require('../middleware/account/read'))

      middleware
        .on({ method: HttpMethod.POST, route: '/:id' })
        .use(require('../middleware/debug'))
        .use(require('../middleware/auth'))
        .use(require('../middleware/account/validate'))
        .use(require('../middleware/account/write'))

      middleware.run(event.request, response)
    } catch (err) {
      log.error('error processing account resource', err)
    }
  })
}

module.exports = resource
