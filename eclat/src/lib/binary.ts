import { suspend } from 'suspend-react'
import { asset } from './asset'

/**
 * Binary assets (GLB, HDR). Normal builds fetch them directly. The private-preview
 * build (VITE_PACKED=1) ships them as base64 text, because that host only serves a
 * fixed list of file types; they are decoded here into in-memory blob URLs.
 */
const PACKED = import.meta.env.VITE_PACKED === '1'

export const binaryFetchUrl = (path: string) => asset(PACKED ? `${path}.txt` : path)

async function toBlobUrl(path: string): Promise<string> {
  if (!PACKED) return asset(path)
  const text = await (await fetch(binaryFetchUrl(path))).text()
  const bin = atob(text.trim())
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes]))
}

/** Suspends until the binary is available; returns a URL any three.js loader can read. */
export function useBinaryUrl(path: string): string {
  return suspend(() => toBlobUrl(path), ['eclat-binary', path])
}
