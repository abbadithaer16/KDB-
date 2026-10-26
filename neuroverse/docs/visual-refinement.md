# NEUROVERSE — Visual refinement against the client reference

Status: proposal, awaiting approval (Checkpoint 2, revision 3). Planning only, no production code.

The client's reference image is a **quality benchmark**, not a layout, asset or anatomical
authority. It is not copied, traced or used as a texture, and none of its text, labels or
anatomy is assumed correct.

## 1. What makes the reference compelling, and what WebGL can achieve

| Quality in the reference | Achievable in Three.js / R3F? | How |
|---|---|---|
| Dense, realistic gyri and sulci | **Yes, if the geometry has it.** Lighting cannot invent folds | Real anatomical meshes (see §5). BodyParts3D 3.0 inspection shows convincing gyral detail at about 1 mm edge length |
| Wet, soft tissue with depth | **Mostly.** True subsurface scattering is too expensive in real time | Custom tissue shader: wrap lighting for soft light bleed, a sheen lobe for the wet surface, cavity darkening baked from geometry, a subtle surface-detail normal |
| Violet / warm two-tone lighting | **Yes** | Area-style key and rim lights plus an environment map made in-house. Needs a palette decision (§4, decision 1) |
| Glow on signals and highlights | **Yes, with a budget** | Selective bloom (only emissive elements), via `@react-three/postprocessing`. Reduced on mobile |
| Shallow depth of field, bokeh | **Desktop yes; phones only partially** | Depth-of-field pass during transitions and scene 3; replaced by a cheaper blur or none on phones |
| Glassy translucent cortex (scene 4) | **Yes, with care** | Fresnel-based shell shader, drawn after opaque deep structures, depth write off. Some sorting artefacts possible at grazing angles |
| Cut surfaces through the brain | **Yes** | Clipping planes with a "cap" so the cut reads as a solid surface (stencil technique) |
| Line-work brain (scene 5) | **Yes** | Contour and crease lines from the real geometry (precomputed plane slices plus a screen-space edge pass) |
| Detailed neuron with glowing segments | **Yes** | Tube geometry generated from a real reconstruction; segment highlights and the signal driven by a shader along the tube |
| Background "forest" of glowing neurons | **Partly** | 20–40 instanced, lower-detail reconstructions with depth of field on desktop. Not hundreds |
| Volumetric light shafts and haze | **No, not in this timeline** | Replaced by lighting gradients, vignette and depth of field. No fog used to hide detail |
| Luminous fibre bundles inside a holographic brain (scene 1) | **No, not honestly** | Real fibre tracts would need diffusion-imaging tractography data with its own licences. Replaced by glowing edges of real computed cross-sections |
| Editorial typography and annotations | **Yes** | HTML overlay with leader lines anchored to 3D points; Newsreader and Atkinson Hyperlegible Next |
| Picture-in-picture midsagittal inset (scene 2) | Possible, but not needed | Our full section sweep shows the same anatomy at full size. Avoids a second view |

Real-time limits stated plainly:
- The reference is almost certainly an offline, AI-generated image. Real-time output will be
  sharper in geometry and more honest in anatomy, but less soft and atmospheric.
- iPhone Safari gets a lighter tier: no depth of field, reduced bloom, simpler transparency.
  It stays real-time 3D; it is not replaced by images.

## 2. What each effect needs

| Need | Effects that depend on it |
|---|---|
| **Anatomical models** | Brain surface (scenes 1, 2, 4, 5); lobes; corpus callosum, thalamus; hippocampus, amygdala, fornix; cerebellum, brainstem |
| **Scientific data** | Neuron morphology (scene 3) from a reconstruction file |
| **Custom shaders** | Tissue; translucent cortex; signal travelling along the axon; selection edge; section cap; line work |
| **Procedural geometry** | Neuron tubes from data; myelin segments; synapse (terminal, vesicles, receptors, cleft); neurotransmitter particles; slice contours computed from the brain mesh |
| **Postprocessing** | Tone mapping, selective bloom, depth of field, vignette, anti-aliasing |
| **Made in-house** | Environment lighting map; small surface-detail normal texture |
| **Offline pipeline** | OBJ/STL → clean → smooth deep structures → merge into regions → decimate to budget → GLB with meshopt compression |

## 3. Gaps between our storyboard and the reference

