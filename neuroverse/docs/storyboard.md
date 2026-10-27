# NEUROVERSE — Checkpoint 3: Cinematic storyboard

Status: **for review, 27 Oct 2026.** No Checkpoint 4 work, no production code, no merges, and no
deployment until you approve it.

The deliverables are spread across these files:

| | Deliverable | File |
|---|---|---|
| G | Executive summary | this file, first section |
| A | Scene-by-scene storyboard | this file |
| B | Camera and transition choreography | `choreography.md` |
| C | Visual-system consistency matrix | `visual-system.md` |
| D | Asset and scientific-evidence register | `evidence-register.md`, with draft copy in `fact-register.md` |
| E | Mobile, accessibility and reduced-motion plan | `adaptation-plan.md` |
| F | Decisions and risks awaiting your approval | `checkpoint3-approvals.md` |

This document replaces `storyboard-draft.html` (Checkpoint 2) wherever they differ. Copy marked
with a fact ID (for example `[F2.3]`) is a draft from `fact-register.md`. Nothing ships until its
entry is marked *Checked*.

---

## G. Executive summary

NEUROVERSE is a five-step lecture about the human brain. It is built around one physical
object: a real, anatomically sourced 3D brain that the audience sees, cuts and looks inside.

**Why it feels cinematic.** The approved Exposure grammar is kept. The camera holds still
while the presenter teaches, then moves once, with purpose, between ideas. The camera has a
small vocabulary of moves, and each one carries a meaning:
- **Cutting** shows what is inside. Each cut uses one of anatomy's three standard planes:
  horizontal in scene 1, midline in scene 2 and front-to-back in scene 5.
- **Descent with a cross-exposure** changes scale.
- **Translucency** shows things that work together.

The single autonomous event in the presentation is one triggered nerve signal in scene 3.
Because motion is scarce, the moments that do move register.

**Why it feels premium.** It is premium because it is restrained:
- Realistic tissue under a warm key light with a desaturated violet rim.
- Real cut faces showing grey and white matter.
- Two typefaces handled with editorial discipline.
- A finale in which the realistic brain is redrawn as an anatomical plate.

There is no HUD, glow is never ambient, and nothing is on a loop. Every frame is meant to read
like a plate from a modern atlas that happens to move.

**Why it is scientifically credible:**
- The brain is BodyParts3D anatomy.
- The neuron is a real human cell reconstructed from microscopy, recorded in the left middle
  temporal gyrus. The descent into scene 3 lands on that same gyrus, so the jump in scale is
  geographically true.
- Copy comes from sources we have read; every claim has a fact ID.
- Each artistic liberty is labelled on screen where it appears: "Illustrative colour",
  "Slowed down", "Simplified", "Not to scale".
- Scene 4 shows memory and emotion as networks, not single centres.
- Scene 5 says plainly that how brain activity becomes experience is still an open question.

**Why it is distinct from ÉCLAT:**
- Step navigation, not scroll.
- Construction by cross-section, not a beam of light revealing an object.
- Cool black with violet, not warm obsidian with gold.
- Newsreader and Atkinson, not Cormorant and Manrope.
- An atlas field with margin labels, not full-bleed product staging.
- A light-ground finale; ÉCLAT never leaves the dark.

**What it proves to a buyer.** It shows Hyperform can turn rigorous academic content into an
interactive 3D lecture that a professor can present from a clicker and a student can explore on
a phone.

**Honest limits:**
- Several facts, the neuron's licence and the BodyParts3D licence are not yet resolved.
- Nothing about performance is measured.
- The Friday 30 Oct date is not realistic for this scope at full quality. Options are in
  `checkpoint3-approvals.md`.

---

## Site-wide cinematic grammar

| Element | Rule |
|---|---|
| Page shell | One full-viewport stage. A small "Neuroverse" wordmark and the scene title sit top left; "2 of 5" with five ticks sits top right; the dock (labels, caption, controls, credit) sits bottom left. The shell never scrolls |
| Navigation posture | The presenter is in charge. One input moves one beat. Nothing advances on its own |
| Teaching frames | The camera is locked while text is on screen. Long lens (24–28° vertical field of view in brain scenes, about 48–56 mm full-frame equivalent). The subject fills 52–70% of frame height, off-centre against the margin text |
| Transitions | One choreographed move per beat change, 1.6–7.6 s. Labels leave first and return after the camera settles. Every move is a pure function of its progress, so it can be interrupted and lands on the same frame |
| Camera verbs | **Cut** (section plane: shows inside). **Descend + cross-exposure** (changes scale). **Translucency** (shows a network). **Orbit** (changes the standard view). Nothing else |
| Anatomical planes | Scene 1 horizontal (axial), scene 2 midline (sagittal), scene 5 front-to-back (coronal). The three standard atlas planes, one per cut, form a quiet structural rhyme across the lecture |
| Light | Warm-neutral key, low cool fill, desaturated violet rim in brain scenes. Saturated violet only for meaning: selection, the electrical signal, the location marker. Amber only for neurotransmitter in scene 3 |
| Exposure arc | Abyss (scenes 1, 3) and charcoal (scenes 2, 4) give way to the lit plate (scene 5) |
| Density cadence | 1 sparse, 2 dense (up to 6 labels), 3 sparse to medium (up to 5 labels per beat), 4 medium, 5 sparse |
| Recurring materials | Tissue (wet sheen, cavity shading); cut faces (grey ribbon over white matter); ink line (scenes 1 and 5) |
| What may repeat | The shell, label style, selection treatment, scale bar, caption style. What may not repeat: the same reveal method in adjacent scenes, or the same composition side in adjacent teaching frames |

