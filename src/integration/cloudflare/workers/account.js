/* eslint-disable no-restricted-globals */
require('../context')

addEventListener('fetch', (event) => {
  const resource = require('../../../resources/account')
  event.respondWith(resource(event))
})
