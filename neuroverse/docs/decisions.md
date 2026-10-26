# NEUROVERSE — Checkpoint 2: Decisions

Status: proposed, awaiting approval. Nothing here is production code.

## Inputs

- Entry mode: Surprise me
- Experience type: Hybrid, with 5-step Presentation Mode and Explore Mode in scenes 2 and 4 (limited orbit in scene 3)
- Niche: educational neuroscience presentation for introductory undergraduate audiences
- Steps: 5 (working titles in `brief.md`)
- Image placeholders: none
- Research conditions: page fetching is blocked from this environment. Research below comes
  from search-result snippets and from the repository itself. Every item says which.

## Concept: Exposure

**A lecture developed like a photograph.**

Each step is a held frame: a precisely lit brain plate the presenter can talk over. The image
holds still while the presenter's voice carries time. Movement happens only between steps,
as one deliberate camera move. Across the five steps, exposure rises, from a dark plate
where the brain first appears to a fully lit, drawn plate where everything learned is legible
at once.

Why this fits the brief:
- **Lecture use.** A presenter talks over still images; audiences read labels while the image
  holds. Constant motion competes with the speaker.
- **Projector legibility.** Held frames with controlled tonal range read well on a washed-out
  projector; there is no reliance on detail in deep shadow.
- **Awe through restraint.** When everything else is still, the one moment of autonomous
  motion (an impulse travelling along a real neuron in scene 3) lands with force.
- **Scientific credibility.** The visual grammar borrows from anatomical atlases: standard
  views, scale bars, orientation marks and leader-line labels. Credibility is part of the look.

## References and the principles taken from them

### A. *La Jetée* (Chris Marker, 1962), primary film reference

