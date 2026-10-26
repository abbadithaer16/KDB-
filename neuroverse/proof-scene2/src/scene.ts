import { Color, Plane, Vector3 } from 'three'

/** Palette tokens from docs/decisions.md and visual-decisions.md (linear conversion by three). */
export const TOKENS = {
  charcoal: '#15171B',
  greyMatter: '#A89A8E',
  whiteMatter: '#D6CEC3',
  deepNuclei: '#A0948A',
  dimmed: '#47423F',
  violet: '#9C86F0',
  rimViolet: '#8F86B3',
  capGrey: '#8E8178',
  capWhite: '#CFC6BA',
}

export type LabelDef = { id: string; name: string; regions: string[] }

/** Teaching-frame labels per view. Names are BodyParts3D/FMA anatomical terms. */
export const LABELS: Record<'lateral' | 'section', LabelDef[]> = {
  lateral: [
    { id: 'frontal', name: 'Frontal lobe', regions: ['frontal'] },
    { id: 'parietal', name: 'Parietal lobe', regions: ['parietal'] },
    { id: 'occipital', name: 'Occipital lobe', regions: ['occipital'] },
    { id: 'temporal', name: 'Temporal lobe', regions: ['temporal'] },
    { id: 'cerebellum', name: 'Cerebellum', regions: ['cerebellum'] },
    { id: 'brainstem', name: 'Brainstem', regions: ['brainstem'] },
  ],
  section: [
    { id: 'callosum', name: 'Corpus callosum', regions: ['callosum'] },
    { id: 'thalamus', name: 'Thalamus', regions: ['thalamus'] },
    { id: 'limbic', name: 'Cingulate gyrus', regions: ['limbic'] },
    { id: 'cerebellum', name: 'Cerebellum', regions: ['cerebellum'] },
    { id: 'brainstem', name: 'Brainstem', regions: ['brainstem'] },
  ],
}

export const GREY_MATTER = new Set(['frontal', 'parietal', 'temporal', 'occipital', 'insula', 'limbic', 'cerebellum'])
export const WHITE = new Set(['whitematter', 'callosum', 'fornix'])

/** World-space anchor per `${view}:${label}`, found from the geometry at load (Brain.tsx). */
export const anchorPoints: Record<string, Vector3> = {}

/** Where on each region's bounding box a label should point: [front-to-back, bottom-to-top]. */
export const ANCHOR_TARGETS: Record<string, [number, number]> = {
  'lateral:frontal': [0.35, 0.62],
  'lateral:parietal': [0.5, 0.72],
  'lateral:temporal': [0.42, 0.3],
  'lateral:occipital': [0.8, 0.62],
  'lateral:cerebellum': [0.62, 0.45],
  'lateral:brainstem': [0.45, 0.18],
  'section:callosum': [0.5, 0.85],
  'section:thalamus': [0.5, 0.5],
  'section:limbic': [0.45, 0.85],
  'section:cerebellum': [0.4, 0.5],
  'section:brainstem': [0.5, 0.3],
}

/** Sweep plane for the left hemisphere and midline parts: keeps z <= constant. 2 = no cut. */
export const sectionPlane = new Plane(new Vector3(0, 0, -1), 2)
export const SECTION_CONSTANT = 0

export const color = (hex: string) => new Color(hex)