Restraint statement: no particles except the scene 3 neurotransmitter release, no bloom except
on the signal colour, no fog, no lens flares, no camera shake, no auto-rotation, no ambient
pulsing, no glowing wireframes, no grid floors, no fake data readouts, no letter-spaced capitals.

---

## A. Scene-by-scene storyboard

Coordinates: one world unit is 100 mm. The brain's axes are x = posterior, y = superior,
z = the patient's left. Camera azimuth 0° looks at the left side of the brain, +90° looks from
behind, and −90° looks from the front. Distances are given for a 1920×1080 frame; the framing
function (as in the proof) recomputes them for every aspect ratio. "FOV" is the vertical field
of view, with the full-frame equivalent focal length in brackets.

### Scene 1 — The living fold

**1. Title and learning objective.** *The living fold.* The working title "The Awakening" is
retired because it was ÉCLAT's opening title. Objective: the brain is a physical organ whose
outer layer, the cortex, is a thin sheet of grey matter folded over white matter, and the folding
lets more grey matter fit inside the skull.

**2. On-screen narrative** (three beats):
- 1a (ready frame): "Neuroverse", the title *The living fold*, and "An introduction to the human
  brain in five steps." A **Begin** button.
- 1b (build): no text while the brain assembles.
- 1c (teaching frame): "The cerebral cortex is a sheet of grey matter about 2.5 mm thick,
  folded so that more of it fits inside the skull." `[F1.1]`
  - Labels: **Grey matter** (cortex) `[F1.1]`; **White matter** (fatty, myelinated fibres) `[F1.2]`.
  - Caption: "Horizontal section, computed from the 3D model".

**3. 3D subject.** The whole BodyParts3D brain, with both hemispheres, cerebellum and brainstem,
plus about 48 horizontal contour lines computed offline from the same meshes (about 3.5 mm
apart). It needs cortex (gyri) and white-matter meshes whose cut faces separate grey from white
(risk T1).

**4. Opening composition.**
- 1a: the camera looks straight down (elevation 88°), FOV 22° (62 mm), about 7.2 units away.
- A single violet contour, the topmost horizontal section of the cortex, is drawn at the optical
  centre on the abyss ground. It is small: about 18% of frame height.
- The title sits in the left third. The image reads as a precise abstract line, not yet a brain.

**5. Camera choreography** (detail in `choreography.md`, T1):
- Begin starts a 7.5 s sequence:
  1. Contours stack downward, one every 50 ms, so from above they read as a contour map
     (0–2.4 s).
  2. The camera tilts and orbits from looking down to the anterolateral three-quarter view
     (azimuth −40°, elevation 18°) and dollies in (2.0–5.2 s, power2.inOut). The map is
     revealed as a stack in depth, and then as a brain.
  3. Each contour fills into a thin tissue slab whose cut face shows grey and white matter; the
     slabs thicken until they close into the solid surface (4.6–7.0 s).
  4. The camera settles (7.0–7.5 s, power3.out).
- Any input during the sequence jumps to 1c within 300 ms. The input is consumed, not queued.
- Next from 1c raises the top of the brain: the part above a horizontal plane at 64% of brain
  height lifts by 18% of brain height (1.4 s, power3.inOut), opening the cut face. This is an
  exploded-view convention from anatomical atlases.

**6. Lighting, materials, colour:**
- Abyss `#07080A` ground.
- Lighting is constant from the first frame: warm-neutral key from upper front left, cool fill,
  desaturated violet rim. Nothing is revealed by light; the brain is built.
- Contours are self-coloured violet lines, 2 px at 1080p, which fade to 0 as tissue arrives.
- Tissue uses the production tissue material. Cut faces are grey `#8E8178` for the cortical
  ribbon and white `#CFC6BA` for white matter.

**7. Animation and interaction.** The build sequence is the scene's only autonomous animation,
and it plays only on the presenter's input. In 1c (exploded), the labels Grey matter and White
matter are clickable and highlight their part of the cut face. There is no other interaction.

**8. Presenter resting frame (1c, exploded):**
- The brain is right of centre, at 62% of frame height including the raised top. The camera is
  6.8 units away at azimuth −40°, elevation 18°, FOV 26° (52 mm).
- The title and statement sit in the left column.
- Two labels with leader lines point to the cut face. A scale bar reads "5 cm".
- At a projector's 1920×1080: title 72 px, statement 30 px, labels 26 px.
- The cut face is lit flatter than the surface so the grey ribbon reads from the back of a hall.

**9. Explore Mode.** Not available. This is the overview scene, as in the brief.

**10. Transitions:**
- In: from page load. The ready frame appears when the model is decoded and shaders are
  compiled. Its single contour draws itself in 1.2 s (power1.inOut).
- Out: to scene 2. The raised top lowers and rejoins (1.0 s), then the camera orbits to the
  left lateral view (3.0 s total).

**11. Mobile:**
- Portrait 1a: the contour is centred in the upper half, with the title and Begin underneath.
- Portrait 1c: no exploded view. A smaller lift (10%) is framed in the top 55% of the screen;
  the labels move to the dock list below.
- Tap Begin, or swipe left, to start. Tapping during the build skips to 1c.

