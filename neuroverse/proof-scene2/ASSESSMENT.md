# Scene 2 proof — technical assessment (26 Oct 2026, round 2)

Evidence: screenshots and a screen recording from headless Chromium with **software WebGL
(SwiftShader)** in a container. They show what renders; they say nothing about speed on real
hardware. No real-device measurement has been made.

## What the proof establishes

| Question | Result |
|---|---|
| Can the verified anatomical source carry the scene? | Yes. BodyParts3D 4.0 renders as a credible, recognisable brain at teaching distance; lobes, cerebellum and brainstem read clearly |
| Does the midsagittal section work? | Yes. Sweeping a plane through the left hemisphere, then removing it, shows the right hemisphere's medial surface with the corpus callosum cut on the midline, thalamus, brainstem and cerebellum in section |
| Lobe selection | Works: violet tint plus outline, label and leader line highlighted; pointer, label buttons, Tab/Enter, Esc |
| Labels | Anchors are computed so every dot sits on a visible part of its structure; order avoids crossing lines |
| Explore Mode | Orbit and zoom with limits, reset, exact return to the teaching frame |
| Phones and reduced motion | Separate framing and a label list on narrow screens; transitions become cuts with reduced motion |
| Build health | `tsc` strict and production build pass; `npm audit` 0 vulnerabilities; console clean except a deprecation warning from React Three Fiber's internals on three r186 |

## Problems found and their remedies

| Issue | Severity | Remedy for production |
|---|---|---|
| **Payload**: was 11.0 MB raw / 5.8 MB gzipped. **Round 2: 2.76 MB file, 2.11 MB gzip, 1.96 MB Brotli** (meshopt + 14-bit positions, 10-bit normals, 8-bit cavity; largest position change 0.007 mm). JS 380 KB gzip, fonts about 250 KB. Critical path about 2.6 MB: just over the 2.5 MB target | Medium | Load the visible cortex first and stream deep structures after the first frame; code-split the JS. Measure on 4G |
| **Faceting** at silhouettes and in close-ups (99% polygon reduction) | Medium | Keep teaching frames at this distance; consider smoothing at the source (checked at the asset gate) or the 3.0 set (CC BY-SA) if close-ups are required |
| **Dimming**: fixed in round 2 (3.5:1 between selected and dimmed tissue). Trade-off: dimmed tissue is 1.8:1 against the background; the rim light keeps the silhouette | Done |
| Leader lines crossing tissue: fixed in round 2 (labels split across both margins; callosum label anchored on its cut face) | Done |
| JS bundle 380 KB gzipped | Low | Code-split three/R3F from the shell; lazy-load Explore Mode |
| Each mesh drawn up to three times (tissue, cut cap, outline) | Low | Caps only while cutting (done); outlines only for the selected region (done) |
| Estimated 32 draw calls and 367k triangles in the lateral frame | Estimated | Real-device measurement required, especially iPhone Safari |

## Not proven by this proof

Real-device frame rate and memory (iPhone, Android, Safari, Firefox); depth of field and bloom;
the transitions into and out of Scene 2; scientific copy (pending the fact register); the
non-WebGL fallback.

## Round 2 loading behaviour

The page shell (title, controls) appears immediately; the brain appears when the whole model has
downloaded and decoded, with a "Loading the brain model" line until then. Estimated download on a
typical 4G link (about 10 Mbit/s): about 2–3 s for the model plus the JS. **Not measured.**

The claude.ai preview build differs: that host does not serve `.glb` files and may block WebAssembly, so it
ships the same quantised geometry without meshopt compression, as base64 text (7.9 MB, served
compressed by the host if it supports it). Use the Vercel preview for loading-time judgements.
