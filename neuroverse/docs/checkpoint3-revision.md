# NEUROVERSE — Checkpoint 3 revision: C13–C14, Scene 2 direction, Scene 3 signal gate

Status: for review, 27 Oct 2026. Checkpoint 3 is **not yet approved**. Checkpoint 4 has not
started. The Scene 2 Safari proof (`neuroverse-proof`, `neuroverse-preview`) is unchanged.
Wherever this file differs from `storyboard.md`, this file wins.

## Decisions recorded so far

| Item | Status |
|---|---|
| C1, C2, C3, C5, C6, C7, C10, C11 | Approved as recommended |
| C12 | Provisionally approved |
| C4 (neuron), C9 (H.M. line) | Conditional on verified evidence and licensing |
| C8 | Approved: transparency on desktop, cut-away on mobile, **both at a premium standard** (added to the scene 4 gate below) |
| C13, C14 | Presented again in full below |
| Earlier decisions | About 4 Nov target; neuron conditional on licences; simplified cut surface only if a credible one is infeasible; BodyParts3D conflict unresolved; unverified claims excluded; Safari proof untouched |

C8's premium condition becomes a gate criterion. Both tiers are reviewed side by side at the
scene 4 gate, with the same design critique. Neither may show sorting artefacts, a visible box
edge without a capped cut face, or flat unlit cut surfaces.

---

## 1. C13 and C14 in full

### C13 — Label layout and selection dimming

Two linked choices: where labels sit, and how strongly unselected tissue dims when something is
selected.

**Layout**

| Option | What it looks like | Consequences |
|---|---|---|
| **A. Two margins, split by anatomy** (recommended) | Front-of-brain structures labelled from the left margin, back-of-brain from the right; leader lines run inward to dots on the surface | Proven in the proof on desktop and on your iPhone (where labels become a list). No leader line crosses tissue. The reading order alternates sides, so labels are ordered top to bottom within each margin |
| B. One margin | All labels in a single column (usually the right) | One reading order, closest to a classic atlas plate. Lines to structures on the far side must cross the brain, which obscures the anatomy and looks busier on a projector |
| C. Labels on demand | No labels at rest; names appear only when a structure is tapped or hovered | The cleanest image. It fails the classroom use: the room cannot read names unless the presenter clicks each one, and hover-only meaning fails accessibility |
| D. Labels on the surface | Names sit directly on the brain, without leader lines | Compact, but text over tissue needs scrims, moves with the camera, and fights the tissue material. Least premium of the four |

**Dimming of unselected tissue**

| Option | Consequences |
|---|---|
| **3.5:1 between selected and dimmed** (recommended, current proof) | The selection reads from the back of a room and for low-vision viewers. Dimmed tissue is about 1.8:1 against the background, so the desaturated violet rim keeps the brain's outline. The scene 2 revision below makes the dimming read as light falling away rather than a grey filter |
| About 2.5:1 (lighter) | More surrounding anatomy stays visible for context. The selection weakens on a washed-out projector, so the violet tint and outline do more of the work |
| About 5:1 (stronger) | An unmistakable selection, but the rest of the brain nearly disappears on a projector and the teaching context is lost |

Recommendation: **A + 3.5:1.** It is the only combination already proven on your device.

### C14 — Scientific claims without a readable source

| Option | Consequences |
|---|---|
| **A. Exclude** neuron counts, energy share, conduction speeds and sizes until a readable source exists (recommended; matches your decision 5) | All copy stays defensible. The lecture loses "big number" hooks (for example "86 billion neurons"); the visuals carry the awe instead. Tags such as "Slowed down" and "Not to scale" appear without numbers |
| B. Use common figures from memory, marked unverified on screen | Faster and more familiar, but it breaks CLAUDE.md (no unverified facts in shipped copy) and invites correction from an academic audience. Not recommended |
| C. Unblock sources, then add only the figures that check out | Allow `ncbi.nlm.nih.gov` and `ebi.ac.uk` in the environment, or upload textbook pages. Each figure goes through the fact register and its line is added only when *Checked*. The best route if you want numbers; it costs research time inside the 4 Nov window |
| D. Qualitative wording only | For example "billions of neurons" or "the most energy-hungry organ". Still a factual claim, so it needs a source too; it only lowers the precision required |

Recommendation: **A now, with C as an option.** If you unblock sources, the figures most worth
adding are the neuron count (scene 1) and the slowed-down factor (scene 3).

---

## 2. Scene 2 — strengthened visual direction

### What makes an ordinary anatomical viewer, and what we do instead