**12. Reduced motion:**
- 1a is shown statically.
- Begin cuts (300 ms crossfade) straight to 1c with the brain already built. The build sequence
  is offered as an optional **Play the build** button and runs without camera movement: contours
  fill in place from a fixed view.

**13. Non-WebGL fallback.**
- An SVG of the horizontal contours, generated from the same contour data, so it is vector,
  crisp and accurate.
- A still of 1c rendered from the real app.
- The title, statement and labels as HTML, with a text description of the section.

**14. Assets and sources:**
- BodyParts3D 4.0 brain meshes; the horizontal contours are derived from them (same licence
  handling, see D).
- Facts: OpenStax *Anatomy and Physiology 2e* §13.2 (folding) and §16.2 (2.55 mm average
  thickness), §12.1 (white matter fatty from myelin).

**15. Performance and feasibility:**
- Contours: about 48 closed lines, simplified to about 40k segments in total, drawn in one draw
  call with a screen-space line width.
- Slab fill: one height-band shader on the existing meshes (fragments outside the band are
  discarded, and back faces drawn in cut colours), about 64 draw calls during the build.
- Main risk: cut-face fidelity (T1). Feasible in 0.5 day after Scene 2 production materials
  exist.

**16. Acceptance checklist:**
- [ ] The ready frame is shown only after the model is decoded and shaders are compiled (no
  shader compile hitch at Begin; checked with a frame-time trace on desktop).
- [ ] The build runs 7.5 s ±5%. Input at any moment lands on 1c within 300 ms, identical
  pixel-for-pixel to a direct deep link to `#living-fold` beat c.
- [ ] Contours match plane cuts of the shipped model (spot-check 5 contours against a CPU
  cross-section, max deviation < 0.5 mm).
- [ ] The cut face shows the grey ribbon and white matter distinctly (contrast ≥ 1.5:1 between
  them), or a "Simplified" caption is shown (T1).
- [ ] No light changes intensity during the sequence.
- [ ] Text at 1920×1080: title ≥ 72 px, statement ≥ 30 px, labels ≥ 26 px; contrast ≥ 7:1.
- [ ] 390×844: no overlap and no horizontal scroll; Begin is ≥ 44×44 px.
- [ ] Reduced motion: zero camera movement; the build plays only on request.
- [ ] Non-WebGL page carries the statement, both labels and a text description.
- [ ] Facts F1.1 and F1.2 are *Checked*.

---

### Scene 2 — The architecture of thought

**1. Title and learning objective.** *The architecture of thought.* Objective:
- Name and locate the four lobes, the cerebellum and the brainstem, and give a textbook-level
  role for each.
- Recognise that lobes are defined by landmarks and work together.
- Identify the corpus callosum and thalamus on a midline section.

**2. On-screen narrative:**
- 2a, left lateral view: "The cortex is mapped into four lobes using its largest folds as
  landmarks. Each lobe is linked with particular functions, but the lobes work together."
  `[F2.1]`
- 2a labels (name, then role, at most 8 words):
  - Frontal lobe: movement, planning, speech production `[F2.2]`
  - Parietal lobe: touch and body position `[F2.3]`
  - Temporal lobe: hearing and memory `[F2.4]`
  - Occipital lobe: vision `[F2.5]`
  - Cerebellum: compares movement with sensory feedback `[F2.6]`
  - Brainstem: connects the brain to the spinal cord `[F2.7]`
- 2b, midsagittal section: "Cut along the midline, the brain shows what joins it together."
  `[F2.8]`
- 2b labels:
  - Corpus callosum: main link between the hemispheres `[F2.8]`
  - Thalamus: relays sensory signals to the cortex `[F2.9]`
  - Cingulate gyrus: part of the limbic system `[F2.10]`
  - Cerebellum, Brainstem (names only)
- Caption per view ("Left lateral view", "Midsagittal section, seen from the left");
  "Highlight colour is illustrative" while something is selected.

**3. 3D subject.** The proof's region model (32 region meshes, 367k triangles): frontal,
parietal, temporal, occipital, insula, limbic, cerebellum, brainstem, white matter, corpus
callosum, fornix, thalamus. Production adds lobe boundary lines, precomputed on the mesh where
neighbouring regions meet, for the overview.

**4. Opening composition.**
- 2a: azimuth 0°, elevation 2.3°, FOV 26° (52 mm), about 6.9 units away.
- The brain sits at 52% of frame height, its centre at 52% across and 58% down.
- Labels are split by anatomy: anterior structures in the left margin, posterior structures in
  the right, so no leader line crosses tissue. This is kept from the proof, which got it right.

**5. Camera choreography:**
- In: from scene 1, a 3.0 s orbit (power2.inOut, settling with power3.out).
- 2a→2b: the proof's section move, retimed to 3.0 s:
  1. Orbit away to azimuth 24°, elevation 9° (1.4 s, power2.inOut).
  2. The plane sweeps through the left hemisphere (0.2–1.7 s, power1.inOut).
  3. The left hemisphere is hidden and the camera returns to the medial frame (1.6 s,
     power3.inOut).
- Interrupting jumps to the end state within 300 ms. Previous returns with a 450 ms crossfade.
- Explore selection: a 1.2 s glide to frame the structure. Any user input cancels it.

**6. Lighting, materials, colour.** Charcoal ground. Production improvements over the proof:
- **Tissue:**
  - wrap lighting for soft light bleed;
  - a fine surface-detail normal, generated in-house;
  - a sheen lobe tuned wetter;
  - cavity shading kept from the proof;
  - a slightly lower, more raking key to model the gyri.
