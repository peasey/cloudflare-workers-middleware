/* eslint-disable no-restricted-globals, no-empty */

// abstraction for accessing environment variables
const environment = {
  variable(key) {
    try {
      if (self[key]) {
        return self[key]
      }
    } catch (err) {}

    return undefined
  },
}

// expose abstractions in the execution context
const context = {
  environment,
}

global.context = context
