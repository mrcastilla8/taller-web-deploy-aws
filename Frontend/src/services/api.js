const configuredBase = import.meta.env.VITE_API_BASE_URL || '/api'
export const API_BASE_URL = configuredBase.replace(/\/+$/, '')

function sessionId() {
  localStorage.removeItem('edu_student')
  localStorage.removeItem('edu_inscriptions')
  let id = localStorage.getItem('eventos_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('eventos_session_id', id)
  }
  return id
}

export async function api(path, { method = 'GET', body, signal, timeoutMs = 10000 } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true })
  try {
    const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`, {
      method, signal: controller.signal,
      headers: { 'X-Session-Id': sessionId(), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const data = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || `Error del servidor (${response.status}).`)
    return data
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('La solicitud tardó demasiado. Inténtalo de nuevo.')
    if (error instanceof TypeError) throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
    throw error
  } finally { clearTimeout(timeout) }
}
