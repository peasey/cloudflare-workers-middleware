const cfRoutes = require('./cloudflare/routes')

function getRoute(fn) {
  return fn.events[0].http.url
}

function setRoute(fn, route) {
  return (fn.events[0].http.url = route)
}

async function getDeployedRoute(route) {
  return getRouteByPattern(route)
}

async function getRouteByPattern(pattern) {
  if (pattern) {
    const routes = await cfRoutes.getRoutes()
    if (routes.result.length > 0) {
      return routes.result.find((route) => route.pattern === pattern)
    }
  }

  return null
}

async function deployRoute(route, scriptName) {
  return cfRoutes.deploy({
    path: route,
    scriptName,
  })
}

async function updateRoute(routeId, route, scriptName) {
  return cfRoutes.update({
    routeId,
    path: route,
    scriptName,
  })
}

module.exports = {
  getRoute,
  setRoute,
  getDeployedRoute,
  deployRoute,
  updateRoute,
}
