# Hyperform — project guide for Claude

Hyperform builds cinematic 3D web experiences. Each project lives in its own folder at the repo
root. The bar: work that reads as directed and specific to its subject — never a template with
effects added. If a choice could appear unchanged on any other site, it is not finished.

## Experience types

Every project declares one type at checkpoint 1. The type decides the architecture; do not
apply one type's machinery to another.

| Type | What drives it | Typical use |
|---|---|---|
| **Scroll** | Page scroll position drives scenes, camera and reveals | Brand sites, product launches, editorial stories |
| **Presentation** | Discrete steps driven by the presenter or viewer (next/prev, keys, taps) | Talks, pitches, educational walk-throughs, kiosks |
| **Hybrid** | A scroll or step narrative plus a free-exploration mode | Product configurators, interactive explainers |

## Mandatory checkpoints

Every checkpoint is required, in order, for every project. Stop after each one, present it,
and wait for explicit approval. **No production code — including prototypes, test scenes or
dependency installs — before checkpoint 4 is approved.** If a later step reveals a problem
with an approved checkpoint, go back and get the change approved; do not patch around it.

1. **Brief** — subject, audience, primary goal, experience type, page or step list, target
   devices and browsers, image needs, whether the content is educational/scientific, deadline.
   Portfolio and client-facing demos also include the commercial brief (see *Commercial demo
   standard*). Ask for anything missing; never invent the subject.
2. **Decisions** (`docs/decisions.md`) — art-direction references and the principles taken from
   them, palette, type direction, research notes, originality statement, previous-work audit
   and shell-ban list. Educational projects also include the source list (see *Scientific
   accuracy*).
3. **Storyboard** (`docs/storyboard.md`) — overall cinematic grammar, one scene thesis and one
   signature composition per page or step, narrative arc, entrance/transition map, where 3D is
   used and why. Educational projects mark each scene's facts and visual liberties.
4. **Compiled spec + technical plan** (`docs/compiled-spec.md` and `docs/interaction-spec.md`) —
   exact tokens; per-section/step layout, motion and interaction; architecture (canvas plan and
   any exceptions); External Library Decision; full dependency list with exact versions; asset
   plan with size budgets and the asset quality gate results for every major 3D model already
   chosen; performance targets and how they will be measured; fallback plan; the interaction
   specification; the scene build order for scene quality gates.
5. **Build** — implement from the spec, one scene at a time, passing each scene quality gate
   before starting the next. Every major 3D model passes the asset quality gate before it is
   integrated. Any change to layout, interaction or architecture goes back into the spec and
   is re-approved first.
6. **QA report** (`docs/qa-report.md`) — every checklist item marked Measured / Estimated /
   Not run with reasons and conditions, screenshots, and (for educational projects) the
   completed fact review. Nothing is "done" until this is reviewed.

Planning documents live in `<project>/docs/`. Keep director names, film titles and process
language out of the shipped UI.

## Commercial demo standard

Applies to every portfolio piece and client-facing demo. Written into the checkpoint 1 brief
and carried through every later checkpoint.

- **Target buyer** — who would commission this work (role, organisation type, budget tier)
  and what they are trying to achieve with it.
- **Intended emotional impression** — what the buyer should feel in the first ten seconds and
  at the end, in concrete terms (e.g. "trust in scientific rigour", "desire for the object").
- **Unique value proposition** — what this experience shows that a typical agency site or
  template cannot.
- **Service demonstrated** — the specific, paid service the finished piece proves Hyperform
  can deliver (e.g. "interactive 3D product configurator", "educational WebGL explainer"),
  and which moments in the experience prove it.

The commercial objective guides scene priorities, polish and what to cut. It does not add
generic sales elements: no pricing tables, testimonial carousels, logo walls, feature grids,
"book a call" banners or stock CTAs unless the brief explicitly calls for them and they are
designed into the experience. The quality of the work is the pitch.

## Original art direction

