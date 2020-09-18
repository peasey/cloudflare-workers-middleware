const api = require('./api')

module.exports = {
  async getRoutes({ zoneId } = {}) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes`,
      method: 'GET',
      contentType: 'application/json',
    })
  },

  async deploy({ zoneId, path, scriptName }) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes`,
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify({
        pattern: path,
        script: scriptName,
      }),
    })
  },

  async update({ zoneId, routeId, path, scriptName }) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes/${routeId}`,
      method: 'PUT',
      contentType: 'application/json',
      body: JSON.stringify({
        pattern: path,
        script: scriptName,
      }),
    })
  },

  async remove({ zoneId, routeId }) {
    zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID

    if (!routeId) {
      throw 'You must specify a route Id'
    }

    return await api.cfApiCall({
      url: `/zones/${zoneId}/workers/routes/${routeId}`,
      method: 'DELETE',
    })
  },
}
