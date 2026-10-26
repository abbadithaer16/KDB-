# NEUROVERSE — Checkpoint 2: Decisions (revision 2)

Status: revised after review on 26 Oct 2026; awaiting approval. Planning only, no production code.

Approved in revision 1 and kept: the Exposure concept, the atlas inspiration, the typography,
and the violet identity. Replaced: the restriction on cinematic movement.

## Inputs

- Entry mode: Surprise me. Image placeholders: none.
- Experience type: Hybrid. 5-step Presentation Mode; Explore Mode in scenes 2 and 4, limited
  orbit in scene 3.
- Audience: introductory undergraduate, English.
- Visual direction from the client: premium cinematic scientific visualisation; anatomically
  credible geometry; deep black and charcoal environments; controlled violet with complementary
  light only where justified; dramatic lighting, realistic materials, elegant camera movement;
  minimal readable type; no futuristic HUD clutter.
- Client visual references: **not received yet.** None are attached to the conversation or the
  session uploads. When they arrive they are used as inspiration only and recorded in the
  originality statement.
- Research conditions: every source and asset site is still blocked from this environment.
  Findings below are from search-result snippets unless marked *Verified*.

## Concept: Exposure

**A lecture developed like a photograph.** Exposure is now about understanding, not just
brightness: each scene brings more of the brain into the light of explanation.

- **Teaching frames are stable.** While labels and explanations are on screen, the camera is
  still, so the audience can read and the presenter can talk.
- **Transitions are cinematic.** Between steps, the camera performs one choreographed move
  with real depth: travelling around, past and through the brain.
- **The brain is a premium 3D object.** Realistic tissue materials, dramatic lighting and
  depth of field, not a flat illustration.
- **Exposure rises across the arc.** Scenes 1–4 live in deep black and charcoal. Scene 5 is
  the one light scene, where the brain resolves into drawn line work on a lit plate: the moment
  of understanding.

## References and principles

### A. *La Jetée* (Chris Marker, 1962), primary film reference