- References — films, directors, photographers, sites — inform **principles**: rhythm, light
  behaviour, framing logic, pacing, material feel, restraint. Write those principles down in
  `decisions.md` in our own words.
- Never recreate a specific shot, poster, title sequence, scene composition, character, logo,
  colour-graded still, or any other recognisable element of a copyrighted work. If a viewer
  could name the source from a frame, it is imitation — redesign it.
- Every project has its own visual identity. Its palette, type, composition and camera
  language are derived from its subject, not borrowed from a reference or from previous work.
- `decisions.md` includes an **originality statement**: what was taken from each reference as a
  principle, and what was deliberately not taken.

## `eclat/` — technical reference only

ÉCLAT is a finished Hyperform demo. Study it for **engineering**: its architecture, performance
techniques, fallbacks, asset pipeline and QA harness, and the lessons recorded in its README
and ASSETS.md. Useful patterns include deterministic scroll-to-camera mapping, a mutable
per-frame store outside React state, pausing WebGL when no 3D is visible, capability tiers,
streaming non-critical models, and a complete non-WebGL fallback.

**Never copy its visual identity:** not its palette, typography, layouts, scene compositions,
camera paths, shot choreography, lighting setups, copy tone or interaction design. Use it as a
previous-work entry in every shell-ban list. Code may be adapted only where it is generic
infrastructure (e.g. a GSAP context hook), and only after checking it still fits the new
project's architecture.

## Skills — which to use when

| Stage | Skills |
|---|---|
| Art direction and checkpoints 1–4 | `cinematic-ui` (primary workflow), `frontend-design` (taste, type, copy) |
| Design review of mockups, scenes and builds | `design-design-critique`, then `frontend-design` self-critique |
| 3D scenes | `threejs-r3f`, `threejs-scene`, `threejs-materials`, `threejs-lighting`, `threejs-animation`, `threejs-interaction` |
| Motion | `gsap-core`, `gsap-timeline`, `gsap-react`, `gsap-plugins` |
| Performance | `threejs-performance`, `gsap-performance` |
| QA | `threejs-testing` |

Resolving overlaps:
- `cinematic-ui` owns the creative process, read through *Original art direction* above:
  its director/film research yields principles, never compositions to reproduce.
- `frontend-design` sharpens the result but does not replace the cinematic-ui workflow.
- Use GSAP SplitText (free, in the `gsap` package), not SplitType.
- Ignore `cinematic-ui`'s CDN `<script>` snippets; install from npm at a pinned version.
- Image placeholders use sentence case, not all-caps monospace labels.
- Do not split work across sub-agents unless the user asks for it.
- `gsap-scrolltrigger` is not installed; follow the GSAP docs for ScrollTrigger.

## Visual design standards

- One dominant idea per page or step; everything else supports it. Remove one more thing
  before shipping.
- Palette: 4–6 named tokens, defined as CSS custom properties. No stray hard-coded colours.
- Typography: one or two deliberate families, self-hosted (`@fontsource` or local files),
  a clear type scale, line length under ~80 characters.
- Avoid the generated-page defaults: centred gradient hero, identical rounded cards,
  fade-up on every section, all-caps eyebrow labels, "→" on every link, numbered markers on
  content that is not a sequence.
- Motion: at most one heavy interaction and two showy reveals per page or step; adjacent
  sections never reveal the same way.
- Copy: plain, specific, active voice; buttons say what happens.

## Scene quality gates

Applies to every project with more than one cinematic scene (a scroll section, presentation
step or explore view with its own composition). Build scenes in the order agreed at
checkpoint 4. When a scene is complete, stop and present a gate review before starting the
next one:

- **Visual quality** — matches its scene thesis and signature composition; type, colour,
  lighting and materials are finished, not placeholder; passes a `design-design-critique` pass.
- **Motion** — entrances, transitions and camera moves match the spec; correct under fast,
  reversed and interrupted input.
- **Interaction** — every action in `interaction-spec.md` for this scene works with pointer,
  touch and keyboard.
- **Accessibility** — text equivalent present, focus order correct, reduced-motion behaviour
  implemented, contrast checked.
