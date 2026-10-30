/**
 * Binary data files. The private claude.ai preview (`VITE_MODEL_B64=1`) cannot serve `.bin`, so
 * that build reads the same bytes from `<name>.b64.txt` (written by pipeline/inline_preview.mjs).
 */
const B64 = import.meta.env.VITE_MODEL_B64 === '1'

export function fetchBinary(path: string): Promise<ArrayBuffer> {
  const url = `${import.meta.env.BASE_URL}${path}${B64 ? '.b64.txt' : ''}`
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Data request failed: ${r.status}`)
    if (!B64) return r.arrayBuffer()
    return r.text().then((t) => {
      const bin = atob(t.trim())
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return bytes.buffer
    })
  })
}
