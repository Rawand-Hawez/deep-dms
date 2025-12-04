#!/usr/bin/env node
// Lightweight mock roles endpoint for local dev.
// Serves GET /api/auth/roles with a static roles array.
// Usage: npm run mock:roles

import http from 'http'
import { parse } from 'url'

const port = Number(process.env.MOCK_ROLES_PORT) || 3999
const roles =
  (process.env.MOCK_ROLES || 'Admin')
    .split(',')
    .map(r => r.trim())
    .filter(Boolean)

const allowOrigin = process.env.MOCK_ROLES_CORS_ORIGIN || '*'
const allowMethods = 'GET,OPTIONS'
const allowHeaders = 'Authorization,Content-Type'
const responseBody = JSON.stringify({ roles })

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', allowOrigin)
  res.setHeader('Access-Control-Allow-Methods', allowMethods)
  res.setHeader('Access-Control-Allow-Headers', allowHeaders)
}

const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url || '/', false)

  setCors(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'GET' && pathname === '/api/auth/roles') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(responseBody)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found')
})

server.listen(port, () => {
  console.log(`[mock-roles] listening on http://localhost:${port}/api/auth/roles (roles=${roles.join(', ')})`)
})