- **Selected region:**
  - the rest dims to 3.5:1 (approved level);
  - the selection gets a violet tint and a **screen-space outline** with a constant 2 px width
    at any zoom, replacing the proof's inverted hull, whose width varied;
  - the label and leader line turn violet;
  - the outline also marks the region boundary on cut faces.
- **Section surfaces:**
  - the cut shows a grey cortical ribbon over white matter, from each mesh's own volume, lit
    flatter than the surface;
  - if the meshes cannot produce a credible ribbon (T1), the cut uses two-tone caps with the
    caption "Simplified cut surface".
- **Overview:** thin `--mist` lobe boundary lines (decision 2 from Checkpoint 2). No colour per
  lobe.

**7. Animation and interaction:**
- Tap, click or Tab+Enter on a structure or its label selects it; Esc clears.
- Labels draw in after the camera settles: the line extends from the margin (0.5 s), with the
  labels staggered by 60 ms. This is one of the scene's two reveals; the section sweep is the
  other.
- Lobe boundaries fade in with the 2a labels and are hidden in 2b.

**8. Presenter resting frames:**
- **2a:** lateral brain at centre right, six labels across two margins, the statement under the
  title. Projector: labels 26 px (name) and 20 px (role), leader lines 1.5 px.
- **2b:** the medial surface, five labels mostly in the left margin. The thalamus label points
  to the cut face, not into a cavity (as fixed in the proof).

**9. Explore Mode** (E, or the Explore button):
- Orbit with full azimuth and elevation limited to ±75°. Zoom from 0.6 to 1.6 × the teaching
  distance. No pan.
- Tap or click to select, with a card showing the name and role. Reset view (R).
- **Guided views:** buttons for Lateral, Medial (in the section view), Superior and Inferior,
  each a 1.2 s glide.
- In 2b, a **Cut depth** slider (a native range input, so it is keyboard- and
  screen-reader-accessible) moves the section plane.
- A one-line hint: "Drag to rotate · pinch or scroll to zoom · tap a structure".
- Leaving Explore (Esc or Leave explore) restores the exact 2a or 2b frame, as proven in the
  proof.

**10. Transitions.** In: orbit from scene 1's three-quarter view. Out: the descent to scene 3,
which starts from 2b (see scene 3).

**11. Mobile.**
- Portrait framing: the brain is centred in the upper 45%; labels become a wrapping list in the
  dock; leader lines are hidden; tapping a name highlights the structure. All of this is proven
  on iPhone Safari (functional only).
- Production adds:
  - the selected label's role as a one-line caption;
  - a 44 px minimum height for every label target;
  - a swipe on the dock (not the canvas) for next and previous in Presentation Mode.

**12. Reduced motion:**
- The section is a 300 ms crossfade between 2a and 2b.
- Labels appear without drawing in.
- Explore has no damping or inertia; guided views cut instead of gliding.

**13. Non-WebGL fallback.**
- Two rendered stills (lateral, midsagittal) with HTML labels positioned over them, so they are
  not baked into the image, and the same roles as text.
- Each label is a button that outlines its structure using an SVG mask exported from the same
  render, so selection still works without WebGL.

**14. Assets and sources:**
- BodyParts3D 4.0 (licence conflict preserved, see D).
- OpenStax §13.2 for lobes, cerebellum, brainstem, thalamus, corpus callosum and limbic cortex.
- The cingulate role still needs a source (F2.10).

**15. Performance and feasibility:**
- About 32 draw calls for tissue, plus caps while cutting, plus one outline pass; 367k triangles
  (Estimated).
- Model 2.11 MB gzip (Measured file size, not load time).
- The screen-space outline needs a selection mask pass. It is cheap but is a new postprocessing
  dependency (T7).
- Risk: faceting at Explore's closest zoom. The minimum distance is 0.6 × the teaching distance,
  checked at the asset gate.

**16. Acceptance checklist:**
- [ ] Every label's anchor dot lies on a visible point of its structure in both views
  (raycast-verified at 3 aspect ratios).
- [ ] No leader line crosses tissue or another line at 1920×1080, 1440×900 or 1280×800.
- [ ] Selection contrast: selected vs dimmed ≥ 3.5:1 (computed from rendered pixels); outline
  2 px ±0.5 at all zoom levels.
- [ ] Cut faces show grey and white matter, or carry the "Simplified" caption.
- [ ] Section move 3.0 s ±5%; interruption converges within 300 ms; leaving Explore restores
  the frame (camera pose within 0.001 units).
- [ ] Every 2a and 2b role is *Checked* in the fact register.
- [ ] Touch: rotate, pinch, tap-select, reset and leave-explore pass on iPhone Safari (you, on
  your device); swipe on the dock changes beats.
- [ ] Keyboard reaches every label, button and the slider in a logical order.

---

### Scene 3 — Electrical, then chemical

(Recommended title. "The neural network" is the alternative; see F.)

**1. Title and learning objective.** Objective:
- Identify the parts of a neuron and the one-way flow of information through it.
- Describe the action potential as an all-or-none electrical signal that travels along the axon
  and is renewed at nodes of Ranvier on myelinated axons.
- Describe the chemical steps at a typical chemical synapse.
- Tell the electrical and chemical stages apart.