Research boundary: snippet-level only. Sources describe the film as built almost entirely
from still photographs with voice-over, with a single brief moving shot
([Wikipedia](https://en.wikipedia.org/wiki/La_Jet%C3%A9e), [TCM](https://tcm.com/tcmdb/title/648488/wd),
[QAGOMA](https://qagoma.qld.gov.au/cinema/screening/la-jetee)). I could not open the pages or
view the film here.

Principles, in our own words:
1. **The image holds; the voice moves.** Time is carried by narration over held frames.
   → Steps arrive and hold. No idle drift. The presenter supplies the pacing.
2. **Sequence makes motion in the mind.** The cut between two stills does the storytelling.
   → Transitions are the cinematic moments: one move per change of step.
3. **One true movement among stills.** A single moving moment gains enormous force.
   → Only one autonomous animation in the whole presentation: the scene 3 impulse.
4. **Photographic tonality.** A greyscale world where tone, not colour, builds form.
   → Near-monochrome palette. Colour is reserved for meaning (see *Palette*).

Deliberately not taken: any shot, composition, face, location, story, title card, typography,
sound or still from the film. Nothing in NEUROVERSE should let a viewer name the film from a
frame.

### B. Santiago Ramón y Cajal's histological drawings, secondary reference

Research boundary: snippet-level. Commons records describe the drawings as public domain
(Cajal died in 1934); scans held by the Cajal Institute carry their own credit line, and the
Institute's reuse terms were not found ([Marginalian](https://www.themarginalian.org/2017/02/23/beautiful-brain-santiago-ramon-y-cajal/),
[Commons-derived record](https://biol300.case.edu/wiki/File:PurkinjeCell.jpg)).

Principles:
1. **Drawing as explanation.** Line clarifies structure better than photographic surface.
   → Scene 5 resolves the brain into an ink-like line rendering on a light plate.
2. **Ink on paper.** A two-tone material world.
   → The light end of the exposure arc is paper-and-ink, not glossy UI.

Deliberately not taken: no Cajal drawing is traced, reproduced or displayed. Neurons are
generated from reconstruction data (see *Asset strategy*), not from his plates.

### C. Anatomical atlas conventions (not a copyrighted work)

Standard anatomical views (lateral, medial, superior, inferior, anterior), section planes
(sagittal, coronal, axial), orientation markers, scale bars and leader-line labels. These are
shared scientific conventions; they become our framing grammar.

## Originality statement

Taken: held frames carried by a voice; one movement among stills; tonal rather than
chromatic form; line as explanation; atlas conventions as framing.
Not taken: any recognisable image, composition or element of *La Jetée*; any Cajal plate;
any layout or visual element from ÉCLAT. Palette, type, composition and camera language below
are derived from the subject: fixed brain tissue, histological stains, atlas plates and
lecture halls.

## Previous-work audit (ÉCLAT)

Audited from the repository (`eclat/src/styles/global.css`, `eclat/README.md`). Verified.

Traits most likely to repeat:
- Scroll as the primary driver, with pinned sections and scrubbed camera moves
- Obsidian ground (`#090909`), ivory text, gold accent (`#c7a46a`)
- Cormorant Garamond (light, italic) display with Manrope body
- A precious object lit by studio softboxes on dark velvet; turntable inspection
- Full-bleed campaign photography and editorial cards
- Custom cursor; percentage preloader; captions over a bottom scrim
- Numbered scene labels (00–09)
- Its first section is **"The Awakening"**: a beam of light reveals the object in darkness

### Shell-ban list

- No scroll-driven narrative; navigation is by step
- No obsidian/ivory/gold palette, and no near-black + single bright accent
- No high-contrast fashion serif; no Cormorant or Manrope
- No softbox studio "precious object" lighting; no velvet; no turntable rotation as a scene
- No full-bleed photography; no card rails or editorial card grids
- No custom cursor
- No large numbered step markers as decoration (a plain "2 of 5" counter is allowed, because
  the steps are a real sequence)
- No beam-of-light reveal in darkness as the opening

**Flag for the brief:** scene 1's working title, *The Awakening*, is the same as ÉCLAT's
opening section, and "light reveals the subject in darkness" is the obvious way to stage it.
I recommend a new title and a different opening idea at Checkpoint 3. The scene's purpose
stays the same.

### Primary composition family: atlas plate

The subject sits in a measured field with generous margins. Labels sit in the margins and
connect to the subject by leader lines. Orientation marks and a scale bar anchor the plate.
Text lives in a narrow margin column, like a plate caption. This differs from ÉCLAT's
full-bleed stage with bottom captions, and survives the grayscale-wireframe test.

## Visual identity

### Palette

Five named tokens. Greyscale does the work; violet carries meaning only.

| Token | Hex | Role |
|---|---|---|
| `--darkroom` | `#1C1E21` | Ground at the dark end of the exposure arc |
| `--plate` | `#E6E5E0` | Ground at the light end; text on dark grounds |
| `--ink` | `#222326` | Text and line work on light grounds |
| `--graphite` | `#5A5E64` | Secondary text and rules on light grounds (`--fog` `#9EA2A6` is its counterpart on dark grounds) |
| `--nissl` | `#5B3FB0` | The single signal colour: the structure being discussed or selected (`#9C86F0` on dark grounds) |

Derivation: fixed brain tissue is grey-beige; histological stains give structure its colour
(Nissl staining is violet). Violet therefore means "this is what we are looking at", and
nothing else in the interface uses colour.

Contrast (WCAG, computed): `--plate` on `--darkroom` 13.2:1; `--fog` on `--darkroom` 6.5:1;
violet `#9C86F0` on `--darkroom` 5.6:1; `--ink` on `--plate` 12.5:1; `--graphite` on
`--plate` 5.2:1; `--nissl` on `--plate` 6.0:1. All pass AA for normal text.

Constraint found while checking: the brain's tissue colour (`#CDBFAE`) against `--plate` is
only 1.4:1, so a shaded 3D brain cannot sit directly on the light ground. On light steps the
brain is drawn as line work, or sits in a darker field. This is a design rule, not a fix with
effects.

Not used: obsidian, gold, cream `#F4F1EA`, terracotta, acid green, vermilion.

### Typography

| Role | Family | Why |
|---|---|---|
| Narrative voice: step titles, key statements | **Newsreader** (variable, optical sizes) | A sturdy text serif from the textbook lineage, with display optical sizes for large titles. It is not a fashion serif |
| Labels, captions, controls, body | **Atkinson Hyperlegible Next** | Designed for maximum character distinction; labels must survive projectors and low vision |

Both are OFL-1.1 and self-hostable from npm (`@fontsource-variable/newsreader` 5.3.0,
`@fontsource-variable/atkinson-hyperlegible-next` 5.3.0; licences verified on the npm
registry). Exact versions get pinned at Checkpoint 4.

Rules: sentence case everywhere; no all-caps labels; no monospace labels; anatomical terms
in their standard English form with a consistent naming source (see *Sources*).

## Camera language

- **Held frames.** The camera arrives and stops. No idle drift, roll or handheld shake.
- **Long lens.** Vertical field of view around 24–30°, so anatomy reads with little
  perspective distortion, like an atlas view.
- **Views are anatomical.** Each held frame corresponds to a named view or section plane.
  The view's name is part of the plate (e.g. "Left lateral view").
- **One move per transition.** Vocabulary: *dolly* (toward or away), *arc* (around the brain
  to another standard view), *rise* (to a superior view), *section* (a clipping plane passes
  through to reveal an internal structure). 1.8–2.6 s each.
- **No false continuity of scale.** Brain → neuron → synapse is not one continuous zoom,
  because that would imply a single real-time camera could see all three. Scale changes are
  cuts under a cross-exposure, with the scale bar updating and "Not to scale" shown where
  relevant.

## Transitions

| Change | Transition |
|---|---|
| Same subject, new view | Labels leave first; one camera move; the new labels arrive after the camera stops. Labels never travel with the camera |
| New subject or scale | Cross-exposure: the outgoing frame and incoming frame overlap like a photographic dissolve, about 1.2 s |
| Exposure | The ground value shifts only during transitions, never while a frame is held |
| Interrupted | Pressing next or previous mid-transition jumps cleanly to the target frame; animations never queue |
| Reduced motion | A cut with a short (~200 ms) crossfade; no camera flights |

## Interaction principles

1. **The presenter is in charge.** One key, click or tap is one step. Nothing advances on its
   own.
2. **Explore is a deliberate mode.** It's entered with a visible control or a key. The plate
   changes state visibly (margin labels become selectable; orbit unlocks), so the audience can
   see the presenter has left the narrative.
3. **Selection uses the signal colour.** A selected structure turns violet, and its label and
   description appear in the margin column. Nothing else changes colour.
4. **Labels are leader lines, not tooltips.** They point from the margin to the structure, as
   on an atlas plate, and are readable from the back of a lecture hall.
5. **Every 3D fact exists as HTML.** Each step has a text list of what the image shows, which
   screen readers and the non-WebGL fallback both use.
6. **Return is exact.** Leaving Explore Mode restores the step, the camera and the exposure.

## Scientific scope and the fact / artistic line

Content facts are not written yet: they belong in `fact-register.md` at Checkpoint 3, and only
from sources I can actually check. This checkpoint fixes the policy.

- **Scientific (must be accurate):** structure names, positions, shapes, relative sizes within
  a scale, functions as stated in introductory textbooks, and neuron morphology.
- **Artistic (must be labelled):** violet highlighting ("Illustrative colour"), the impulse's
  glow and timing ("Slowed down"), the scale cuts ("Not to scale"), synapse rendering
  ("Simplified").
- Popular myths stay out of the presentation: "we use 10% of our brain", "left-brained vs
  right-brained", and memory stored in a single region.
- Memory and emotion are described as networks of structures, not as single "centres".

## Initial asset strategy

Nothing below is verified as available, suitable or licensed yet. All of it goes through the
asset quality gate at Checkpoint 4.

| Need | First choice | Fallback | Status |
|---|---|---|---|
| Brain with separate regions (scenes 1, 2, 4, 5) | **BodyParts3D** (DBCLS). Snippet evidence: CC BY-SA 2.1 Japan with a required credit line, per its README ([README](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html)) | A purchased model you upload, with a licence that allows real-time web use | Site blocked. Unverified: which brain parts exist as separate meshes, mesh quality, whether hippocampus and amygdala are included |
| Real brain surface quality | **Tel Aviv University neuroanatomy course** photogrammetry models of real brains, described as open educational resources ([TAU](https://www.neuroanatomy.sites.tau.ac.il/about)) | BodyParts3D surface alone | Licence and download unverified |
| Neuron (scene 3) | **NeuroMorpho.Org** reconstruction of a real human neuron, converted to geometry. RRID:SCR_002145 ([SciCrunch](https://scicrunch.org/resolver/RRID:SCR_002145)) | A procedurally generated neuron, labelled "Illustrative" | Licence not found in snippets. Unverified |
| Synapse close-up (scene 3) | Original procedural model, labelled "Simplified" | None needed | Can be made in-house |

Share-alike note: if BodyParts3D is used, modified model files must carry the same CC BY-SA
licence and the credit line. The application code is a separate work. Confirm you're
comfortable with that before the asset gate.

## Verified vs assumed

| Verified (checked here) | Snippet-level (not opened) | Assumed (needs checking) |
|---|---|---|
| ÉCLAT's palette, fonts and structure (from the repo) | *La Jetée* stills-and-narration structure and its one moving shot | Which brain regions BodyParts3D provides as separate meshes |
| Font licences and versions (npm registry) | BodyParts3D licence and credit line (README snippet) | Mesh quality and file sizes of any candidate |
| Palette contrast ratios (computed) | Cajal drawings' public-domain status | NeuroMorpho data licence |
| Network status: all source and asset sites blocked; npm reachable | TAU photogrammetry models exist as open resources | TAU model licence and availability |
| | | That the camera/transition timings feel right (to be checked at Checkpoint 3 and in scene gates) |

## Dependencies blocking later checkpoints

1. **Network access** to the domains in `sources.md`, or uploaded material. Without it the fact
   register (Checkpoint 3) and the asset gate (Checkpoint 4) cannot be completed honestly.
2. **Asset decision**, including your view on CC BY-SA share-alike, by Tue 27 Oct midday.
3. **Scene 1 title and opening** (see the ÉCLAT flag above), decided at Checkpoint 3.
4. **Real devices** and **expert review** remain open from Checkpoint 1.
