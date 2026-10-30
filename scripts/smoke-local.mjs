import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { openDatabase } from '../Backend/src/database.js'
import { createApp } from '../Backend/src/app.js'
import { mockEvents } from '../Backend/src/data/events.js'

const directory = await mkdtemp(join(tmpdir(), 'eventosfisi-smoke-'))
const storage = join(directory, 'test.sqlite')
const sessionId = randomUUID()
const student = { name: 'Estudiante Smoke', email: 'smoke@unmsm.edu.pe', phone: '987654321' }
let server
let db
let base
const assert = (condition, message) => { if (!condition) throw new Error(message) }
async function boot() {
  db = await openDatabase({ storage, seed: mockEvents, logging: false })
  server = createApp(db, { log: () => {} }).listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject) })
  base = 'http://127.0.0.1:' + server.address().port
}
async function stop() {
  if (server) await new Promise((resolve) => server.close(resolve))
  server = null
  if (db) await db.close()
  db = null
}
async function call(path, method = 'GET', body) {
  const response = await fetch(base + '/api/' + path, { method, headers: { 'X-Session-Id': sessionId, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const data = await response.json().catch(() => null)
  assert(response.ok, method + ' ' + path + ': ' + response.status + ' ' + (data?.error ?? ''))
  return data
}
try {
  await boot()
  assert((await fetch(base + '/health')).ok, 'GET /health falló')
  assert((await call('ready')).status === 'ready', 'GET /api/ready falló')
  const events = await call('events')
  assert(events.length >= 11 && (await call('categories')).length > 0, 'catálogo/categorías incompletos')
  await call('student', 'PUT', student)
  await call('inscriptions', 'POST', { eventId: 10 })
  assert((await call('inscriptions')).includes(10), 'inscripción no recuperada')
  await call('favorites/10', 'PUT')
  assert((await call('favorites')).some((event) => event.id === 10), 'favorito no recuperado')
  await call('events/10/reviews', 'PUT', { rating: 5, comment: 'Prueba persistente' })
  assert((await call('events/10/reviews')).count === 1, 'valoración no recuperada')
  const preflight = await fetch(base + '/api/health', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'content-type,x-session-id' } })
  assert(preflight.status === 204 && preflight.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'preflight CORS falló')
  await call('inscriptions/10', 'DELETE')
  await stop()
  await boot()
  assert((await call('student')).name === student.name, 'perfil no sobrevivió al reinicio')
  assert((await call('favorites')).some((event) => event.id === 10), 'favorito no sobrevivió al reinicio')
  assert((await call('events/10/reviews')).count === 1, 'reseña no sobrevivió al reinicio')
  assert(!(await call('inscriptions')).includes(10), 'cancelación no persistió')
  console.log('Smoke local correcto: health, ready, API, persistencia, CORS y cancelación.')
} finally {
  await stop()
  await rm(directory, { recursive: true, force: true })
}
