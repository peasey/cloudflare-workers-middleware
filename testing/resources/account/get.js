const runner = require('../../runner')

const resource = require('../../../src/resources/account')

const path = 'v1/account/1234567890'

const event = runner.get({
  path,
})

runner.run(resource, event)
