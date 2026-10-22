import type { Piece } from './state'

/**
 * Fictional pieces for a portfolio demonstration. Specifications describe the
 * 3D models built for this site — they are not real inventory, and no prices,
 * stock levels or reviews are shown.
 */
export interface Product {
  id: string
  piece: Piece
  collection: 'Rings' | 'Necklaces' | 'Bracelets'
  name: string
  kind: string
  line: string
  description: string
  specs: [string, string][]
  images: string[] // image manifest keys
}

export const PRODUCTS: Product[] = [
  {
    id: 'aube',
    piece: 'ring',
    collection: 'Rings',
    name: 'Aube',
    kind: 'Solitaire ring',
    line: 'A single stone, lifted into the light.',
    description:
      'A round brilliant held high in four claws, carried on cathedral shoulders so that light can enter the stone from every side. The band narrows beneath the finger and widens as it rises, drawing the eye upward.',
    specs: [
      ['Centre stone', 'Round brilliant cut, 57 facets'],
      ['Setting', 'Four ball-tipped claws, open gallery rail'],
      ['Band', 'Tapered comfort-fit profile'],
      ['Metal (demo options)', 'Yellow gold · White gold'],
    ],
    images: ['card_ring', 'campaign', 'macro_diamond', 'client_ring_round'],
  },
  {
    id: 'lueur',
    piece: 'necklace',
    collection: 'Necklaces',
    name: 'Lueur',
    kind: 'Solitaire pendant',
    line: 'A point of light at the collarbone.',
    description:
      'A round brilliant suspended in a six-claw basket bound by twisted-rope galleries, threaded on a fine cable chain that falls in a soft V. Shown on a velvet display form.',
    specs: [
      ['Stone', 'Round brilliant cut, 57 facets'],
      ['Setting', 'Six claws, double twisted-rope gallery'],
      ['Chain', 'Cable link, spring-ring clasp'],
      ['Metal (demo options)', 'Yellow gold · White gold'],
    ],
    images: ['card_necklace', 'worn', 'macro_chain', 'client_pendant'],
  },
  {
    id: 'riviere',
    piece: 'bracelet',
    collection: 'Bracelets',
    name: 'Rivière',
    kind: 'Line bracelet',
    line: 'An unbroken line of light around the wrist.',
    description:
      'Forty-two round brilliants, each in its own four-claw basket, joined by hinged links so the line moves like fabric. A box clasp with a side safety catch closes the circle.',
    specs: [
      ['Stones', '42 round brilliants, 57 facets each'],
      ['Setting', 'Individual four-claw baskets, hinged links'],
      ['Clasp', 'Box clasp with safety catch'],
      ['Metal (demo options)', 'Yellow gold · White gold'],
    ],
    images: ['bracelet_silk', 'bracelet_macro', 'client_bracelet_gold', 'client_bracelet_white'],
  },
]

export const productById = (id: string | null) => PRODUCTS.find((p) => p.id === id) ?? null
