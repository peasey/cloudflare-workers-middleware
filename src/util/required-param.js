module.exports = function requiredParam(param) {
  throw new Error(`Required parameter '${param}' has not been provided.`)
}
