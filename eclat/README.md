# ÉCLAT — The Art of Forever

A cinematic, scroll-directed 3D high-jewellery experience built as a **Hyperform portfolio
demonstration**. ÉCLAT is a fictional maison; nothing is for sale and no data is collected.

> Private demo — not deployed, not committed. Run locally (below).

## Run it

```bash
cd eclat
npm install
npm run dev          # http://127.0.0.1:5173
npm run build        # typecheck (tsc -b) + production build → dist/
npm run preview      # serve dist/ on http://127.0.0.1:4173
```

Useful query flags: `?nowebgl` (forces the photographic fallback) and
`?debug=nobeam,noshadow,nofloor` (isolates ring-stage elements during visual QA).

## The experience

| # | Scene | What drives it |
|---|-------|----------------|
| 00 | Preloader | Real progress: ring GLB, both HDRIs, shader compile, fonts, first campaign photo |
| 01 | The Awakening | Time-based reveal (beam, environment light, camera approach) then scroll |
| 02 | The Diamond | Sticky stage, 4 keyed macro shots (silhouette → facets → claws → gallery) |
| 03 | Campaign | Photograph opens from a vertical slit of light, zooms, copy reveals; ring stage dims behind it |
| 04 | The Necklace | Light rises as the campaign scrolls away; camera follows the chain to the pendant; "on the form" still in an adjacent column (stacked on portrait screens) |
| 05 | The Art of Craft | Opaque editorial sequence: animated divider, clip-path reveals, inner parallax, word-lit quote (WebGL paused) |
| 06 | The Bracelet | Studio turntable choreography; **Inspect in 360°** hands the camera to orbit controls and locks page scroll |
| 07 | Collections | Three editorial cards → product experience |
| 08 | Product experience | Live 3D inspection (drag / wheel / pinch, reset), yellow ↔ white gold, gallery, prev/next, enquiry |
| 09 | Private Viewing | Full-bleed final campaign + CTA → clearly-labelled demo enquiry (validates locally, sends nothing) |

## Architecture

```
src/
  three/
    Stage.tsx      single fixed <Canvas>: Director (camera rig), piece scenes, lights, OrbitControls
    shots.ts       keyed camera choreography per piece — separate wide/tall framings
    Jewel.tsx      GLB loader: metals → shared PBR material, diamonds → MeshRefractionMaterial (BVH-traced)
    materials.ts   gold/white-gold, velvet, fading studio floor
  lib/
    state.ts       `rig` (mutable per-frame values) + tiny UI store
    stage.ts       section phases → per-piece light levels + whether WebGL renders at all
    scroll.ts      Lenis + GSAP ScrollTrigger
  components/      Preloader, Nav, Cursor, Picture, ProductDetail, Enquiry, InspectBar, sections/*
blender/           bpy scripts that model every piece, render the HDRIs and the editorial stills
scripts/images.mjs AVIF/WebP ladders + LQIP + manifest
tests/             Playwright QA harness (screenshots, interactions, scroll stress)
```

* **Deterministic scroll.** Every camera pose is a pure function of section progress
  (`sampleShots`); damping is applied afterwards, so fast or reversed scrolling always
  converges to the same frame. Scene changes happen behind full-bleed photography as cuts.
* **One WebGL context.** The canvas sits behind the page. It renders only while a 3D section
  is visible (or in inspection) and pauses under the craft/collections/finale sections, the menu
  and the enquiry modal.
* **Inspection without conflicts.** Inspection modes lock Lenis, raise the canvas above the page,
  run an "arrival" move to the inspection pose, then hand over to OrbitControls.
* **Mobile.** Portrait screens (< 0.85 aspect) get their own camera framings, bottom captions with
  a legibility scrim, a stacked editorial layout, a snap-scrolling card rail, fewer refraction
  bounces and a lower DPR cap.
* **Performance.** Meshopt-compressed GLBs with GPU instancing (one link / setting / stone mesh
  reused), critical-only preloading, necklace and bracelet streamed after the intro and
  pre-compiled on arrival, adaptive DPR (`PerformanceMonitor`), responsive AVIF/WebP with LQIP,
  lazy images, `prefers-reduced-motion` (no smooth scroll, instant intro, no parallax, shorter pins),
  and a photographic fallback when WebGL is unavailable.

## Asset pipeline (Blender 5.2 via `pip install bpy`)

```bash
python -m venv ~/.bpyenv && ~/.bpyenv/bin/pip install bpy==5.2.2 pillow
cd blender
~/.bpyenv/bin/python -I export_models.py --all     # models + studio HDRI → assets-src/
~/.bpyenv/bin/python -I -c "import build; build.make_gem_hdri('../public/env/gems.hdr')"
~/.bpyenv/bin/python -I render_stills.py [shot] [--draft]
cd .. && for m in ring necklace bracelet; do npx gltf-transform meshopt assets-src/$m.glb public/models/$m.glb --level medium; done
node scripts/images.mjs
```

See [ASSETS.md](ASSETS.md) for provenance, licences and known limitations.

## QA

```bash
node tests/shoot.mjs <outDir> 1440 900 desktop 0 '#diamond:0.43' …       # screenshots at scroll stops
ACTION=$PWD/tests/interact.mjs node tests/shoot.mjs <out> 390 844 mobile 0  # interaction suite
ACTION=$PWD/tests/stress.mjs   node tests/shoot.mjs <out> 1280 800 desktop 0 # rapid-scroll determinism (dev server)
```

The harness drives the pre-installed Chromium with SwiftShader (software WebGL), so frame rates
in tests are far below real hardware.
