export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.json() as Promise<T>
}
