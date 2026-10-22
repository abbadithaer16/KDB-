/** Device / capability detection, evaluated once at boot. */

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).has('nowebgl')) return false
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    return !!gl
  } catch {
    return false
  }
}

const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const device = {
  webgl: detectWebGL(),
  reducedMotion: mq('(prefers-reduced-motion: reduce)'),
  coarse: mq('(pointer: coarse)'),
  /** narrow / portrait layouts get their own camera framing */
  isPortrait: () => window.innerWidth / window.innerHeight < 0.85,
  isMobile: () => window.innerWidth < 760,
  /** rough GPU tier: low-memory or small touch devices render lighter */
  lowPower: (() => {
    if (typeof navigator === 'undefined') return false
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    const cores = navigator.hardwareConcurrency || 4
    return (mem !== undefined && mem <= 4) || cores <= 4 && mq('(pointer: coarse)')
  })(),
}
