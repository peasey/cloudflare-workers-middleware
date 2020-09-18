/* eslint-disable no-restricted-globals */
addEventListener('fetch', (event) => {
  const resource = require('../../../resources/account')
  event.respondWith(resource(event))
})
