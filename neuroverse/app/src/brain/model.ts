import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Model delivery.
 * Default: meshopt-compressed GLB (`models/brain.glb`).
 * Private preview build (`VITE_MODEL_B64=1`): the claude.ai host does not serve `.glb` files and may
 * block WebAssembly, so the same quantised geometry (without meshopt) ships as base64 text.
 */
const B64 = import.meta.env.VITE_MODEL_B64 === '1'
const MODEL = `${import.meta.env.BASE_URL}models/${B64 ? 'brain.b64.txt' : 'brain.glb'}`

class Base64GLTFLoader extends GLTFLoader {
  load(url: string, onLoad: (gltf: GLTF) => void, _onProgress?: unknown, onError?: (e: unknown) => void) {
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Model request failed: ${r.status}`)
        return r.text()
      })
      .then((text) => {
        const bin = atob(text.trim())
        const bytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
        this.parse(bytes.buffer, '', onLoad, onError as (e: unknown) => void)
      })
      .catch((e) => onError?.(e))
  }
}

export function useBrainModel(): GLTF {
  // The branch is fixed at build time, so the hook order never changes between renders.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return B64 ? useLoader(Base64GLTFLoader, MODEL) : (useGLTF(MODEL, false, true) as unknown as GLTF)
}

if (!B64) useGLTF.preload(MODEL, false, true)
