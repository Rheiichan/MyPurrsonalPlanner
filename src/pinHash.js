// Hashes a PIN with SHA-256 (same algorithm the admin-reset RPC uses on the
// server for "0000"), so the raw PIN is never stored or sent anywhere as
// plain text after this point.
export async function hashPin(pin) {
  const data = new TextEncoder().encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const bytes = Array.from(new Uint8Array(hashBuffer))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}