**2. On-screen narrative** (three beats):
- **3a, the neuron:** "A neuron receives signals on its dendrites and sends them along a single
  axon." `[F3.1]`
  - Labels: Dendrites, Cell body, Axon, Axon branches.
  - Caption: "Human pyramidal neuron from the left middle temporal gyrus, reconstructed from
    microscopy." Data credit; scale bar "100 µm".
- **3b, the electrical signal:** "Once threshold is reached, an action potential travels down
  the axon. It is all-or-none: it does not get weaker. Along a myelinated axon it is renewed at
  each gap in the myelin." `[F3.2, F3.3]`
  - Labels: Trigger zone, Myelin, Node of Ranvier.
  - Tags: "Slowed down", "Myelin shown simplified", "Illustrative colour".
- **3c, the chemical synapse:** "At the synapse the signal becomes chemical. Calcium enters the
  terminal, vesicles release neurotransmitter, and it crosses the gap to bind receptors on the
  next cell." `[F3.4]`
  - Labels: Axon terminal, Vesicles, Neurotransmitter, Synaptic cleft, Receptors.
  - Tags: "Typical chemical synapse", "Simplified", "Not to scale", "Illustrative colour".

**3. 3D subject:**
- **Neuron:** one human layer 2/3 pyramidal neuron from the left middle temporal gyrus
  (candidates from Allen Cell Types data via NeuroMorpho.Org with complete dendrites and axon
  within the slice; see D).
  - Tube geometry is generated from the SWC radii.
  - Myelin sheaths and nodes are procedural on the main axon, at illustrative spacing.
- **Synapse:** an in-house procedural model, with nothing fetched:
  - presynaptic terminal with about 40 vesicles, 3 of which fuse;
  - cleft;
  - postsynaptic membrane with receptor clusters;
  - about 250 instanced neurotransmitter molecules, released once.
- **No background neuron forest** (decision F-C5). Depth comes from the neuron's own
  three-dimensional arbour and depth of field.

**4. Opening composition (3a).**
- The neuron is upright on a gentle diagonal: apical dendrite to upper left, nearer the camera;
  axon descending lower right, receding.
- Scene units: 1 unit = 100 µm. Camera about 10 units (1 mm) from the soma, azimuth chosen per
  neuron so the arbour has the most depth, elevation 8°, FOV 35° (38 mm).
- The neuron fills 70% of frame height on the abyss ground; text sits in the left column.
- Portrait screens suit it naturally: a pyramidal neuron is tall.

**5. Camera choreography:**
- **In** (from 2b, 4.4 s):
  1. The left hemisphere returns and the camera orbits to a low lateral view (1.0 s).
  2. A small violet ring marks the left middle temporal gyrus, captioned "Where this neuron was
     recorded".
  3. The camera dollies toward that point (1.0–3.0 s, power2.in) with depth of field narrowing.
  4. A cross-exposure (2.6–3.4 s) overlays the cortex surface and the neuron. The scale bar
     changes from "5 cm" to "100 µm", and the caption "Scale changes here; not a continuous
     zoom" is shown.
  5. Settle (3.4–4.4 s, power3.out).
- **3a→3b** (one press, 7.2 s):
  1. The camera travels on a spline to a low tracking position beside the trigger zone (1.8 s,
     power2.inOut, FOV 35°→40°).
  2. A 0.4 s hold.
  3. The signal fires and travels for 5.0 s. Its front moves at a constant speed. The camera
     follows its position with a 0.3 s lag (sine.inOut), about 30 µm to the side and 15°
     below.
  4. Ends at the axon branches.
  - A **Replay signal** button repeats only part 3.
- **3b→3c** (one press, 5.8 s):
  1. Cross-exposure from the axon branch to the synapse close-up (0–0.8 s).
  2. The event sequence:
     - the arriving signal opens calcium channels, shown as brief violet ticks (0.8–1.4 s);
     - vesicles dock and fuse (1.4–2.4 s);
     - neurotransmitter spreads across the cleft (2.2–3.6 s);
     - it binds receptors (3.4–4.0 s);
     - a local violet response spreads on the postsynaptic membrane and fades (3.8–4.8 s).
  3. The camera pushes in by 6% throughout (power1.inOut), then holds.
  - **Replay** repeats the event.
- **Interruption:** any input during an event completes it to its resting state within 300 ms.
  Previous uses a 450 ms crossfade.

**6. Lighting, materials, colour:**
- Abyss ground.
- **Membrane:** pale grey-violet, soft translucent sheen; a soft top key; a faint rim from
  behind; no fog.
- **The signal is the only moving light:** a saturated violet emissive front (selective bloom on
  desktop only) with a small travelling point light, so it lights the membrane it passes. It
  appears only at nodes and the trigger zone; internodes stay dark under myelin.
- **Myelin:** matte off-white segments. Nodes are 1 px violet rings while the front is there.
- **Amber `#E3A857`:** only on neurotransmitter molecules, nowhere else in the presentation.

**7. Animation and interaction.** Exactly two autonomous events in the presentation (the signal
and the synaptic release), each triggered by the presenter, each replayable, neither looping. In
3a, labels are clickable and highlight their part of the neuron (dendrites, soma, axon).

**8. Presenter resting frames:**
- **3a:** the whole neuron with four labels.
- **3b:** the axon branches after the signal, with the axon shown in a faint violet trace that
  fades over 2 s, so the path just travelled is readable while the presenter explains.
