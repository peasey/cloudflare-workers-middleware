/* eslint-disable import/no-extraneous-dependencies */
const fetch = require('node-fetch')

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
        if (response.headers.get('content-type') === 'application/json') {
          return response.json()
        }
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
  httpMethod = 'GET',
  route = '',
  body = null,
  headers = new fetch.Headers(),
} = {}) => {
  global.Headers = fetch.Headers

  const event = {
    request: new fetch.Request(`http://localhost/${route}`, {
      method: httpMethod,
      body,
      headers,
    }),
  }

  return event
}

function sringifyHeaders(headers) {
  return [...headers].map((header) => `${header[0]}: ${header[1]}`).join('\n')
}

module.exports = {
  createEvent,
  run,
}
