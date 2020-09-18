module.exports = async () => {
  const text = `Processing account resource from ${SLOT} slot...`
  const body = JSON.stringify(text)
  const response = new Response(body, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return Promise.resolve(response)
}