- **3c:** the synapse after release: neurotransmitter bound at receptors, five labels, and tags
  in the caption line.
- Projector: membranes are pale enough to hold on a washed-out projector; the violet signal at
  6.8:1 against abyss.

**9. Explore Mode.**
- 3a only: limited orbit (azimuth ±40°, elevation ±25° from the teaching pose), zoom 0.8–1.4×,
  reset, no selection.
- In 3b and 3c the Explore button is disabled with the caption "Explore is available on the
  neuron view". Leaving Explore restores 3a exactly.

**10. Transitions.** In: the descent from scene 2 (above). Out: a cross-exposure from the
synapse back to the whole brain (scene 4).

**11. Mobile:**
- 3a portrait: the neuron is vertical and centred in the upper 60%; labels are in the dock.
- 3b: the tracking camera keeps the axon vertical (the camera rolls 90°, set from the aspect
  ratio, before the move, not during it).
- 3c: the synapse is framed terminal-above, receptor-below in portrait as well as landscape.
- Replay is a 44 px button in the dock.
- Lighter tier: no depth of field (focus is shown by framing alone), no bloom (the emissive
  front stays saturated), the neuron at medium detail (about 60k triangles).

**12. Reduced motion:**
- No camera travel: the scene cross-cuts between three still frames.
- 3b shows the signal as a static sequence: the whole axon path traced in violet, with the
  trigger zone and three nodes marked "1, 2, 3". This is a real sequence, so numbers are
  appropriate.