- **Performance** — draw calls, triangles, texture memory and payload for the scene, labelled
  Measured / Estimated / Not run as defined under *Performance*.
- **Evidence** — screenshots at the scene's key states (desktop, mobile, reduced motion), and a
  screen recording where the environment can produce one. Say plainly when a recording or a
  real-device check was not possible.

Wait for explicit approval of each scene before building the next. Fixes requested at a gate
are made and re-presented before moving on. Approving a scene does not waive the final QA
report.

## Asset quality gate

Every major 3D model (a hero object, a character, an anatomical structure, any model a scene is
built around) passes this gate **before** it is integrated. Record the result in `ASSETS.md`.

- **Visual quality** — rendered under neutral studio light and under the scene's intended
  lighting, at the closest camera distance the experience will use; screenshots attached.
- **Geometry** — clean topology for its use, no holes, flipped normals, intersecting or
  floating parts, correct scale and orientation; triangle count within budget.
- **Materials** — PBR maps complete and in the correct colour spaces, UVs without visible
  stretching or seams, textures sized for the target devices.
- **Licensing** — source, author, licence and attribution requirements recorded; licence
  permits the intended use (including commercial use for client-facing demos). Unknown
  licence means rejected.
- **File size and performance** — compressed size, draw calls, texture memory and load time
  against the asset budget, measured in the target pipeline (meshopt/Draco, KTX2).
- **Scientific accuracy** — for educational projects, checked against the reference atlases
  and sources in `docs/sources.md` (see *Scientific accuracy*).

An asset that fails is **rejected or replaced**: fixed at the source, re-modelled, or swapped
for a better one. Never compensate for a weak model with bloom, fog, darkness, motion blur,
fast camera moves or other effects that hide its flaws. If no suitable asset is available,
stop and report the options to the user.

## Architecture

### Common to all types

Default stack: Vite, React, TypeScript `strict`, React Three Fiber, Drei, three.js, GSAP.
Check peer-dependency compatibility (React ↔ Fiber ↔ Drei ↔ three) before upgrading any of them.

- **Canvas — single by default.** Prefer one `<Canvas>` for the whole experience and render
  only while 3D is visible or being interacted with. A second canvas, an offscreen canvas or
  an HTML/CSS-only scene is allowed when justified by performance, isolation or architecture;
  record each exception, its reason and its cost in `compiled-spec.md` under
  *Architecture exceptions*.
- **Per-frame values never go through React state.** Use refs or a mutable store; React state
  is for UI transitions only.
- **One owner per property.** A transform is driven by exactly one system (timeline, scroll,
  clip, physics or controls) at a time; hand-offs are explicit.
- **GSAP in React** only through `useGSAP()` from `@gsap/react` or a `gsap.context()` hook with
  `revert()` on unmount. Always scope selectors. Register plugins once.
- **Resource ownership.** Dispose what you create; never dispose shared loader-cache entries.
- **Client-only.** WebGL and GSAP code never runs during server rendering.

### Scroll experiences

- GSAP ScrollTrigger drives scroll-linked motion. Lenis is optional; add it only if the
  storyboard needs it, sync it through the GSAP ticker, and turn it off for reduced motion.
- Camera poses are a pure function of section progress; damping is applied afterwards, so
  fast, reversed or jumped scrolling lands on the same frame.
- Lock smooth scrolling while orbit controls or modals own input.

### Presentation experiences

- No ScrollTrigger and no Lenis. The page does not scroll-jack; navigation is by step.
- A single source of truth for the current step (a small state machine: step index, transition
  state, mode). Every step has a stable ID and is deep-linkable (`#step-id`).
- Transitions are GSAP timelines that can be interrupted: pressing next mid-transition
  completes or jumps cleanly to the target state, never queues a pile of animations.
- Every step renders correctly when reached directly (deep link, back button, refresh).

### Hybrid experiences

- The narrative part follows the Scroll or Presentation rules above; Explore Mode follows the
  interaction specification.
