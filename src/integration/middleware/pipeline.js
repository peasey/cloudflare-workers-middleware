const log = require('../logging/logger')('middleware:pipeline')

class MiddlewarePipeline {
  use(module) {
    this.run = ((pipeline) => (request, response, next) =>
      pipeline(request, response, () => {
        try {
          module.apply(this, [
            request,
            response,
            next ? next.bind.apply(next, [request, response]) : null,
          ])
        } catch (err) {
          log.error(`Error while running middleware pipeline`, err)
          response.error()
        }
      }))(this.run)

    return this
  }

  async run(request, response, last) {
    last.apply(this, request, response)
  }
}

module.exports = MiddlewarePipeline