Snippet-level research: built almost entirely from still photographs with voice-over, with one
brief moving shot ([Wikipedia](https://en.wikipedia.org/wiki/La_Jet%C3%A9e),
[TCM](https://tcm.com/tcmdb/title/648488/wd)).

Principles kept, in our words:
1. **The image holds; the voice moves.** → Stable teaching frames under the presenter's voice.
2. **Sequence creates motion in the mind.** → Each transition is designed as a cinematic
   moment, not a fade between slides.
3. **One unmistakable living moment.** → The scene 3 neural signal is the only *autonomous*
   process animation; every other movement is camera or presenter-driven.

Not taken: any shot, face, location, story, title card, typography or sound from the film.

### B. Cajal's histological drawings, secondary reference

Snippet-level: generally described as public domain; the Cajal Institute's scan terms not found.
Principle: line as explanation. → Scene 5's line-work brain. No Cajal drawing is traced or shown.

### C. Anatomical atlas conventions

Standard views and section planes, orientation markers, scale bars, leader-line labels. Shared
scientific conventions, used as the teaching-frame grammar.

## Originality statement

Taken as principles: stable frames under a voice, transitions as storytelling, one living
moment, line as explanation, atlas conventions. Not taken: any recognisable element of *La
Jetée*, any Cajal plate, anything from ÉCLAT (below). Palette, materials, composition and camera
language derive from the subject: brain tissue, histological stains, neural signalling and
lecture halls.

## Previous-work audit (ÉCLAT) — verified from the repository

ÉCLAT traits: scroll-driven pinned scenes; warm obsidian `#090909` with ivory and gold
`#c7a46a`; Cormorant Garamond with Manrope; a precious object under softbox studio light on
velvet; turntable inspection; full-bleed photography; editorial cards; custom cursor; numbered
scenes 00–09; an opening called "The Awakening" where a beam of light reveals the object.

### Shell-ban list

- No scroll-driven narrative; navigation is by step.
- No ivory/gold palette, no warm obsidian. Our black is cool and neutral, and the accent is
  violet, never gold.
- No Cormorant, no Manrope, no high-contrast fashion serif.
- No softbox "precious object" studio look, no velvet, no turntable rotation as a scene.
- No full-bleed photography, no card rails, no custom cursor.
- No decorative numbered scene markers (a plain "2 of 5" counter is allowed).
- **No light-reveal opening.** Scene 1 opens by construction, not illumination (see below).

Note: the client's direction asks for deep black environments, which ÉCLAT also used. The
difference is carried by temperature (cool neutral, not warm), accent (violet, not gold),
type, composition (atlas field, not full-bleed stage) and subject treatment (a scientific
specimen, not a luxury object).

### Primary composition family: atlas field

The subject occupies a deep, dark field with a deliberate off-centre position. A narrow
margin column carries the text. Labels reach the subject by leader lines. Orientation marks
and a scale bar anchor teaching frames. Transitions break the field with depth and travel,
then settle back into it.

## Visual identity

### Palette

| Token | Hex | Role |
|---|---|---|
| `--abyss` | `#07080A` | Deep black environment: scenes 1, 3 |
| `--charcoal` | `#15171B` | Charcoal environment: scenes 2, 4; panels on abyss |
| `--plate` | `#E6E5E0` | Light ground of scene 5; primary text on dark grounds |
| `--ink` | `#1E2024` | Text and line work on the light ground |
| `--mist` | `#A3A7AD` | Secondary text on dark grounds (`--graphite` `#5A5E64` on light) |
| `--violet` | `#9C86F0` | Signal colour on dark grounds (`#5B3FB0` on light) |

**One complementary colour, used once:** `--amber` `#E3A857`, only in scene 3, for the
*chemical* stage of signalling (neurotransmitter release). Justification: electrical and
chemical signalling are different processes, and the audience must tell them apart.
Violet = electrical signal and "what we are discussing"; amber = chemical messenger.
Nowhere else.

Contrast (computed, WCAG): `--plate` on `--abyss` 15.9:1 and on `--charcoal` 14.2:1;
`--mist` 8.3:1 / 7.4:1; `--violet` 6.8:1 / 6.0:1; `--amber` 9.6:1 / 8.6:1; `--ink` on
`--plate` 12.9:1; `--graphite` on `--plate` 5.2:1; violet ink on `--plate` 6.0:1. All pass
AA; most pass AAA.

### How the palette works on brain tissue

Tissue colours are scientific (realistic), violet on tissue is artistic (labelled
"Illustrative colour").

| Material | Base colour | Notes |
|---|---|---|
| Cortex (grey matter) | `#A89A8E` | Neutral grey-beige, matte with a faint wet sheen; 7.3:1 against `--abyss`, so the silhouette holds on projectors |
| White matter (in sections) | `#D6CEC3` | Lighter and smoother, visible when a section plane cuts the brain |
| Deep structures (scene 4) | Grey matter colour | Distinguished by position and outline, not invented colours |

Selection rule found while checking: violet-tinted tissue is almost the same *brightness* as
untinted tissue (1.05:1), so colour alone cannot show selection, and colour-blind viewers would
miss it. Selection therefore always combines three cues: **the rest of the brain dims** (to
`#47423F`, giving 3.5:1 between selected and unselected), **the selected structure gains a
violet tint and edge line**, and **its label appears in the margin**.

Lighting supports this: a neutral cool-white key light for realistic tissue, a soft fill, and
a separation rim. Violet light appears only as meaning (selection, the electrical signal, the
scene 1 contours), never as general mood lighting.

### Typography

- **Newsreader** (variable, optical sizes): scene titles and key statements.
- **Atkinson Hyperlegible Next**: labels, captions, controls, body.
- Both OFL-1.1, self-hosted from npm (`@fontsource-variable/...` 5.3.0, verified on the npm
  registry).
- Minimal on screen: per teaching frame, at most one title, one short statement (≤ 25 words)
  and up to 6 labels. Sentence case; no all-caps; no monospace. No HUD elements: no
  coordinates, no fake readouts, no scanning lines, no hexagons, no glowing grids.

## Camera choreography

### Teaching frames (stable)

- Camera locked while labels or explanations are visible.
- Each frame is a named view ("Left lateral view", "Midsagittal section"), shown as a caption.
- Long lens, about 24–32° vertical field of view, to keep anatomy undistorted.
- Dramatic but readable composition: the brain fills 55–75% of the frame height, placed
  off-centre against the margin column; partial crops are allowed in transitions, not in
  teaching frames.

### Transitions (cinematic)

- One choreographed move per step change, 2.4–4 s, with ease-in-out and a slight settle.
- Move vocabulary:
  - **Orbit** around the brain to a new standard view.
  - **Dolly with parallax**: the camera passes close to the surface; shallow depth of field
    blurs the foreground edge.
  - **Section sweep**: a cutting plane moves through the brain, revealing interior anatomy.
  - **Descent**: the camera enters the cortex surface, then a cross-exposure cuts to the
    cellular scale.
- Labels leave before the move and arrive after the camera settles.
- Moves are deterministic: each is a function of transition progress, so an interrupted move
  jumps cleanly to its target frame.
- Reduced motion: the move becomes a 300 ms crossfade between the two teaching frames.

### Selected interactive moments

- Explore Mode selection: the camera glides to frame the chosen structure (1.2 s), keeping the
  rest of the brain in view for context.
- Section sweep under presenter control in scene 2 (drag or keys move the cutting plane).
- Scene 3 signal: the presenter triggers the signal; it is never on a loop.

### Scale honesty

Brain → cortex → neuron → synapse is not one continuous zoom. The camera's descent toward the
cortex is real; the change of scale is a cut under a cross-exposure, with the scale bar
updating and "Not to scale" shown where scales are mixed.

## Interaction principles

1. The presenter is in charge: one input, one step; nothing advances automatically.
2. Explore Mode is a visible mode change; the audience can see the narrative is paused.
3. Selection combines dimming, violet tint and edge, and a margin label.
4. Labels are leader lines from the margin, readable from the back of a lecture hall.
5. Every fact shown in 3D also exists as HTML, for screen readers and the non-WebGL version.
6. Leaving Explore Mode restores the exact step, camera and exposure.

## Scene concepts

The full visual storyboard is in `storyboard-draft.html` (an early look at Checkpoint 3,
requested in this review). Summary:

| # | Working title | Purpose | Signature moment |
|---|---|---|---|
| 1 | **Taking Shape** (alt. *Slice by Slice*) | Introduce the brain as a real, measurable object | Stacked contour slices, computed from the model, consolidate into the solid brain. Construction, not a light reveal |
| 2 | The Architecture of Thought | The major structures and what they do | A section sweep cuts the brain open on the midline to show what lies inside |
| 3 | The Neural Network | How neurons signal | A real reconstructed neuron fires: electrical signal along the axon (violet), chemical release at the synapse (amber) |
| 4 | Memory & Emotion | Memory and emotion as networks, not single centres | The cortex becomes translucent; deep structures and their connections appear inside |
| 5 | The Human Mind | Synthesis | Exposure rises: the brain resolves into line work on a lit plate, with every structure from the journey in one view |

Scene 3 has three beats inside one step (neuron, signal, synapse), advanced by the same
next control, so it gets the time it needs without becoming three scenes.

## Scientific scope and the fact / artistic line

Facts are not written yet; they go into `fact-register.md` at Checkpoint 3, only from sources
I can read.

- **Scientific (accurate):** structure names, positions, shapes, relative sizes, functions at
  textbook level, neuron morphology, direction of signal travel, sequence of synaptic events.
- **Artistic (labelled on screen):** violet and amber colours ("Illustrative colour"), the
  signal's glow and speed ("Slowed down"), scale cuts ("Not to scale"), synapse rendering and
  translucent cortex ("Simplified"), contour slices in scene 1 ("Computed from the 3D model",
  so they are not mistaken for MRI scans).
- Excluded myths: "we use 10% of our brain", "left-brained vs right-brained", "memory lives in
  one place", "the amygdala is the fear centre" as a single-region claim.

## Asset strategy

**Nothing below is verified.** The licence pages and data could not be opened; everything is
from search snippets. No purchase and no CC BY-SA commitment without your approval.

### BodyParts3D (DBCLS), proposed primary anatomical source

| Question | Snippet-level finding | Status |
|---|---|---|
| Dataset version | Official download page lists **4.0** OBJ sets, e.g. `isa_BP3D_4.0_obj_99.zip` (136 MB, IS-A tree, 99% polygon reduction), plus a PART-OF variant and parts-list tables ([download](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)). Earlier sets: 2.0, 3.0 ([info](http://lifesciencedb.jp/bp3d/info_en/index.html)) | Unverified |
| Licence | **Version-dependent and conflicting.** The archive's current licence page reportedly states **CC BY 4.0** with the line "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International" ([licence page](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)). The 2011 (v3.0-era) README states **CC BY-SA 2.1 Japan** ([2011 README](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html)). A third-party project notes old OBJ headers still carry the BY-SA text ([example](https://github.com/cesarmariel/human-atlas/pull/5)) | Unverified; must read the official page and the headers of the exact files we download |
| Attribution | The credit line above (CC BY 4.0 wording) or the BY-SA 2.1 JP wording, depending on version | Unverified |
| Redistribution | If CC BY 4.0: modified meshes may be redistributed, including commercially, with attribution; no share-alike. If BY-SA: modified meshes must carry BY-SA | Depends on the verified licence |
| Structures | Brain parts exist as separate meshes in public derivatives (e.g. calcarine sulcus, lingual gyrus models). Only "atomic" organs are meshed, so lobes may need assembling from gyri via the parts list. Hippocampus and amygdala availability unknown ([Anatomography](https://en.wikipedia.org/wiki/Anatomography)) | Unverified |
| Geometry quality | The 4.0 public set is 99% polygon-reduced; no quality data found for brain structures. Close-up camera work may expose coarse geometry | Unknown; a real risk |
| GLB conversion | Feasible in principle: OBJ → merge per structure → clean and simplify (meshoptimizer) → normals → GLB with meshopt compression, via `@gltf-transform/cli` | Feasible; needs the files to confirm effort |

Risk: if the 99% set is too coarse for premium close-ups, options are a higher-resolution set
if one exists, or limiting close-ups. Effects will not be used to hide coarse geometry.

### Tel Aviv University photogrammetry models

| Criterion | Finding |
|---|---|
| Scientific credibility | High: photogrammetry of real donated brains, published in *Anatomical Sciences Education* 2024 (Aridan et al.) ([PubMed](https://pubmed.ncbi.nlm.nih.gov/37997182/)) |
| Visual quality | Likely strong surface realism (real tissue texture) |
| Technical suitability | Unknown structure separation; photogrammetry meshes are usually single surfaces, which suits scene 1 and 5 visuals more than selectable regions |
| Licence | The TAU 3D-models page reportedly states **CC BY-NC-ND 4.0** ([TAU](https://www.neuroanatomy.sites.tau.ac.il/3d-models)) |

Assessment: if NC-ND is confirmed, **unsuitable** for a commercial demo (no commercial use, no
modification, which rules out optimising to GLB). Only usable with written permission from TAU.

### NeuroMorpho.Org neuron reconstructions

| Criterion | Finding |
|---|---|
| Scientific credibility | High: a curated repository of digital reconstructions from published studies; RRID:SCR_002145 |
| Visual quality | Reconstructions are skeletons (SWC: points and radii); we generate the 3D tube geometry ourselves, so final quality is in our hands |
| Technical suitability | Good: SWC is simple to convert; the neuron can be generated at several levels of detail |
| Licence | The terms page reportedly states **CC BY 4.0**, and asks users to cite the original paper(s), the repository with its RRID, and a 2024 paper by Tecuatl, Ljungquist and Ascoli ([terms](https://www.neuromorpho.org/useterm.jsp)) |

Assessment: likely the strongest option for scene 3 if CC BY 4.0 is confirmed. Commercial use
was not explicitly addressed in the snippets.

### Synapse

Original procedural model built in-house, labelled "Simplified". No licence risk.

### Ranking (pending verification)

1. Brain: BodyParts3D 4.0, only if the current licence is confirmed as CC BY 4.0 for the exact
   files used and the geometry passes the asset gate.
2. Neuron: NeuroMorpho.Org human pyramidal neuron, if CC BY 4.0 is confirmed.
3. Synapse: in-house.
4. TAU models: excluded unless TAU grants permission.
5. Purchased model: only with your approval, as a fallback for the brain.

## Verified vs snippet-level vs assumed

| Verified here | Snippet-level only | Assumed / unknown |
|---|---|---|
| ÉCLAT audit (repo) | *La Jetée* structure | BodyParts3D brain structure list and mesh quality |
| Font licences (npm) | BodyParts3D versions and the CC BY 4.0 vs BY-SA conflict | Which licence applies to the exact files we'd download |
| Palette and tissue contrast (computed) | TAU licence CC BY-NC-ND 4.0 | Commercial-use confirmation for NeuroMorpho data |
| All source/asset sites blocked; npm reachable | NeuroMorpho CC BY 4.0 and citation requirements | Whether camera timings feel right (checked at scene gates) |

## What blocks the next steps

1. **Network access** (domains in `sources.md`) or uploaded files. Needed to verify licences,
   inspect geometry and write the fact register.
2. **Asset decision** after verification. BodyParts3D licence wording must be read on the
   official page and in the downloaded files themselves.
3. **Your visual references**, if you want them reflected before the storyboard is finalised.
4. Real devices and expert review remain open.