- Entering Explore Mode pauses the narrative driver (scroll or step timeline); leaving it
  restores the exact narrative position and camera.

## Interaction specification

Required for every project in `docs/interaction-spec.md` at checkpoint 4. Sections that do not
apply are written as "Not applicable" with a reason, not omitted.

- **Presentation Mode** — step list; next/previous/jump; what happens at the first and last
  step; presenter controls (overview, blank screen, timer) if needed; whether steps
  auto-advance (default: never).
- **Explore Mode** — how it is entered and exited; what the user can manipulate (orbit, zoom,
  pan, select, cut-away, layers); camera limits; reset; how selection is shown; how it returns
  to the narrative.
- **Keyboard map** — every action reachable by keyboard. Defaults: `→`/`Space`/`PageDown` next,
  `←`/`PageUp` previous, `Home`/`End` first/last, `F` fullscreen, `Esc` exit mode or
  fullscreen, `?` help overlay. No conflicts with screen-reader or browser shortcuts.
- **Touch and pointer** — swipe, tap, drag, pinch; click-vs-drag thresholds; how page scroll is
  preserved outside interactive areas; `pointercancel` handling.
- **Fullscreen** — via the Fullscreen API with feature detection; a visible enter/exit control;
  fallback where element fullscreen is unavailable (notably iPhone Safari): a full-viewport
  layout using `dvh`; state restored on exit.
- **Accessible alternatives** — a text/HTML equivalent for every piece of information the 3D
  carries; a non-WebGL path; reduced-motion behaviour per mode; focus order and focus return;
  screen-reader announcements for step changes (`aria-live="polite"`).

## Scientific accuracy (educational projects)

Applies whenever the brief marks content as educational or scientific (e.g. anatomy,
neuroscience, biology, physics).

1. **Sources first.** At checkpoint 2, list authoritative sources in `docs/sources.md`:
   peer-reviewed literature, standard textbooks, recognised reference atlases and institutional
   resources. Record title, author/organisation, year, and URL or DOI. No unsourced claims.
2. **Fact register.** Every factual statement in copy, labels or narration is recorded in
   `docs/fact-register.md` with its source. Prefer consensus over single studies; flag
   simplifications and contested points explicitly.
3. **Anatomical and structural correctness.** Models and diagrams are checked against reference
   atlases for structure, position, proportion, orientation (state the anatomical axes and
   views used), naming and labelling, as part of the asset quality gate. Record known
   inaccuracies in `ASSETS.md`.
4. **Fact vs artistic visualization.** The storyboard and spec mark each element as either
   *scientific* (must be accurate) or *artistic* (stylised for clarity or mood: colour coding,
   glow, exaggerated scale, slowed time, metaphor). The shipped experience makes the
   distinction visible to the viewer where it matters — e.g. "Illustrative colours",
   "Not to scale", "Simplified".
5. **Review.** Before the QA report, re-check every fact-register entry against its source,
   and ask the user whether a subject-matter expert should review it. Report what was checked,
   what could not be verified, and what is simplified.
6. **When web research is blocked**, say so. Never fill gaps from memory as if they were
   verified; mark them *unverified* and leave them out of shipped copy until they are checked.

## Performance

### Targets (unverified until measured)

- Steady state: 60 fps desktop; ≥ 50 fps on a mid-range phone during scroll or transitions.
- Critical-path payload (compressed): ≤ 2.5 MB; first meaningful frame ≤ 3 s on a 4G profile.
- DPR cap: 2 desktop, 1.5 mobile, adaptive via `PerformanceMonitor`.
- Models: meshopt or Draco compression, GPU instancing for repeated parts, KTX2 textures where
  practical; each asset's budget recorded in `ASSETS.md`.
- Shaders precompiled before a scene is revealed; non-critical models streamed after the intro.
- Images: responsive AVIF/WebP ladders with LQIP, lazy below the fold.
- Capability tiers: low-power devices get fewer effects, not a broken experience; a complete
  non-WebGL fallback always ships.

### How results are reported

