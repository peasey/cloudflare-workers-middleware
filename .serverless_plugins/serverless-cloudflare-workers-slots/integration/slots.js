const routes = require('./routes')

const createLogger = (serverless) => (...params) => serverless.cli.log(params)

async function configureForDeploy(serverless, fn) {
  const log = createLogger(serverless)

  const functionNames = resolveFunctionNames(serverless, fn)

  const promises = functionNames.map(async (name) => {
    const desiredState = await getDesiredStateForFunction(serverless, name)
    mutateFromState(desiredState)
    log(
      `Configuring slot for deployment: [function: ${desiredState.fn.name}, desiredSlot: ${desiredState.slot}, desiredScriptName: ${desiredState.scriptName}, desiredRoute: ${desiredState.route}]`,
    )
    return Promise.resolve()
  })

  return Promise.all(promises)
}

async function configureForRemove(serverless, fn) {
  const log = createLogger(serverless)

  const functionNames = resolveFunctionNames(serverless, fn)

  const promises = functionNames.map(async (name) => {
    // duplicate function so we can dynamically create one to delete the other slot
    const duplicatedFn = { ...serverless.service.getFunction(name) }
    const originalRoute = routes.getRoute(duplicatedFn)

    const currentSlot = await getSlotForFunction(serverless, name)

    if (currentSlot) {
      const currentSlotState = await getSlotStateForFunction(serverless, name, currentSlot)

      const otherSlot = nextSlot(currentSlot)

      const otherSlotState = await getSlotStateForFunction(serverless, name, otherSlot)
      otherSlotState.fn = duplicatedFn

      // the current slot will delete both the current slot route and the original route
      const currentSlotDeployedRoute = await routes.getDeployedRoute(currentSlotState.route)
      if (currentSlotDeployedRoute) {
        mutateFromState(currentSlotState)
        log(
          `Configuring current slot for removal: [function: ${currentSlotState.fn.name}, slot: ${currentSlotState.slot}, scriptName: ${currentSlotState.scriptName}, routes: [${currentSlotState.route}, ${originalRoute}]]`,
        )
      }

      if (otherSlot) {
        const otherSlotDeployedRoute = await routes.getDeployedRoute(otherSlotState.route)
        if (otherSlotDeployedRoute) {
          mutateFromState(otherSlotState)
          log(
            `Configuring other slot for removal: [function: ${otherSlotState.fn.name}, slot: ${otherSlotState.slot}, scriptName: ${otherSlotState.scriptName}, route: ${otherSlotState.route}}]`,
          )
          // dynamically add the duplicated function to the service definition so it gets deleted
          serverless.service.functions[otherSlotState.fn.name] = otherSlotState.fn
        }
      }
    } else {
      // in this case only the default slot can be deployed
      const defaultSlot = getDefaultSlot(serverless)
      const defafultSlotState = await getSlotStateForFunction(serverless, name, defaultSlot)
      const defaultSlotDeployedRoute = await routes.getDeployedRoute(defafultSlotState.route)
      if (defaultSlotDeployedRoute) {
        mutateFromState(defafultSlotState)
        log(
          `Configuring default slot for removal: [function: ${defafultSlotState.fn.name}, slot: ${defafultSlotState.slot}, scriptName: ${defafultSlotState.scriptName}, route: ${defafultSlotState.route}]`,
        )
      }
    }

    return Promise.resolve()
  })

  return Promise.all(promises)
}

async function activateSlot(serverless, fn, slot) {
  const functionNames = resolveFunctionNames(serverless, fn)
  return activateSlotForFunctions(serverless, slot, functionNames)
}

async function activateSlotForFunctions(serverless, slot, functionNames) {
  const log = createLogger(serverless)

  const promises = functionNames.map(async (name) => {
    const slotState = await getSlotStateForFunction(serverless, name, slot)
    log(
      `Activating slot: [function: ${slotState.fn.name}, slot: ${slotState.slot}, scriptName: ${slotState.scriptName}, route: ${slotState.route}]`,
    )

    const slotRoute = await routes.getDeployedRoute(slotState.route)
    if (slotRoute) {
      ensureRoute(slotState)
    } else {
      log(
        `Error: the '${slotState.slot}' slot for the '${slotState.fn.name}' function doesn't have a deployed route, expected to find route '${slotState.route}'`,
      )
    }

    return Promise.resolve()
  })

  return Promise.all(promises)
}

