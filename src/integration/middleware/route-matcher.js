const { Path } = require('path-parser')
const required = require('../../util/required-param')

const log = require('../logging/logger')('middleware:route-matcher')

class RouteMatcher {
  constructor(basePath = '') {
    const environment = context.environment.variable('ENVIRONMENT')

    let path = [environment !== 'prod' ? environment : '', basePath].join('/')

    if (path.endsWith('/')) {
      path = path.slice(0, -1)
    }

    if (path.startsWith('/')) {
      path = path.slice(1)
    }

    this.basePath = path
  }

  match({ template = required('template'), url = required('url') } = {}) {
    const result = {
      matched: false,
      components: {},
    }

    const path = pathFromUrl(url)
    const routeToMatch = routeFromPath({ path, basePath: this.basePath })

    log.debug(
      `basePath: ${this.basePath}, path: ${path}, routeToMatch: ${routeToMatch}, template: ${template}`,
    )

    const parseResult = parseRoute({ template, routeToMatch })
    if (parseResult !== false) {
      result.matched = true
      result.components = parseResult
    }

    return result
  }
}

function parseRoute({ template, routeToMatch }) {
  const path = new Path(template)

  const ret = path.test(routeToMatch)

  if (ret === null) {
    return false
  }

  return ret
}

function routeFromPath({ path, basePath }) {
  if (basePath.length > 0) {
    return path.slice(basePath.length + 1)
  }
  return path
}

function pathFromUrl(url) {
  return new URL(url).pathname
}

module.exports = RouteMatcher
