const BASE = '/api'

export async function checkStatus() {
  const res = await fetch(`${BASE}/status`)
  if (!res.ok) throw new Error('Server unreachable')
  return res.json()
}

export async function clearContext() {
  const res = await fetch(`${BASE}/context/clear`, { method: 'POST' })
  if (!res.ok) throw new Error('Clear failed')
  return res.json()
}
