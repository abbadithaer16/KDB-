# ÉCLAT — asset audit

## 3D models — original work (no third-party rights)

No suitable, clearly licensed jewellery GLBs were reachable from this environment (Sketchfab,
Poly Haven and similar hosts are blocked by the network policy), so all three pieces were
**modelled procedurally for this project** with Blender 5.2 (`bpy`) — see `blender/geo.py`.

| Piece | Construction | Web asset |
|-------|--------------|-----------|
| **Aube** solitaire ring | 7.6 mm round brilliant (≈ Tolkowsky proportions: 53.6 % table, 34.5° crown, 40.75° pavilion, 60 % depth). Facets are exact planes (57 facets; scalloped 64-segment girdle). Tapered comfort-fit band (superellipse section), four ball-tipped claws swept along splines, gallery rail, cathedral arches. | `public/models/ring.glb` — 230 KB |
| **Lueur** pendant necklace | 6.4 mm round brilliant in a six-claw basket with two twisted-rope galleries and side loops; ~ 270 cable links (single instanced mesh, alternating 90°) draped over a velvet display form; spring-ring clasp and tag. | `public/models/necklace.glb` — 467 KB (bust included) |
| **Rivière** line bracelet | 42 × 3.1 mm round brilliants, each in a four-claw basket with two square galleries; hinge tongues and pins; box clasp with safety lever. Laid flat, stones up. | `public/models/bracelet.glb` — 65 KB |

All GLBs use `EXT_mesh_gpu_instancing` and meshopt compression (positions are quantized; the
diamond geometry is de-quantized at runtime before its BVH is built — see `Jewel.tsx`).

## Lighting — original

* `public/env/studio.hdr` — dark jewellery studio (softboxes, strip lights, small hard keys), rendered in Cycles.
* `public/env/gems.hdr` — "light-tent" environment used **only** for the diamonds' refraction lookups
  (bright dome, zebra strips, black flags, scattered small panels). Giving stones their own
  environment is standard practice in jewellery configurators; the path-traced stills use the
  same environment for rays that have passed through a stone.

## Photography

| Key | Source | Rights |
|-----|--------|--------|
| `campaign`, `campaign_portrait`, `finale`, `finale_portrait`, `card_ring`, `card_necklace`, `bracelet_silk`, `bracelet_macro`, `macro_diamond`, `macro_chain`, `worn` | **Original** Cycles path-traced renders of the models above (`blender/render_stills.py`) | Owned by the project — no third-party rights |
| `client_ring_round`, `client_ring_pear`, `client_pendant`, `client_bracelet_gold`, `client_bracelet_white` | **Supplied by the client** in chat as phone screenshots; cropped to the photograph only | **Unverified.** Origin and licence unknown. Several look AI-generated; one or more may depict a third-party retailer's product. Used here only as mood/reference imagery in the craft section and product galleries, captioned as client references. **Confirm rights or replace before any public use.** |

Not available: **photography of models wearing the jewellery.** Stock-photo hosts (Unsplash,
Pexels, Wikimedia) are blocked by this environment's network policy, and fabricating people was
out of scope. The necklace's "worn" image is therefore the piece on a black velvet display form
(a real jewellery-photography convention). A licensed model-worn campaign shoot is the main
asset still needed — it would slot into `worn` and the necklace editorial column without code
changes (add the file to `assets-src/stills` or `assets-src/client` and run `node scripts/images.mjs`).

## Type & libraries

* Cormorant Garamond, Manrope — SIL Open Font License 1.1 (self-hosted via `@fontsource`).
* three.js, @react-three/fiber, @react-three/drei, Lenis — MIT. GSAP 3 — GSAP standard licence
  (free, including commercial use). React — MIT.

## Honest limitations

* **Diamonds** use drei's `MeshRefractionMaterial`: real BVH-traced internal bounces (3 desktop / 2 mobile)
  but dispersion is approximated ("fast chroma"), there is no caustic light transport, and stone
  brightness relies on the dedicated gem environment. Convincing at web frame rates, but not a
  spectral renderer.
* **Geometry is procedural.** No hand-sculpted details: no claw seats cut into the girdle, no hallmarks,
  engraving, under-gallery piercing or micro-pavé. The bust is a simple sculptural form.
* **Stills** are denoised path traces at ~110 samples; extreme crops show denoiser smoothing.
* **Client images** are ~1200 px phone screenshots — fine as thumbnails and insets, too small for full-bleed.
* Visual QA ran in headless Chromium with software WebGL (SwiftShader). Real-device testing on
  iOS Safari / Android Chrome is still recommended, especially for refraction cost on older phones.
