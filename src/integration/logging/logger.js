const logDebug = (prefix) => (message) => {
  const debug = context.environment.variable('DEBUG')
  if (debug) {
    console.info(`[${prefix}] ${message}`)
  }
}

const logInfo = (prefix) => (message) => console.info(`[${prefix}] ${message}`)
const logError = (prefix) => (message, err) => console.error(`[${prefix}] ${message}`, err)

const createLogger = (prefix) => {
  return {
    debug: logDebug(prefix),
    info: logInfo(prefix),
    error: logError(prefix),
  }
}

module.exports = createLogger
