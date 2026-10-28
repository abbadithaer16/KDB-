# NEUROVERSE — Scene 3 "Under the lens": look frames (for visual approval)

Status: 28 Oct 2026. Eight stills (four frames × desktop 1920×1080 and iPhone 390×844), rendered
from the live proof in headless Chromium with software WebGL. They are visual evidence only, not
performance evidence. Shared privately; not committed, not published. No full animation pass and
no Checkpoint 4 work.

## What changed from the previous proof

| Area | Change |
|---|---|
| Lighting | Soft warm-neutral key; low cool fill; two desaturated violet back-rims (scene 2's rim colour); a Fresnel edge on every branch |
| Depth | Exposure and colour graded by depth around the subject; ambient occlusion (desktop); depth of field on the trigger-zone hold and the chase only (desktop). Resting frames stay sharp |
| Width convention | Thin branches now have a minimum *world-space* radius set at the subject distance, so nearer branches draw thicker than farther ones. Before, every branch drew at the same pixel width, which flattened the cell. Still tagged "thin branches drawn wider at a distance" |
| Materials | Warm pale tissue with a broad sheen and no clearcoat (the clearcoat read as plastic); denser satin myelin |
| Signal | A real moving light that illuminates nearby membrane and myelin (shader, not bloom). Subtle selective bloom on desktop only. Nodes flare equally as they fire. At rest, a violet record of the signal's progress grades along the path |
| Camera | Opening: oblique, low three-quarter view on a 30° lens. Trigger zone: macro frame from below, with dendrites in the foreground. Chase: the camera leads the signal, so the front comes towards the lens and the renewed nodes recede behind it, rolled diagonally clear of the text. Reveal: the whole recorded cell on a 30° lens |
| Typography | The title steps back to a running head while the camera moves. Annotations have a ringed point, a hairline leader, the name, and a role line. Two-line legend (Recorded / Illustrative). A 100 µm scale bar on resting frames. On phones, annotations wrap rather than run off-screen |
| Sources | One credit line ("Neuron: NeuroMorpho.Org 290955 (Mohan et al. 2015) · CC BY 4.0 · Sources and changes"). It opens a modal with the three required citations, the licence link, every change made, and the text source. Focus moves into the modal, Esc closes it, and focus returns (tested) |
| Phone tier | No postprocessing. It keeps the rim, depth grading, Fresnel material and the signal light, adds a small halo for the front, and uses a CSS vignette |

New dependencies (exact versions; `npm audit` reports 0 vulnerabilities):
- `@react-three/postprocessing` 3.2.2: MIT, published 21 Oct 2026, 7 days before this proof. Its
  peer ranges cover three 0.186 and Fiber 9.8.
- `postprocessing` 6.39.5: zlib licence.
- `n8ao`, pulled in by the first package.

## My assessment, frame by frame

| Frame | Verdict | Remaining weakness |
|---|---|---|
| 2 Trigger zone | Strong on both screens: macro scale, clear hierarchy (cell body, then trigger zone, then axon), soft foreground | The cell body is the stored sphere; it reads as a smooth ball at this distance |
| 3 Signal chase | Strongest frame: the front's light falls on a real collateral, renewed nodes recede into soft focus, real perspective | Recorded tracing jitter is visible on the near axon (kept: it is the data) |
| 1 Opening | Improved (shading and rim now read at a 3 µm minimum width), but the most restrained frame | A whole 2.4 mm cell with sub-micrometre branches reads as a fine structure at full-cell scale. That is physically honest, but less sculptural than the close frames |
| 4 Reveal | Readable, well annotated; shows the full recorded length | The violet record of the signal's progress is subtle on desktop |

## Options if frames 1 and 4 are below your bar

These are offered without lowering the standard or inventing anatomy:
1. **Allow gentle depth of field on the opening only.** The focus would sit on the cell body,
   with the apical tuft and far basal dendrites soft. This breaks the "resting frames are sharp"
   rule, so it needs your approval.
2. **Open on a closer specimen frame** (the cell body and proximal dendrites filling the frame),
   then reveal the complete neuron in the full-length frame. This changes your brief for frame 1
   ("the complete neuron").
3. **Strengthen the reveal's violet record and the node markers** (about 30% brighter), with the
   bloom risk watched.
