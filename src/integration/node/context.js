/* eslint-disable import/no-extraneous-dependencies, no-empty */
const fetch = require('node-fetch')

// substitute node implementations in the global scope
global.fetch = fetch
global.Request = fetch.Request
global.Response = fetch.Response
global.Headers = fetch.Headers

// abstraction for accessing environment variables
const environment = {
  variable(key) {
    try {
      if (process.env[key]) {
        return process.env[key]
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
