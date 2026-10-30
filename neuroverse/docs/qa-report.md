# NEUROVERSE — build QA report (draft for the client's end review)

Branch `neuroverse-build`, 30 Oct 2026. Not merged, not deployed. Private review link (claude.ai,
owner only): https://claude.ai/artifact/UAJQwQVACVJG8Wi1892exb

## How this build was authorised

On 29 Oct 2026 the client asked for all five scenes to be built for one review at the end ("Do
all of the 5 scenes and after you finish I will review and I will adjust the mistakes"). That
replaced the per-scene approval gates for this pass only. Checkpoint 4 documents
(`compiled-spec.md`, `interaction-spec.md`) were **not** written first; the build follows the
approved storyboard (`storyboard.md`, `choreography.md`, `visual-system.md`) and the Checkpoint 3
decisions. Writing the compiled spec from what was built is still owed before this can ship.

Labels used below: **Measured** (real device, named), **Checked** (looked at or tested in the
local Chromium harness; software WebGL, so never performance evidence), **Estimated**,
**Not run** (with the reason).

## What was built

| Step | Beats | Status |
|---|---|---|
| 1 The living fold | contour map from above → assembly from 44 horizontal sections → top opened like a lid on a true cross-section | Built; Checked at 1280×720 and 390×844 |
| 2 The architecture of thought | left lateral view with the central and lateral sulci traced from the model → hemispheres parted to show the medial surface | Built; Checked |
| 3 Electrical, then chemical | recorded neuron (NeuroMorpho 290955) → signal along the axon (approved "Under the lens" look) → cut-open chemical synapse | Built; Checked |
| 4 Memory & emotion | translucent cortex on desktop / cut-away on phones (C8) with the hippocampal network highlighted → amygdala, hypothalamus, cingulate | Built; Checked |
| 5 The human mind | the brain redrawn as line work on a lit plate, with three threads back to steps 2–4 | Built; Checked |

Explore Mode (orbit, zoom, reset, selection, cortex mode on desktop) in steps 2, 3 and 4. A full
text version doubles as the non-WebGL fallback.

## Fixes made during this QA pass

- Synapse rebuilt as a cut-open bouton and spine head (the first version was framed too close and
  read as flat plates).
- Step 1 cut face: the top now hinges open at the back; a straight lift hid most of the section.
- Labels: overlapping labels are pushed apart by their text boxes with bent leaders; text has a
  halo for contrast over tissue; synapse labels have fixed sides.
- Step 5: the synthesis list moved into the dock (it overlapped the caption); threads start at the
  end of each line of text and no longer cross.
- Phones: stronger top scrim; synapse framed between the statement and the dock; the step 4
  cut-away dims context less and hides the white-matter volume so the deep structures show; step
  4 copy says "cut away" on phones instead of "translucent".
- Copy: "the fornix, a real fibre tract" removed (not found in the sources read; F4.9).

## Checklist

| Item | Result | Label |
|---|---|---|
| `npm run typecheck`, `npm run build` | Pass. One Vite notice: the JS chunk is over 500 kB (1.70 MB raw, 515 kB gzip) | Checked |
| `npm audit` | 0 vulnerabilities | Checked |
| Console | No errors in the beat sweeps; one three.js deprecation warning (`THREE.Clock`, from a dependency) | Checked |
| Screenshot sweep 1280×720, all 11 beats | Done; defects above fixed and re-shot | Checked |
| Screenshot sweep 390×844 (phone), all 11 beats | Done; phone defects above fixed and re-shot | Checked |
| 1440×900 and 1280×800 sweeps | Not run: software WebGL takes minutes per frame at these sizes; composition was checked at 1280×720 | Not run |
| Reduced motion | Covered by the interaction suite (forward moves are cuts) | see below |
| Interaction suite (keyboard map, clicker keys, interrupt, rapid presses, deep links, selection, Explore, dialogs, text version, swipe) | RESULTS PENDING | Checked |
| Fullscreen enter/exit | Not run in the harness (headless Chromium has no real fullscreen) | Not run |
| Safari / iOS | Not run on this build. The earlier Scene 2 proof was checked on a real iPhone; this build is not | Not run |
| Frame rate (desktop 60 fps, phone ≥ 50 fps) | No real-device measurement | Not run |
| Payload | First frame ≈ 1.1 MB gzip (JS 515 kB, fonts 299 kB, contour data 310 kB). Whole experience ≈ 3.3 MB gzip, mostly the brain model (2.1 MB), which loads while the opening contour map is on screen. **Over the 2.5 MB critical-path target if the model counts as critical** | Estimated |
| Memory trend over repeated step changes | Not run | Not run |
| `design-design-critique` pass on final screenshots | Self-review only (this report); no separate critique pass yet | Not run |

## Scientific accuracy

- All shipped statements come from fact-register entries marked Read (OpenStax *Anatomy and
  Physiology 2e*). Excluded and still unverified: amygdala-specific roles (F4.8), the H.M. outcome
  sentence (F4.3), the fornix as a fibre tract (F4.9), the cingulate's limbic role (F2.10, so it
  is named only), and "how activity becomes experience is an open question" (F5.2; the closing line
  says only that these steps do not explain experience).
- The step 3 descent ends at the left middle temporal gyrus of the model, while the neuron's
  hemisphere is not recorded. The caption says so; the landing point is the gyrus, not a claim
  about the cell's side.
- Simplifications visible on screen: Recorded/Illustrative legend on every beat; "Slowed down",
  "Not to scale", "Simplified" and "cut open" captions where they apply.
- An expert review has not happened. **Recommended before release**: the client should decide
  whether a neuroscience educator reviews `fact-register.md` and the step 1 cross-section.

## Licences (unchanged by this build)

- BodyParts3D: the CC BY 4.0 vs CC BY-SA 2.1 JP conflict stays **unresolved**; both notices are on
  screen and in `ATTRIBUTION.md`.
- Neuron 290955: CC BY 4.0, three citations on screen. The reconstruction is never committed;
  it is published only inside the private review link, with attribution.

## Known limits

- The hippocampus mesh is low-poly (492 vertices) and reads faceted at the closest Explore zoom.
- Line work in step 5 is drawn from surface silhouettes and the cavity term; thin regions (the
  brainstem) draw faintly.
- The private review link uses a base64 copy of the model (7.9 MB text) because that host serves
  no `.glb`; the real deployment uses the 2.76 MB meshopt GLB.
- Checkpoint 4 spec documents are owed (see above).