| Area | Our storyboard | Reference | Change proposed |
|---|---|---|---|
| Lighting | Neutral key, soft fill, thin rim; violet only as meaning | Warm key with violet rim and glow | Warm-neutral key plus a **desaturated violet rim** (decision 1) |
| Materials | Matte tissue with faint sheen | Rich, wet, layered tissue | Full tissue shader (§1) |
| Depth | Mostly flat backgrounds | Depth of field, foreground and background layers | Depth of field in transitions; scene 3 background neurons; scene 1 slice planes in depth |
| Labels | Names only | Name plus a one-line role | **Add one-line roles**, each from the fact register |
| Scene 1 | Contours consolidate into the brain | Glowing holographic brain with slice planes | Keep construction; add translucent slice planes in depth and glowing slice edges |
| Scene 2 | One region violet at a time | Every lobe a different colour | Keep **one violet region at a time**; optional "all lobes" view uses outlines and labels, not a rainbow (decision 2) |
| Scene 3 | Neuron, signal, synapse beats | Immersive glowing neuron in a neural forest | Add background neurons with depth of field, myelin segments, glowing terminals; camera travels along the axon |
| Scene 4 | Translucent cortex with violet paths | Glassy cortex, glowing deep structures | Keep; pathways follow the **real fornix mesh** rather than invented curves |
| Scene 5 | Line work on a lit plate | Half tissue, half line work | Use the split as the **transition**: a sweep converts tissue into line work, then the final frame is fully drawn (decision 3) |
| Interface | Plain "2 of 5" counter | "02 / 05", tracked all-caps wordmark, numbered progress | Keep ours: sentence case, five short progress ticks plus "2 of 5" (decision 4) |

Reference content I will not trust without sources (examples, not an exhaustive review): the
coloured lobe boundaries in scene 2; one-line functions such as "Cerebellum: coordination and
learning"; the "5 cm" scale bars; the shape and position of the hippocampus arc and the glowing
amygdala sphere in scene 4; the structure of the synapse inset in scene 3.

## 4. Storyboard updates

### Global
- **Lighting:** warm-neutral key (no stronger than a soft tungsten tint), a low cool fill, and a
  desaturated violet rim for separation. Fully saturated violet stays reserved for meaning
  (selection, the electrical signal, contours). Amber stays reserved for the chemical signal.
- **Materials:** grey matter `#A89A8E` base with sheen and cavity shading; white matter
  `#D6CEC3` on cut surfaces, smoother and flatter-lit; deep structures in tissue tones.
- **Labels:** name plus a one-line role (≤ 8 words), both from the fact register.
- **Transitions:** depth of field opens during camera moves and closes before the frame locks.

### Scene 1 — Taking Shape
Translucent slice planes stand in depth along the brain; their edges glow violet where each
plane cuts the real mesh. The camera travels between planes; the planes fill with tissue and
the brain consolidates. Ends locked on the anterolateral three-quarter view. Still no light
reveal: the brain is built, not discovered.

### Scene 2 — The Architecture of Thought
Teaching frame on the left lateral view with the tissue shader at full quality. Lobe labels with
roles. Selection: the region gains a violet edge and tint, the rest dims. The section sweep
reveals the corpus callosum and thalamus with capped cut surfaces in white matter tone.
Explore Mode unchanged.

### Scene 3 — The Neural Network
- **In:** descent toward the cortex surface with depth of field, then a cross-exposure into the
  cellular scale.
- **Neuron:** a real reconstruction rendered as soft tissue, with a dark, deep background of
  blurred neurons for scale and depth.
- **Signal:** the presenter triggers it; the camera travels alongside the axon; the signal moves
  in violet, jumping between myelin segments if the axon shown is myelinated (to be confirmed in
  the fact register). Labelled "Slowed down".
- **Synapse:** cross-exposure to a close-up; vesicles and neurotransmitter in amber, receptors on
  the next neuron. Labelled "Simplified", "Not to scale".

### Scene 4 — Memory & Emotion
Glassy cortex shell; hippocampus, amygdala and prefrontal cortex lit as solid tissue inside.
Pathways shown only where a real connection is sourced; the fornix is a real tract present in
the asset and can carry the illuminated pathway.

### Scene 5 — The Human Mind
A section plane sweeps across the brain; behind it, tissue becomes line work. Ground exposure
rises from charcoal to the lit plate. The final frame is fully drawn, with violet threads marking
the structures from the journey and the scene 1 contours returning.

## 5. Asset acquisition and licensing strategy

### What I could inspect

The official sites are still blocked. GitHub is reachable, and hosts a third-party mirror of
BodyParts3D ([Kevin-Mattheus-Moerman/BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)).
A mirror is **not** licence evidence; it let me inspect the geometry.

Findings from the mirror (release **3.0**, 2011-09-15, the 95%-reduction set):
- The mirror's copy of the release README and licence notice states **CC BY-SA 2.1 Japan**,
  with a required credit line. This applies to the 3.0 files; whether the current licence page
  also covers 3.0 is unknown.
- 71 brain-related meshes, including: frontal, parietal, temporal and limbic gyri; occipital
  lobes; insula; corpus callosum; left and right thalamus; hippocampus; amygdala; fornix;
  caudate; putamen; lateral ventricles; cerebellum; pons; medulla; midbrain.
- About 1.75 million triangles in total. Cortical gyri have a median edge of about 0.95 (model
  units, probably mm); deep structures 0.2–0.8.
