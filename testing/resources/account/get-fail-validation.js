const runner = require('../../runner')

const resource = require('../../../src/resources/account')

const path = 'v1/account/1234567890'

const headers = new fetch.Headers()
headers.append('invalid', true)

const event = runner.get({
  path,
  headers,
})

runner.run(resource, event)