| A textbook 3D viewer | NEUROVERSE scene 2 |
|---|---|
| Brain centred, flat lighting, turntable | Off-centre composition, a raking key that models every fold, the camera locked while teaching |
| A colour per lobe | Lobes defined the way anatomists define them: by tracing their landmark folds |
| Tooltips and side panels | Editorial margin labels with roles, drawn in after the camera settles |
| Hide or show toggles | A choreographed cut, then the hemispheres part, revealing the cut corpus callosum |
| Selection by recolouring | Selection by light: the rest of the brain falls into shadow, the region holds the light |

**Scene thesis: the brain is read like a landscape.** First its relief, then its borders, then
what joins it together.

### The three cinematic moments

**Moment 1: arrival across the relief (transition from scene 1, 3.0 s)**
- The orbit from scene 1's three-quarter view keeps the key light fixed to the camera rig at a
  low raking angle (about 25° above the brain's horizon). As the camera turns, the light travels
  across the gyri and sulci, and the folds read as relief.
- The light itself does not change. The camera moves through it, as a cinematographer would.
- The orbit stays at or beyond the closest distance approved at the asset gate, so the faceting
  risk is not tested by this shot.
- Scientific note: none. The shapes are the real geometry, and lighting adds no anatomy.

**Moment 2: the landmarks are traced (2a entrance, 2.2 s)**
- Before any label appears, two thin violet lines draw along the real **central sulcus** and
  **lateral sulcus**, following the boundaries between the model's own region meshes. Each line
  traces the length of its fold (1.0 s each, overlapping).
- The lobe boundary lines then fade in (`--mist`). The labels draw in last.
- It shows, rather than tells, fact F2.1: lobes are mapped using the largest folds as landmarks.
- Scientific guard: the asset gate checks that the mesh boundaries lie in those sulci (against
  an atlas). If a boundary does not follow its sulcus, that line is not drawn, and the statement
  stays text-only.
- This replaces the plain label fade as the scene's first reveal.

**Moment 3: the cut, and the hemispheres part (2a → 2b, 4.2 s)**

This replaces the proof's "sweep, then hide the left hemisphere".
1. 0–1.4 s: the camera orbits away (azimuth 24°, elevation 9°). The midline plane sweeps through
   the brain from front to back, and the cut faces catch the raking key.
2. 1.4–3.0 s: the left hemisphere, carrying the left halves of the midline structures, **slides
   apart along the patient's left axis** and out of frame toward camera-left.
   - Both cut faces of the corpus callosum are visible for a moment: the white band that joined
     the two halves, cut through.
   - The caption reads "Left hemisphere moved aside".
3. 2.6–4.2 s: the camera returns to the medial view of the right hemisphere and settles; the
   labels draw in.
- Scientific guard: the movement follows the real anatomical division (the midline), and nothing
  is deformed. The caption states that it was moved aside. The proof's hide-only method stays as
  the fallback and the reduced-motion version.
- Constraint: the hemisphere passes the camera no closer than the asset-gate distance, and the
  move must look right **without** depth of field (the mobile tier has none). Depth of field is
  never used to hide the geometry.

### Light, material and composition

- **Composition:**
  - The brain grows from 52% to **62% of frame height** in 2a (still clear of both label
    margins at 16:9).
  - A slightly lower camera (elevation −3°, within the tolerance of a standard lateral view)
    gives the brain weight.
  - In 2b the medial surface sits right of centre, with the labels in the left margin.
- **Light:**
  - A raking warm-neutral key from upper front, a cool low fill, and the desaturated violet rim
    on the far edge.
  - A very slight falloff of the background from charcoal toward abyss at the frame edges
    (vignette, not a glow).
  - No bloom in scene 2.
- **Selection by light:**
  - Unselected tissue keeps its material but loses exposure (toward the 3.5:1 ratio), so it
    reads as falling into shadow rather than turning grey.
  - The selected region keeps full light, gains a light violet tint, and gets a constant 2 px
    outline.
  - The camera does not move on selection in Presentation Mode (frames stay locked while text is
    shown).
- **Tissue:**
  - wrap lighting for soft light bleed;
  - a wet specular sheen;
  - a fine surface-detail normal generated in-house;
  - cavity darkening deepening the sulci (from the proof).
  - Judged at the asset gate at the closest teaching distance.
- **Cut faces:**
  - a grey cortical ribbon over white matter, lit flatter than the surface;
  - the corpus callosum's cut face clearly white;
  - a simplified, labelled surface only if a credible one proves infeasible (your decision 3).
- **Labels:**
  - Newsreader for nothing but the title; labels in Atkinson.
  - The role appears in `--mist` under the name.
  - Leader lines end in a small dot on the actual surface (raycast-verified, as in the proof).

### Explore Mode, presented rather than exposed

- **Guided views** (Lateral, Medial, Superior, Inferior) are composed frames with the same
  lighting logic, not raw camera presets. Each arrives with a 1.2 s glide.
- In 2b, the **Cut depth** slider moves the plane, with the cut faces lit in real time.
- Selection in Explore glides the camera to frame the structure.
- The hint line reads, without icons or panels: "Drag to rotate · pinch or scroll to zoom · tap
  a structure".

### Reduced motion, mobile and fallback (changes only)

- **Reduced motion:** no light travel, no landmark tracing (lines simply appear), no parting
  (2b crossfades in, left hemisphere already hidden as in the proof).
- **Mobile:**
  - The landmark trace and the parting both play; framing is from the portrait poses; no depth
    of field.
  - The parting exits toward the top of the frame in portrait.
  - Touch behaviour is unchanged from the proof your iPhone already passed.
- **Fallback:** the two stills plus a third still mid-parting, and an SVG of the traced
  landmarks.

### Additions to the scene 2 gate

- [ ] The landmark lines lie in the central and lateral sulci (asset-gate atlas check), or are
  omitted.
- [ ] The parting shows both cut faces of the corpus callosum for at least 0.6 s.
- [ ] The parting looks correct with depth of field off.
- [ ] Selection by light keeps a selected-to-dimmed ratio of ≥ 3.5:1.
- [ ] A design critique against the thesis "read like a landscape": would the frame still look
  directed with labels removed?
- [ ] The design critique compares against the current proof and must show a clear step up in
  materials, light and composition.

Timing change for `choreography.md`:
- T3 becomes 4.2 s (sweep and parting).
- The 2a entrance adds a 2.2 s landmark trace after T2.
- The total choreography rises to about 50 s.

---

## 3. Scene 3 — axon signal: visual proof and review gate

### What the data actually contains (measured 27 Oct, from the SWC files)

These are file measurements, not inferences. The y-axis is assumed to point toward the brain surface (the Allen files are "transformed", which I take to mean aligned upright); this assumption is confirmed at the asset gate.

| NeuroMorpho ID (Allen cell) | Total axon length | Longest real path, axon start to tip | Straight-line span of that path | Axon tips | Lowest axon point relative to the soma (file y-axis) |
|---|---|---|---|---|---|
| 162204 (685815936) | 4.3 mm | **1.19 mm** | **1.10 mm** (nearly straight) | 22 | 1.10 mm |
| 162180 (685814252) | 8.0 mm | 1.00 mm | 0.88 mm | 50 | 0.86 mm |
| 162163 (685806309) | 6.5 mm | 1.06 mm | 0.36 mm (winding) | 40 | 0.56 mm |
| 162118 (685767564) | 5.7 mm | 0.87 mm | 0.53 mm | 36 | 0.59 mm |
| 162148 (602165685) | 6.3 mm | 1.06 mm | 0.42 mm (winding) | 45 | 0.46 mm |
| 107146 (Tamás lab, alternative) | 23.9 mm | 1.97 mm | 0.63 mm | 156 | 0.49 mm |

Two findings shape the gate:
1. **The longest real paths are about 0.9–1.2 mm.** Cell 162204 has a nearly straight 1.1 mm
   path descending from the cell body, ideal for a tracking shot. The axon does not reach a
   distant target in this data; the reconstruction ends within the tissue sample.
2. **Axon thickness is not measured in these files.** Every axon point carries one of two or
   three fixed radius values (for example 0.1144 µm on all 6,036 axon points of 162180). The
   rendered thickness is therefore a **display convention**, not data, and must be labelled.

The SWC files were downloaded for inspection only. They are not committed, rendered for anyone,
or published. Licence verification (the Allen Institute's terms) is still required before any
use (C4).

### How the limited length is handled without inventing anatomy

| Rule | Detail |
|---|---|
| Only reconstructed geometry is drawn | The tube follows the SWC points exactly (a spline through them, max deviation < 0.5 µm). No extension, no added branches, no straightening, no smoothing of turns |
| The signal path is a real path | The path is computed from the file: axon start (trigger zone) to the end of the longest real branch (1.19 mm for 162204). The front travels this path only |
| The end is shown as an end | The tube stops at the last recorded point, marked with a small graphite tick and the caption "End of the reconstructed axon". It does not say *why* it ends (cut by slicing, or a natural end) unless the Allen methods paper confirms it (new fact F3.7, To check) |
| Length is made to feel long by the camera, not by the anatomy | Close tracking at 40–60 µm from the axon for the first third, then the camera rises and pulls back while the front continues. The final frame shows the **whole** 1.1 mm path and the cell body in one view: the audience sees the true length |
| Time, not space, is stretched | The front takes 5.0 s over the real length. Timing is labelled "Slowed down"; no speed number unless sourced (C14) |
| Myelin only where it is a stated simplification | Procedural sheaths on the main path only, after an unmyelinated start segment, with nodes at illustrative spacing (about 10–12 nodes over 1.1 mm). Branches stay bare. Labelled "Myelin shown simplified" (C6) |
| Thickness is a convention | The axon is drawn with a minimum on-screen width (1.5 px wide shots, true-to-file radius scaled ×4 in close tracking) and tagged "Thickness not to scale". The dendrites follow the same rule if their radii prove quantised too |
| The synapse is not this cell's | 3c is labelled "Typical chemical synapse, not this neuron's actual terminal" |

### Revised signal choreography (T5)

| Time | Action |
|---|---|
| 0–1.8 s | The camera travels to the trigger zone (power2.inOut, FOV 35°→40°) |
| 1.8–2.2 s | Hold. The label "Trigger zone" is visible |
| 2.2–4.0 s | The front leaves the trigger zone and is renewed at the first nodes; the camera tracks closely, 40–60 µm aside, following with a 0.3 s lag |
| 4.0–6.2 s | The camera rises and pulls back (power2.inOut) while the front continues at constant speed |
| 6.2–7.2 s | The front reaches the end of the reconstructed path; the camera settles on the full-path frame. A faint violet trace of the path fades over 2 s; the end tick and caption appear |

### The visual proof

**Purpose.** Prove that the signal sequence is cinematic, readable and honest **before** scene 3
is built.

**Scope** (isolated, like the scene 2 proof):
- One neuron (162204 first, 162180 as backup).
- The tube geometry from its SWC; procedural myelin and nodes on the real path.
- The membrane material, the signal shader with the travelling front and its small moving light.
- The T5 camera choreography, the end tick and caption, the tags.
- Desktop and mobile tiers, and the reduced-motion static version.
- **Not** in scope: the descent from scene 2, the synapse, scene text beyond the tags, the
  production shell.

**Preconditions:**
1. Checkpoint 3 approved.
2. Your explicit authorisation of the proof as an exception, or its inclusion as the first item
   in the Checkpoint 4 build order.
3. **The Allen Institute's terms read and recorded** before anything is shown outside the
   container. Until then: local renders and screenshots for you only, and no public preview link.

**Branch:** a separate `neuroverse-proof-signal` branch. The existing Safari proof is not touched.

**Evidence produced:**
- Screenshots at 0, 25, 50, 75 and 100% of the signal, desktop and mobile tiers.
- The reduced-motion static frame.
- A screen recording from the container (software WebGL: visual only, never performance
  evidence).
- If the licence is cleared, a preview link for your iPhone.
- A geometry report: SWC points vs rendered path deviation, path length, node count.

### The signal gate (pass or fail)

| Area | Criterion | Evidence |
|---|---|---|
| Licence | Allen terms and NeuroMorpho terms read and recorded; citations listed | `ASSETS.md` entry |
| Geometry | Rendered path within 0.5 µm of SWC points; nothing drawn beyond the last point; no added branches | Geometry report |
| Science | Front starts at the trigger zone and only moves toward the end; equal brightness at every node (all-or-none, renewal); no claim about why the axon ends unless F3.7 is checked | Frame sequence, fact register |
| Honesty | Tags present while the liberty is on screen: "Slowed down", "Myelin shown simplified", "Thickness not to scale", "Illustrative colour"; end caption | Screenshots |
| Cinematic | The tracking third reads as speed and travel; the pull-back reveals the full real length in one composed frame; the signal is the only moving light; no ambient particles or glow; a design critique pass | Recording, critique notes |
| Readability | At 1920×1080 the front, nodes and end tick are legible from a projector distance (front ≥ 6 px, tags ≥ 20 px) | Screenshots at 1080p |
| Flashing | No luminance change above 3 per second anywhere on screen | Frame-luminance trace from the recording |
| Interaction | One press, one signal; Replay mid-signal restarts cleanly; next mid-signal lands on the resting frame within 300 ms | Interaction test |
| Mobile | Same reading without depth of field or bloom; on your iPhone it plays without visible stutter (your judgement; performance stays Not run until measured) | Your device test |
| Reduced motion | No camera motion; the static numbered path conveys the same order | Screenshot |

**If it fails:**
- Too short or too winding to read as travel: switch to the backup cell (162180), never extend
  the geometry.
- Too abstract up close: change the lens and distance, never add structures.
- If no candidate passes on licence or quality: stop and report the options, as CLAUDE.md
  requires.

New fact-register entries:
- **F3.7:** "the reconstruction ends within the tissue sample" (To check against the Allen
  methods paper).
- **F3.8:** that the radii in these files are not measurements (*Measured* from the files on
  27 Oct; to be confirmed in the Allen documentation).
