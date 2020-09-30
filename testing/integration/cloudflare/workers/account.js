const runner = require('../../../runner')

const resource = require('../../../../src/resources/account')

const event = runner.createEvent({ route: 'account*' })

runner.run(resource, event)
