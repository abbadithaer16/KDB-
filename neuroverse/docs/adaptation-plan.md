# NEUROVERSE — Mobile, accessibility and reduced-motion plan (Checkpoint 3, E)

Status: for review. The iPhone Safari test of the Scene 2 proof (27 Oct, your device) confirms
one-finger rotation and pinch-to-zoom work. That is a functional result only. Performance,
memory and visual quality on the phone are **not measured**.

## 1. Device tiers

| Tier | Detected by | Gets |
|---|---|---|
| Desktop | Fine pointer, no reduced-data, adequate GPU (adaptive via `PerformanceMonitor`) | Full materials, depth of field during moves, selective bloom on the signal, DPR up to 2 |
| Mobile | Coarse pointer or narrow viewport; or desktop that drops frames | DPR ≤ 1.5; no depth of field; no bloom (emissive colour stays); neuron at medium detail; scene 4 cut-away window instead of the translucent shell |
| No WebGL | WebGL2 unavailable, context lost twice, or user choice ("Text version") | Complete HTML version: stills and SVG, all text, all labels, sources |

Tiers lower effects, never content. Each scene's fallback is in `storyboard.md` (item 13).

## 2. Layout by viewport

| Viewport | Layout |
|---|---|
| 1920×1080 projector | Atlas field: title and statement top left, labels in margins with leader lines, dock bottom left, counter top right. Type scale from `visual-system.md` (labels 26 px) |
| 1440×900, 1280×800 laptops | Same layout, type scaled down; leader lines stay |
| Portrait tablets and phones (aspect < 0.9 or width < 760 px) | Subject in the upper 45–60%; the dock (label list, caption, controls, credit) stacked at the bottom; leader lines hidden; tapping a name highlights the structure. Proven in the proof |
| Landscape phones | Subject left two-thirds, compact dock on the right; title shortened to the scene name |
| Safe areas | `env(safe-area-inset-*)` on all edges; `100dvh` stage; no `100vh` |

Per-scene portrait framing:
- Scene 1: contour centred, then the brain upright.
- Scene 2: as in the proof.
- Scene 3: the neuron vertical; the tracking shot rolled so the axon runs down the screen; the
  synapse terminal-above.
- Scene 4: hippocampal curve horizontal.
- Scene 5: the sweep top to bottom.

All rolls are set from the aspect ratio before a move, never during it.

## 3. Touch and pointer

| Gesture | Presentation Mode | Explore Mode |
|---|---|---|
| Tap structure | Select / deselect (drag threshold 4 px, as in the proof) | Select, glide to frame |
| Tap label (dock) | Select | Select |
| Swipe left / right **on the dock** | Next / previous (≥ 60 px, < 600 ms, horizontal ≥ 1.5× vertical) | — (dock hidden except controls) |
| One-finger drag on canvas | Nothing (page does not move; canvas is not scroll-jacking) | Orbit |
| Pinch | Nothing (browser zoom stays available outside the canvas) | Zoom within limits |
| Two-finger drag | — | Nothing (pan disabled) |
| `pointercancel` / lost touch | Resets the gesture; no stuck drags | Same |

The on-screen Next and Previous buttons are always present, at least 44×44 px. Swipes are a
shortcut, never the only route.

Fullscreen:
- A visible enter and exit control, with feature detection.
- iPhone Safari has no element fullscreen, so it gets the full-viewport `dvh` layout and the
  browser chrome may stay.
- State is restored on exit.

## 4. Keyboard and clickers

The default keyboard map applies (`visual-system.md`). Presentation clickers send PageDown and
PageUp, and must be tested with a real clicker if one is available; otherwise this is reported
as Not run. Focus order in every beat:
1. Skip link
2. Title
3. Labels, from top to bottom
4. Scene controls (Explore, Replay, Cut depth)
5. Navigation
6. Credit

Modals (help, sources) trap focus and return it to the opener.

## 5. Accessibility

| Requirement | Plan |
|---|---|
| Canvas | `aria-hidden`; every fact the 3D shows is also HTML (labels, roles, captions, a short text description of each resting frame) |
| Announcements | `aria-live="polite"`: "Step 2 of 5, The architecture of thought, left lateral view" on each beat; selection changes; "Explore mode on/off" |
| Contrast | Text ≥ 4.5:1 everywhere (most ≥ 7:1, computed in `decisions.md`); text over the canvas sits on the ground colour or a scrim |
| Selection | Never colour alone: dimming, outline, label state, and `aria-pressed` |
| Flashing | Nothing flashes more than 3 times per second; the signal front's brightness is monotonic per node |
| Zoom | Browser zoom works; `user-scalable` is not disabled |
| Hover | Nothing depends on hover |
| Language | `lang="en"`; plain, active sentences; artistic tags written out in words |

## 6. Reduced motion (`prefers-reduced-motion: reduce`, via `gsap.matchMedia()`)

| Scene | Normal | Reduced motion |
|---|---|---|
| 1 | 7.5 s construction, exploded lift | Crossfade to the finished 1c; build on request ("Play the build", no camera move); lift as crossfade |
| 2 | Orbits, section sweep, label draw-in | 300 ms crossfades; labels appear; Explore without damping; guided views cut |
| 3 | Descent, tracking shot, signal, release | Cross-cuts between still frames; signal as a static numbered path; synapse as three still states; "Play the signal" on request, without camera motion |
| 4 | Arc, translucency fade, fornix-route reveal | Crossfade to the translucent teaching pose; network appears at once |
| 5 | 5.6 s coronal sweep | Crossfade to the finished drawing |
| Explore (all) | Damping, glides | No damping or inertia; selection and presets cut |

Reduced motion is reversible at runtime: changing the OS setting takes effect without a reload.

## 7. What is measured, and how (labels per CLAUDE.md)

| Check | Plan | Current label |
|---|---|---|
| iPhone Safari frame time per scene | You on your iPhone (please give the model and iOS version), Safari Web Inspector timeline from a Mac if available, or an in-app frame-time overlay (hidden, enabled by `?debug`) that reports p50/p95 | Not run |
| Desktop frame time | Chrome Performance panel, production build | Not run |
| Payload | Production build sizes (gzip and Brotli) | Estimated (scene 2 model: 2.11 MB gzip, measured file size) |
| Projector readability | A real 1080p projector if available; otherwise a simulated washout preview | Not run |
| Screen reader | VoiceOver on iPhone and macOS if available | Not run |

The container's software-WebGL frame rates are never used as performance evidence.