async function rotateSlots(serverless, fn) {
  const functionNames = resolveFunctionNames(serverless, fn)
  return rotateSlotsForFunctions(serverless, functionNames)
}

async function rotateSlotsForFunctions(serverless, functionNames) {
  const log = createLogger(serverless)

  const promises = functionNames.map(async (name) => {
    const slot = await getSlotForFunction(serverless, name)
    const next = nextSlot(slot)

    log(`Rotating slot: [function: ${name}, current: ${slot}, next: ${next}]`)

    return activateSlotForFunctions(serverless, next, [name])
  })

  return Promise.all(promises)
}

async function currentSlots(serverless, fn) {
  const functionNames = resolveFunctionNames(serverless, fn)
  return currentSlotsForFunctions(serverless, functionNames)
}

async function currentSlotsForFunctions(serverless, functionNames) {
  const log = createLogger(serverless)

  const promises = functionNames.map(async (name) => {
    const slot = await getSlotForFunction(serverless, name)
    if (slot) {
      log(`${name}: ${slot}`)
    } else {
      log(`${name}: none`)
    }

    return Promise.resolve()
  })

  return Promise.all(promises)
}

function resolveFunctionNames(serverless, fn) {
  if (fn) {
    return [fn]
  }
  return serverless.service.getAllFunctions()
}

function mutateFromState(state) {
  setName(state.fn, state.scriptName)
  routes.setRoute(state.fn, state.route)

  // Add environment state
  if (!state.fn.environment) {
    state.fn.environment = {
      SLOT: state.slot,
    }
  }
}

async function getSlotForFunction(serverless, name) {
  let slot = null

  const fn = serverless.service.getFunction(name)
  const originalRoute = routes.getRoute(fn)
  const deployedRoute = await routes.getDeployedRoute(originalRoute)
  if (deployedRoute) {
    slot = getSlotFromRoute(deployedRoute)
  }

  return Promise.resolve(slot)
}

async function ensureRoute(state) {
  const originalRoute = routes.getRoute(state.fn)
  const deployedRoute = await routes.getDeployedRoute(originalRoute)
  if (deployedRoute) {
    return routes.updateRoute(deployedRoute.id, originalRoute, state.scriptName)
  } else {
    return routes.deployRoute(originalRoute, state.scriptName)
  }
}

async function getDesiredStateForFunction(serverless, functionName) {
  const fn = serverless.service.getFunction(functionName)
  const originalRoute = routes.getRoute(fn)
  const deployedRoute = await routes.getDeployedRoute(originalRoute)
  const desiredSlot = getDesiredSlot(serverless, deployedRoute)
  const desiredScriptName = generateScriptName(fn.name, desiredSlot)
  const desiredRoute = getSlotRoute(originalRoute, desiredSlot)

  return Promise.resolve({
    fn,
    slot: desiredSlot,
    scriptName: desiredScriptName,
    route: desiredRoute,
  })
}

async function getSlotStateForFunction(serverless, functionName, slot) {
  const fn = serverless.service.getFunction(functionName)
  const originalRoute = routes.getRoute(fn)
  const scriptName = generateScriptName(fn.name, slot)
  const route = getSlotRoute(originalRoute, slot)

  return Promise.resolve({
    fn,
    slot,
    scriptName,
    route,
  })
}

function setName(fn, name) {
  fn.name = name
}

function getDesiredSlot(serverless, deployedRoute) {
  let desiredSlot = getDefaultSlot(serverless)

  if (deployedRoute) {
    const currentSlot = getSlotFromRoute(deployedRoute)
    if (currentSlot) {
      desiredSlot = getDesiredFromCurrentSlot(currentSlot)
    }
  }

  return desiredSlot
}

function getSlotRoute(route, slot) {
  return [slot, route].join('-')
}

function getDefaultSlot(serverless) {
  return serverless.service.serviceObject.config.slot
}

function getSlotFromRoute(route) {
  if (route) {
    return getSlotFromScript(route.script)
  }

  return null
}

function getSlotFromScript(script) {
  if (script) {
    return script.split('-')[0]
  }

  return null
}

function getDesiredFromCurrentSlot(slot) {
  if (slot && slot === 'blue') {
    return 'green'
  }

  return 'blue'
}

function generateScriptName(script, slot) {
  return [slot, script].join('-')
}

const nextSlot = (slot) => getDesiredFromCurrentSlot(slot)

module.exports = {
  configureForDeploy,
  configureForRemove,
  activateSlot,
  rotateSlots,
  currentSlots,
}