Every performance figure in a scene gate or the QA report carries one label:

- **Measured** — on a named real device and browser version, with the build type (production),
  network profile, DPR, viewport, scene/step and the method (e.g. Chrome Performance panel,
  Safari Web Inspector timelines, `renderer.info`). Report frame-time percentiles, not just
  averages.
- **Estimated** — derived from asset sizes, draw calls or desktop profiling. Useful, but not
  evidence of a target being met.
- **Not run** — with the reason (e.g. no device available).

The Playwright harness uses software WebGL in a container; its frame rates are **never**
performance evidence. A target is met only when it is **Measured** on a representative real
device.

## Safari and iOS

Safari is a target, not an afterthought. Check every build against:

- iOS memory limits: keep total texture memory modest; large canvases at DPR 3 crash tabs.
- Viewport units: `svh`/`dvh`, not `100vh`, for full-screen sections.
- Pinning and smooth scrolling under rubber-banding and the collapsing toolbar (Scroll type).
- Fullscreen API support and its fallback (see *Interaction specification*).
- `-webkit-backdrop-filter`, `-webkit-mask` and `clip-path` support for each effect used.
- Video: `muted playsinline autoplay`, with a poster frame.
- AVIF needs Safari 16+; always provide WebP.
- WebGL extensions are feature-detected, never assumed.
- The local harness is Chromium-only: Safari results are **Not run** unless tested on a real
  device or a WebKit runner, and are never inferred from Chromium.

## Accessibility and reduced motion

- Semantic HTML first; the canvas is decorative (`aria-hidden`) and every piece of meaning it
  carries also exists as text.
- Every 3D action has a keyboard and HTML equivalent; visible focus everywhere; modals trap and
  return focus.
- `prefers-reduced-motion`: Scroll — no smooth scroll, no parallax, instant or crossfade
  reveals, shorter pins. Presentation — cuts or short crossfades between steps, no camera
  flights. Explore — no auto-rotation or inertia. Use `gsap.matchMedia()` so it is reversible.
- Text contrast meets WCAG 2.2 AA, including text over imagery (use scrims).
- Respect user zoom; nothing depends on hover alone; nothing flashes more than 3 times per second.

## Testing and visual QA

Before the QA report:
- `npm run typecheck` and `npm run build` pass with no warnings ignored.
- Every scene has an approved scene quality gate, and every major 3D model an approved asset
  quality gate.
- Screenshot sweep at fixed stops (scroll positions or step IDs): 1440×900, 1280×800,
  390×844 mobile, plus reduced motion and the non-WebGL fallback.
- Interaction suite from `interaction-spec.md`: keyboard map, touch, pointer, mode switches,
  fullscreen enter/exit, deep links, focus order.
- Stress: rapid/reversed scrolling or rapid step changes converge to the same frames; repeated
  mount/unmount and model switches show no rising memory trend.
- Console and network clean: no errors, no failed requests.
- Deterministic fixtures: fixed viewport and DPR, seeded randomness, wait for a readiness
  signal rather than sleeping.
- Run `design-design-critique` on final screenshots and fix what it finds before reporting.
- For commercial demos, check the finished experience against the commercial brief: does it
  produce the intended impression and prove the stated service?

## Dependencies and security

- Exact versions only: `npm install --save-exact`; commit `package-lock.json`; install with
  `npm ci`. (`eclat/` predates this rule and uses `^` ranges.)
- No CDN `<script>` tags; everything is bundled from npm.
- Every new dependency is listed at checkpoint 4 with why it is needed, size, licence and last
  release date. Prefer what is already in the stack.
- Run `npm audit` before each QA report; no high or critical issues ship.
- No secrets, API keys or tokens in the repo. Demo forms send nothing unless the brief says so.
- Third-party assets need a recorded licence in `ASSETS.md`; prefer original assets.

## Git

- Work on a feature branch; never commit directly to `main`.
- Do not merge into `main` without explicit approval.
- Commit messages describe the change and why; no generated files or `node_modules`.
