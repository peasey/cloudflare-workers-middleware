const MiddlewarePipeline = require('./pipeline')

const requiredParam = require('../../util/required-param')

class Middleware {
  constructor({ routeMatcher = requiredParam('routeMatcher') } = {}) {
    this.routeMatcher = routeMatcher
    this.pipelines = []
  }

  on({ route = requiredParam('route'), method = requiredParam('method') } = {}) {
    let pipeline = pipelineFromRouteAndMethod(this.pipelines, route, method)
    if (!pipeline) {
      pipeline = {
        route,
        method,
        middleware: new MiddlewarePipeline(),
      }
      this.pipelines.push(pipeline)
    }
    return pipeline.middleware
  }

  run(request, response) {
    const pipelineResult = pipelineFromRequest(this.pipelines, this.routeMatcher, request)

    if (pipelineResult.found) {
      request.routeComponents = pipelineResult.pipeline.routeComponents
      return pipelineResult.pipeline.middleware.run(request, response)
    }

    if (pipelineResult.reason === 'method') {
      return response.notAllowed()
    }

    return response.notFound()
  }
}

function pipelineFromRouteAndMethod(pipelines, route, method) {
  return pipelines.filter((pipeline) => pipeline.route === route && pipeline.method === method)[0]
}

function pipelineFromUrlAndMethod(pipelines, routeMatcher, url, method) {
  const result = {
    found: false,
    reason: '',
    pipeline: null,
  }

  result.pipeline = pipelines
    .filter(
      (pipeline) =>
        routeMatcher.match({ template: pipeline.route, url }).matched === true &&
        pipeline.method === method,
    )
    .map((pipeline) => {
      return {
        ...pipeline,
        routeComponents: routeMatcher.match({ template: pipeline.route, url }).components,
      }
    })
    .reduce((prev, curr) => curr, null)

  result.found = result.pipeline !== null

  if (!result.found) {
    // work out why we didn't find a pipeline
    const byUrl = pipelineFromUrl(pipelines, routeMatcher, url)
    if (byUrl.length > 0) {
      result.reason = 'method'
    } else {
      result.reason = 'url'
    }
  }

  return result
}

function pipelineFromUrl(pipelines, routeMatcher, url) {
  return pipelines.filter(
    (pipeline) => routeMatcher.match({ template: pipeline.route, url }).matched === true,
  )
}

function pipelineFromRequest(pipelines, routeMatcher, request) {
  const url = urlFromRequest(request)
  const method = methodFromRequest(request)
  return pipelineFromUrlAndMethod(pipelines, routeMatcher, url, method)
}

function urlFromRequest(request) {
  return request.url
}

function methodFromRequest(request) {
  return request.method
}

module.exports = Middleware
