import * as THREE from 'three'
import type { Metal } from '../lib/state'

/** Physically based metals. Base colours are the F0 reflectance of each alloy (sRGB). */
export const METAL_TONES: Record<Metal, { color: string; roughness: number; label: string; swatch: string }> = {
  yellow: { color: '#f3cd8e', roughness: 0.13, label: 'Yellow gold', swatch: 'linear-gradient(135deg,#f6dca6,#c99b52)' },
  white: { color: '#dedcd8', roughness: 0.1, label: 'White gold', swatch: 'linear-gradient(135deg,#f4f3f0,#a9a7a2)' },
}

export const metalMaterial = new THREE.MeshPhysicalMaterial({
  name: 'eclat-metal',
  color: new THREE.Color(METAL_TONES.yellow.color),
  metalness: 1,
  roughness: METAL_TONES.yellow.roughness,
  envMapIntensity: 1.35,
  specularIntensity: 1,
})

export function applyMetal(m: Metal) {
  metalMaterial.color.set(METAL_TONES[m].color)
  metalMaterial.roughness = METAL_TONES[m].roughness
}

/** Black velvet for the display bust: deep base, warm sheen at grazing angles. */
export const velvetMaterial = new THREE.MeshPhysicalMaterial({
  name: 'eclat-velvet',
  color: new THREE.Color('#0d0c0b'),
  roughness: 0.92,
  metalness: 0,
  sheen: 1,
  sheenRoughness: 0.42,
  sheenColor: new THREE.Color('#6b5844'),
  envMapIntensity: 0.55,
})

/** Radial alpha falloff so the studio floor dissolves into the black backdrop (no horizon line). */
function radialFade(): THREE.Texture | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grd.addColorStop(0, '#fff')
  grd.addColorStop(0.28, '#fff')
  grd.addColorStop(0.62, '#555')
  grd.addColorStop(1, '#000')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  return t
}

/** Studio floor: near-black satin that fades out radially. */
export const floorMaterial = new THREE.MeshStandardMaterial({
  name: 'eclat-floor',
  color: new THREE.Color('#0b0a09'),
  roughness: 0.72,
  metalness: 0,
  envMapIntensity: 0.05,
  transparent: true,
  depthWrite: false,
  alphaMap: radialFade(),
})
