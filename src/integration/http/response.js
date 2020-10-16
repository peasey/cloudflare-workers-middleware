const required = require('../../util/required-param')

class HttpResponse {
  constructor({
    request = required('request'),
    route = required('route'),
    resolve = required('resolve'),
  } = {}) {
    this.request = request
    this.route = route
    this.resolve = resolve
    this.headers = new Headers()
    this.headers.append('Content-Type', 'application/json')
  }

  response({ statusCode, statusText, body }) {
    this.resolve(
      context.respond({
        request: this.request,
        route: this.route,
        statusCode,
        statusText,
        body: getBodyContent(body, this.headers),
        headers: this.headers,
      }),
    )
  }

  ok(body) {
    this.response({
      statusCode: 200,
      statusText: 'OK',
      body,
    })
  }

  unauthorised(body) {
    this.response({
      statusCode: 401,
      statusText: 'Unauthorized',
      body,
    })
  }

  invalid(body) {
    this.response({
      statusCode: 400,
      statusText: 'Bad Request',
      body,
    })
  }

  error(body) {
    this.response({
      statusCode: 500,
      statusText: 'Internal Server Error',
      body,
    })
  }

  notAllowed(body) {
    this.response({
      statusCode: 405,
      statusText: 'Method Not Allowed',
      body,
    })
  }

  notFound(body) {
    this.response({
      statusCode: 404,
      statusText: 'Not Found',
      body,
    })
  }
}

function getBodyContent(body, headers) {
  if (body) {
    const contentType = headers.get('Content-Type')
    if (contentType) {
      if (contentType.includes('application/json')) {
        return JSON.stringify(body)
      }

      if (contentType.includes('text/plain')) {
        return body.toString()
      }
      return body

      // other content types...
    }
  }
  return body
}

module.exports = HttpResponse
