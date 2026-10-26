# Scene 2 proof — technical assessment (26 Oct 2026)

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
| **Payload**: model 11.0 MB raw, 5.8 MB gzipped (budget 2.5 MB critical path) | High | Meshopt quantisation and compression, drop structures no scene uses, stream after the intro. Estimated 1.5–2.5 MB; must be measured |
| **Faceting** at silhouettes and in close-ups (99% polygon reduction) | Medium | Keep teaching frames at this distance; consider smoothing at the source (checked at the asset gate) or the 3.0 set (CC BY-SA) if close-ups are required |
| **Dimming** of unselected regions is gentler than the specified 3.5:1 | Low | Increase the dim mix; check against the contrast target |
| Some leader lines cross tissue (frontal) | Low | Split labels across both margins in the lateral frame |
| JS bundle 380 KB gzipped | Low | Code-split three/R3F from the shell; lazy-load Explore Mode |
| Each mesh drawn up to three times (tissue, cut cap, outline) | Low | Caps only while cutting (done); outlines only for the selected region (done) |
| Estimated 32 draw calls and 367k triangles in the lateral frame | Estimated | Real-device measurement required, especially iPhone Safari |

## Not proven by this proof

Real-device frame rate and memory (iPhone, Android, Safari, Firefox); depth of field and bloom;
the transitions into and out of Scene 2; scientific copy (pending the fact register); the
non-WebGL fallback.