- 3c shows three still states (vesicles docked, release, binding), stepped with next.
- **Play the signal** stays available on request, played without camera motion and with no
  flashing (the front's brightness never changes more than 3 times a second).

**13. Non-WebGL fallback.**
- 3a: a rendered still of the neuron with HTML labels.
- 3b: an SVG diagram of the axon with myelin and nodes, generated from the same SWC path.
- 3c: a sequence of three stills with captions; all text as HTML; the data credit.

**14. Assets and sources:**
- Neuron: Allen Cell Types human data via NeuroMorpho.Org. NeuroMorpho's CC BY 4.0 terms were
  read on 26 Oct. **The Allen Institute's own terms for this data are not yet read** (T2).
- Synapse: in-house.
- Facts: OpenStax §12.2 (neuron structure, polarity), §12.4 (threshold, all-or-none, saltatory
  conduction), §12.5 (synaptic release).
- To check: cleft width and the slowed-down factor. Neither will be quoted unless sourced.

**15. Performance and feasibility:**
- Neuron tubes about 120k triangles at high detail, 1–3 draw calls.
- Synapse about 40k triangles plus 250 instances.
- Signal: a uniform-driven shader with no per-frame geometry.
- Depth of field and selective bloom on desktop only.
- The descent's cross-exposure renders two scenes for 0.8 s (brain and neuron): about 2×
  fill cost briefly. Acceptable, but measure on iPhone.
- Highest creative effort of the five scenes; estimated 1 full day.

**16. Acceptance checklist:**
- [ ] The neuron's licence is verified (Allen terms + NeuroMorpho) before integration; record and
  citations in `ASSETS.md`.
- [ ] Rendered morphology matches the SWC (soma position, branch count, radii within 10%).
- [ ] The descent target lies on the left middle temporal gyrus mesh (raycast-checked).
- [ ] The signal travels only from the trigger zone toward the terminals and never reverses; at
  nodes the front is renewed (same brightness at every node, showing all-or-none).
- [ ] Amber appears only on neurotransmitter, only in 3c.
- [ ] Every artistic tag is present while its liberty is on screen.
- [ ] One press = one event; repeated presses never queue events; Replay works mid-event.
- [ ] No flashing above 3 Hz anywhere in the sequence.
- [ ] Reduced motion: no camera movement; the static sequence conveys the same order of events.
- [ ] Facts F3.1–F3.4 are *Checked*.

---

### Scene 4 — Memory & emotion

**1. Title and learning objective.** *Memory & emotion.* Objective:
- Locate the hippocampus and amygdala in the medial temporal lobe.
- Explain that forming new long-term memories depends on the hippocampus and nearby structures,
  while memories themselves are stored across the cortex.
- Understand that emotion and memory involve interacting networks, with no single control
  centre.

**2. On-screen narrative** (two beats):
- **4a, memory:** "Forming new long-term memories depends on the hippocampus and nearby
  structures in the temporal lobe. The memories themselves are stored across the cortex."
  `[F4.1, F4.2]`
  - Optional line: "Patient H.M., whose medial temporal lobes were removed in 1953, could no
    longer form new long-term memories." `[F4.3]`
  - Labels: Hippocampus, Parahippocampal gyrus, Fornix, Prefrontal cortex.
- **4b, emotion with memory:** "The amygdala lies just in front of the hippocampus. With nearby
  cortex, these structures are involved in emotional responses as well as memory, and they work
  as a network, not as single centres." `[F4.4, F4.5]`
  - Labels: Amygdala, Hippocampus, Hypothalamus, Prefrontal cortex, Cingulate gyrus.
- Captions: "Cortex shown translucent (simplified)"; "Highlighted structures work together;
  connections other than the fornix are not drawn."

**3. 3D subject.** The same brain, with additional verified meshes: hippocampus, amygdala,
fornix, parahippocampal gyrus, cingulate gyrus, hypothalamus, thalamus, and the frontal gyri
that make up the prefrontal cortex. All are present in BodyParts3D 4.0 (asset verification,
26 Oct). The cortex is drawn as one merged translucent shell.

**4. Opening composition.**
- Left inferolateral oblique: azimuth 15°, elevation −12°, FOV 28° (48 mm), about 4.9 units
  away.
- The brain is right of centre at 68% of frame height. The curve of the hippocampus sits at the
  optical centre with the amygdala at its front tip; the labels are in the left margin.
- The view is slightly from below, because the medial temporal structures sit low and inside.

**5. Camera choreography:**
- **In** (from 3c, 4.4 s):
  1. Cross-exposure from the synapse to the whole brain seen from behind and to the left
     (azimuth 70°, elevation 10°, 0–0.9 s); the scale bar returns to "5 cm".
  2. Arc to the teaching pose (0.6–3.6 s, power2.inOut).
  3. The cortex fades from opaque to a translucent edge-lit shell (1.2–3.4 s, power1.inOut).
  4. Labels appear after the settle.
- **4a→4b:** a 1.6 s reframe (8° arc and a 10% dolly-in, power2.inOut). The highlighted network
  crossfades in 0.6 s.
- **Network reveal** (the scene's signature): structures light up in sequence along the real
  fornix route, from hippocampus through the fornix arch (0.15 s apart, 1.2 s total). This is
  the only place a "path" is shown, and it follows a real tract mesh.

**6. Lighting, materials, colour:**
- Charcoal ground. The key comes from behind and above so the translucent cortex gets an edge
  rim (Fresnel shell, opacity about 0.18, no depth write).
- Deep structures are front-lit as solid tissue in grey-matter tones.
- Highlighted structures get a violet tint and outline; the rest of the deep anatomy dims.
- No glow on deep structures (unlike the reference image).

**7. Animation and interaction.** Selecting a structure (tap, click or label) highlights it alone
and shows its role card; Esc returns to the beat's network highlight. The fornix-route reveal
plays once per beat entry.

**8. Presenter resting frames:**
- **4a:** the memory network highlighted, with four labels.
- **4b:** the amygdala added, with five labels.
- Projector: translucent shell edges must stay visible at 1920×1080 on a projector. Checked with
  a gamma-lifted preview (simulated washout) during the scene gate.

**9. Explore Mode:**
- Full orbit, zoom 0.6–1.6×, select any deep structure (role card), reset.
- A **Cortex** control with three states: Translucent, Hidden, Solid.
- Leaving Explore restores the beat exactly.

**10. Transitions.** In: from scene 3's synapse (above). Out: to scene 5. The cortex returns to
solid and the camera eases to the lateral view before the final sweep.

**11. Mobile:**
- Portrait: the brain in the upper half, rotated by camera (not geometry) so the
  hippocampal curve sits horizontally; labels in the dock list.
- Lighter tier: the translucent shell is replaced by a **cut-away window**. A capped box clip
  removes the lateral temporal cortex, with the caption "Cortex cut away". This is cheaper and
  has no transparency sorting. It is also offered on desktop if the shell shows artefacts
  (decision F-C8).

**12. Reduced motion.** A 300 ms crossfade into the teaching pose with the cortex already
translucent. No route reveal: the network appears at once.

**13. Non-WebGL fallback.** Two stills (memory network, with amygdala) with HTML labels and roles,
and a text paragraph on networks.

**14. Assets and sources:**
- BodyParts3D 4.0 meshes listed above.
- Facts: OpenStax §13.2 (hippocampus, amygdala and adjacent cortex in long-term memory and
  emotional responses; memories stored where perception was processed; hypothalamus in the
  limbic system) and §16.2 (H.M.; medial temporal lobe in long-term memory storage; prefrontal
  short-term memory).
- **Amygdala-specific roles (evaluating emotional significance, fear learning) are not
  sourced yet** and stay out of the copy until checked (Purves or Kandel needed).

**15. Performance and feasibility:**
- Transparency is the highest rendering risk: sorting artefacts at grazing angles, and overdraw
  on iPhone.
- Mitigation: one merged shell with front faces only, drawn after the opaque deep structures;
  the cut-away window as the fallback.
- About 20 draw calls.

**16. Acceptance checklist:**
- [ ] Hippocampus and amygdala position, shape and orientation checked against an atlas (asset
  gate), with the axes stated.
- [ ] No copy or label calls either structure a "centre" or implies it works alone.
- [ ] Connections drawn only along the real fornix mesh.
- [ ] No sorting artefacts visible at any Explore angle, or the cut-away window is used.
- [ ] Facts F4.1–F4.5 are *Checked*, or the dependent line is removed.
- [ ] "Translucent (simplified)" caption is present whenever the shell is shown.
- [ ] Leaving Explore restores the beat exactly; selection role cards are reachable by keyboard.

---

### Scene 5 — The human mind

**1. Title and learning objective.** *The human mind.* Objective:
- Connect the three levels (structures, signals, networks).
- Leave with the honest position: thought and feeling depend on brain activity, and how that
  activity gives rise to experience is still an open question.

**2. On-screen narrative:**
- "Every thought and feeling depends on activity in this tissue. How that activity becomes
  experience is still an open question." `[F5.1, F5.2]`
- Three synthesis annotations, each with a violet-ink thread to the drawing:
  - **Structures** (to the lobes);
  - **Signals** (to a cortex point on the middle temporal gyrus, where the neuron came from);
  - **Networks** (to the medial temporal region, drawn through the outline).
- Controls: **Sources and credits**, **Start again**.

**3. 3D subject.** The same brain, rendered as ink line work:
- silhouette and crease lines, from a screen-space edge pass on normals and depth;
- the scene 1 horizontal contours, which return here (data reuse that closes the loop);
- deep structures from scene 4 drawn as dashed hidden lines, an atlas convention.

**4. Opening composition.**
- Lateral view: azimuth 0°, elevation 0°, FOV 24° (56 mm), about 7.0 units away. The flatter
  lens reads like a drawing.
- The brain is right of centre at 56% of frame height; the synthesis annotations are in the left
  margin; generous plate space all round.

**5. Camera choreography** (from 4b, 7.6 s, the slowest move in the presentation):
1. The cortex returns to solid; the camera eases to the lateral pose, FOV 26°→24° (0–1.4 s,
   power2.inOut).
2. A front-to-back (coronal) plane sweeps from the frontal pole to the occipital pole (1.4–7.0 s,
   sine.inOut, close to constant speed). Behind it, tissue becomes ink line work. The ground
   exposure rises from charcoal to plate with the plane's progress. On screen the sweep travels
   left to right, because anterior is on the left in a left lateral view.
3. The violet-ink threads draw (0.8 s each, 0.2 s stagger) and the annotations appear
   (6.2–7.6 s).

- Interrupting jumps to the final frame within 300 ms.
- Previous uses a 450 ms crossfade back to 4b.

**6. Lighting, materials, colour.**
- No dramatic light: a flat, unlit line render on the plate `#E6E5E0`.
- Ink `#1E2024` for lines; graphite `#5A5E64` for hidden lines; violet ink `#5B3FB0` for the
  threads.
- Text in ink and graphite.

**7. Animation and interaction.** The sweep is the only motion. Tapping a synthesis annotation
briefly re-inks its structures in violet. The Sources and credits panel is a modal: it traps
focus and returns it to the button.

**8. Presenter resting frame.** The final frame is fully drawn. It works as a lecture's last
slide: the title, one statement, three annotations, the drawing and the two controls. On a
projector, the light ground and dark ink give 12.9:1 contrast, the most readable frame of the
presentation.

**9. Explore Mode.** Not available. The finale is a summary.

**10. Transitions.** In: the coronal sweep (above). Out: **Start again** goes to 1a with a 600 ms
crossfade back to the abyss. From 1a, previous does nothing; from 5, next does nothing (the
counter makes the end clear).

**11. Mobile.**
- Portrait: the drawing sits in the upper half with the annotations listed below. Threads are
  hidden on phones, as leader lines are; tapping an annotation highlights instead.
- The sweep runs top to bottom on screen in portrait: the camera rolls so anterior is up. This
  is set from the aspect ratio before the move.

**12. Reduced motion.** A 300 ms crossfade from 4b to the finished drawing. No sweep, no
thread drawing.

**13. Non-WebGL fallback.**
- The best fallback of all: an SVG line drawing made from the same contours and silhouette,
  exported at build time, vector and crisp at any size.
- The same annotations and statement as HTML.
- The full sources and credits list.

**14. Assets and sources:**
- Same brain meshes; the contours and SVG drawing are derivatives (same licence handling).
- Facts: OpenStax §13.2 ("A person's conscious experiences are based on neural activity in the
  brain"). The "open question" line needs a textbook source (F5.2, Kandel).

**15. Performance and feasibility:**
- The edge pass is one full-screen pass; contours are reused from scene 1.
- The sweep is a per-fragment plane test in two material modes, so it adds no draw calls.
- Low risk. Shares technology with scene 1; estimated 0.5 day after scene 1.

**16. Acceptance checklist:**
- [ ] The final frame contains no tissue shading: line work only.
- [ ] The sweep is 5.6 s ±5%, and the whole transition (7.6 s) is the longest in the
  presentation.
- [ ] Ground luminance follows sweep progress monotonically, with no flash.
- [ ] Ink on plate ≥ 12:1, graphite ≥ 4.5:1, violet ink ≥ 4.5:1.
- [ ] No copy states or implies that consciousness is explained.
- [ ] Sources and credits panel lists every source in `sources.md` and every asset credit in
  `ASSETS.md`.
- [ ] The SVG fallback matches the WebGL final frame (same contours).
- [ ] Facts F5.1 and F5.2 are *Checked*.

---

## Scientific vs artistic, per scene

| Scene | Scientific (must be accurate) | Artistic (labelled on screen) |
|---|---|---|
| 1 | Brain shape, horizontal contours (cuts of the real model), grey over white matter, cortex thickness | Violet contour colour; slab-by-slab assembly; raised top ("Computed from the 3D model") |
| 2 | Region positions, names, boundaries, roles; midline anatomy | Violet highlight ("Highlight colour is illustrative"); boundary-line styling; cut-face colours if simplified |
| 3 | Real neuron morphology and recording location; direction of travel; all-or-none renewal; order of synaptic events | Violet signal, amber transmitter ("Illustrative colour"); timing ("Slowed down"); myelin and node spacing ("Myelin shown simplified"); synapse geometry ("Simplified", "Not to scale", "Typical chemical synapse"); scale cut caption |
| 4 | Positions of hippocampus, amygdala, fornix and partners; fornix route; network framing | Translucent cortex ("simplified"); violet network highlight; sequential reveal timing |
| 5 | Same geometry and contours | Line-work rendering; violet threads |