- **Lobe grouping works:** gyri can be merged into the four lobes plus insula and limbic gyri.
- **Possible anatomical gap:** meshes named "accessory short gyrus" (an insular term) appear on
  the lateral surface where the inferior frontal gyrus would normally sit, and no inferior
  frontal gyrus is listed. Either a naming quirk or a missing frontal operculum. Needs anatomical
  review against an atlas before the asset gate.
- **Surface artefacts:** hippocampus and corpus callosum show stair-step (voxel) artefacts. They
  can be smoothed at the source in the pipeline; smoothing must not change their shape
  materially, and the asset gate checks that.
- Not verified: provenance of the mirror against the official files; any 4.0 comparison (the
  mirror's author chose 3.0 because 4.0 "appears to have intersecting skin/muscle areas").

### Strategy

| Asset | Plan | Licence position | Your approval needed |
|---|---|---|---|
| Brain | BodyParts3D. Prefer **3.0 (95%)** for detail unless 4.0 proves equal | 3.0: CC BY-SA 2.1 JP (mirror copy). Current licence page: reportedly CC BY 4.0, scope unknown. **Read both official pages and the headers of the exact files before use** | Yes: if 3.0 stays BY-SA, the optimised GLB files must be shared under BY-SA with the credit line. The app code is separate |
| Neuron | NeuroMorpho.Org human neocortical pyramidal neuron | Reportedly CC BY 4.0 with citations; verify on the terms page and the individual record | No, if CC BY 4.0 is confirmed |
| Synapse | In-house procedural | Ours | No |
| Tel Aviv University models | Excluded | Reportedly CC BY-NC-ND 4.0: no commercial use or modification | Only if we ask TAU for permission |
| Fallbacks | NIH 3D Print Exchange MRI-derived brain models, reportedly CC or public domain per model ([LiveScience](https://www.livescience.com/46393-nih-3d-print-exchange.html), [Vanderbilt](https://exhibitions.library.vanderbilt.edu/thinking3d/item/3d-printed-healthy-human-brain-3d-print-file-created-by-nevit-dilmen)); SPL/NAC brain atlas, "3D Slicer License section B", commercial terms unknown ([Open Anatomy](https://openanatomy.org/atlas-pages/atlas-spl-nac-brain.html)) | Unverified | Yes, before use |
| Purchased model | Only as a last resort | Licence must allow real-time web use | Yes, before purchase |

Verification steps once network access exists:
1. Read the official BodyParts3D licence page, the README of the exact release, and the licence
   text inside the downloaded files; record all three in `ASSETS.md`.
2. Compare 3.0 and 4.0 brain geometry if 4.0 turns out to be CC BY 4.0.
3. Read the NeuroMorpho terms and the chosen neuron's record (species, region, completeness of
   the axon, original paper).
4. Anatomical review of the brain against a reference atlas, including the inferior frontal
   gyrus question.

## 6. Technically unrealistic in this timeline, with alternatives

| Reference effect | Why not | Alternative |
|---|---|---|
| Glowing fibre bundles throughout the brain | Needs tractography data and licences; too heavy | Glowing edges of real cross-sections (scene 1); the real fornix tract (scene 4) |
| Volumetric light and haze | Expensive on mobile; risks hiding geometry | Lighting gradients, vignette, depth of field |
| Hundreds of glowing neurons in depth | Draw calls and memory on phones | 20–40 instanced reconstructions, depth of field on desktop |
| True subsurface scattering | Too costly in real time | Wrap lighting, sheen and cavity shading |
| Equal quality on iPhone | GPU and memory limits | A lighter tier: no depth of field, reduced bloom, simpler transparency, same geometry at lower detail |
| A fully myelinated axon from data | Many reconstructions have incomplete axons (to be checked) | Use the data where it exists; any procedural continuation labelled "Illustrative" |

Schedule risk: matching the reference's polish across all five scenes, plus mobile, by Friday
is not certain. Proposed priority if time runs short: scenes 2 and 3 at full quality first,
then scenes 1 and 5 (they share the slicing and line-work technology), then scene 4
(transparency carries the most risk).

## 7. Scene 2 real-time proof

Not started. The geometry is reachable through the mirror, but its licence is not verified, and
3.0 appears to be CC BY-SA, which needs your approval. Proposed scope, if you approve:

- **What:** one real-time WebGL scene: the left lateral teaching frame with the real BodyParts3D
  geometry, the tissue shader, the lighting rig, lobe selection with dimming and violet edge,
  leader-line labels, and the start of the section sweep with a capped cut.
- **Where:** a separate branch (`neuroverse-proof`), not production code, not deployed.
- **Dependencies:** installing pinned versions of three, @react-three/fiber, @react-three/drei and
  @react-three/postprocessing, an explicit exception to "no installs before Checkpoint 4".
- **Evidence:** screenshots and a short screen recording from the container (software WebGL, so
  visual evidence only, never performance evidence), plus a link you can open on a real device
  if a preview host is available.
- **Time:** about half a day.
