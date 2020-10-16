/* eslint-disable import/no-extraneous-dependencies */
const fetch = require('node-fetch')

const HttpMethod = require('../src/integration/http/method')

const run = async (resource, event) => {
  return resource(event)
    .then((response) => {
      // log response code and text, i.e. 200 OK
      console.info(`${response.status} ${response.statusText}`)
      // log headers
      if (response.headers) {
        console.info(sringifyHeaders(response.headers))
      }
      if (response.ok) {
        return response.text()
      }
      return Promise.resolve(null)
    })
    .then((data) => {
      if (data) {
        console.info(`${data}`)
      }
    })
    .catch(() => {
      // ignore
    })
}

const createEvent = ({
  httpMethod = HttpMethod.GET,
  path = '',
  body = null,
  headers = new fetch.Headers(),
} = {}) => {
  global.Headers = fetch.Headers

  const environmentPath = createEnvironmentPath(path)

  const event = {
    request: new fetch.Request(`http://localhost/${environmentPath}`, {
      method: httpMethod,
      body,
      headers,
    }),
  }

  return event
}

const get = ({ path = '', body = null, headers = new fetch.Headers() } = {}) => {
  return createEvent({
    httpMethod: HttpMethod.GET,
    path,
    body,
    headers,
  })
}

const post = ({ path = '', body = null, headers = new fetch.Headers() } = {}) => {
  return createEvent({
    httpMethod: HttpMethod.POST,
    path,
    body,
    headers,
  })
}

function sringifyHeaders(headers) {
  return [...headers].map((header) => `${header[0]}: ${header[1]}`).join('\n')
}

const createEnvironmentPath = (path) => {
  let environment = process.env.ENVIRONMENT || ''
  if (environment === 'prod') {
    environment = ''
  }
  return require('path').join(environment, path)
}

module.exports = {
  createEvent,
  get,
  post,
  run,
}
