const port = 8789

const server = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url)
    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok' })
    }
    return new Response('Not Found', { status: 404 })
  },
})

console.log(`API server running at http://localhost:${server.port}`)
