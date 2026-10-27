# NEUROVERSE — Camera and transition choreography (Checkpoint 3, B)

Status: for review with `storyboard.md`. Timings are design targets, confirmed or adjusted at
each scene gate (they are felt, not computed). All timelines are GSAP and owned by the
presentation state machine. Camera poses are pure functions of timeline progress.

## Rules for every transition

| Rule | Behaviour |
|---|---|
| One owner | The narrative rig (GSAP) owns the camera in Presentation Mode; OrbitControls owns it in Explore. Hand-off on entering Explore: the controls start from the current pose. On leaving: a 1.2 s tween back to the stored teaching pose |
| Labels | Leave 0.25 s before the move; return after the settle (leader line extends 0.5 s, 60 ms stagger) |
| Interrupt (next during a move) | The current timeline jumps to its end state within 300 ms (a short crossfade hides the jump). The input is consumed; nothing queues. The next input starts the next move |
| Interrupt (previous during a move) | Cancel and cut back to the origin's resting frame (300 ms crossfade) |
| Previous (at rest) | 450 ms crossfade to the previous beat's resting frame. Long choreography is not played in reverse: a descent or sweep reversed reads wrongly, and presenters going back want speed |
| Deep link / refresh | Renders the target beat's resting frame directly (no move), after the model is ready |
| Reduced motion | Every move becomes a 300 ms crossfade between resting frames; autonomous events only on request (see `adaptation-plan.md`) |
| Depth of field | Desktop tier only; opens during moves, closes (fully sharp) before the frame locks |
| Ease vocabulary | **Orbit** `power2.inOut` · **Settle** `power3.out` · **Descent** `power2.in` · **Sweep** `sine.inOut` · **Cross-exposure** linear opacity · **Signal front** `none` (constant speed) · **Follow camera** `sine.inOut` with 0.3 s lag |

## Transition table

Poses: azimuth / elevation / field of view / subject position (fraction across, fraction down) /
subject share of frame height. Desktop 16:9 values; portrait uses its own framing (see
`adaptation-plan.md`).

| ID | From → to | Trigger | Duration | Segments (time, what, ease) | End pose | Interrupt result |
|---|---|---|---|---|---|---|
| T0 | Load → 1a | Model decoded, shaders compiled | 1.2 s | Single top contour draws (`power1.inOut`) | Top-down 88° el, FOV 22°, contour centred, 18% height | Instant to drawn contour |
| T1 | 1a → 1b → 1c | Begin / next | 7.5 s | 0–2.4 contours stack (50 ms apart) · 2.0–5.2 tilt + orbit + dolly to az −40°, el 18° (`power2.inOut`) · 4.6–7.0 slabs fill and close into surface · 7.0–7.5 settle (`power3.out`) | az −40°, el 18°, FOV 26°, (0.62, 0.52), 62% | 1c within 300 ms |
| T1b | 1c intact → 1c exploded | Next | 1.4 s | Top above 64% height plane lifts 18% of brain height (`power3.inOut`); labels after | Same pose | Exploded state |
| T2 | 1c → 2a | Next | 3.0 s | 0–1.0 top lowers and rejoins (`power2.inOut`) · 0.6–3.0 orbit to lateral (`power2.inOut`, last 0.6 s `power3.out`) · contours none | az 0°, el 2.3°, FOV 26°, (0.52, 0.58), 52% | 2a |
| T3 | 2a → 2b | Next | 3.0 s | 0–1.4 orbit away to az 24°, el 9° (`power2.inOut`) · 0.2–1.7 plane sweeps through left hemisphere (`power1.inOut`) · 1.4–3.0 return to medial frame (`power3.inOut`); left hemisphere hidden when plane < 0.03 | az 0°, el 2.3°, FOV 26°, (0.53, 0.575), 56% | 2b |
| T4 | 2b → 3a | Next | 4.4 s | 0–1.0 left hemisphere returns, orbit to az 0°, el −5° · 0.6 violet ring on left middle temporal gyrus · 1.0–3.0 dolly toward ring (`power2.in`), DOF narrows · 2.6–3.4 cross-exposure to neuron; scale bar 5 cm → 100 µm · 3.4–4.4 settle (`power3.out`) | Neuron: el 8°, FOV 35°, (0.6, 0.5), 70% | 3a |
| T5 | 3a → 3b | Next (fires the signal) | 7.2 s | 0–1.8 spline to trigger zone, FOV 35°→40° (`power2.inOut`) · 1.8–2.2 hold · 2.2–7.2 signal travels (front `none`), camera follows 30 µm aside, 15° below (`sine.inOut`, 0.3 s lag) | Low tracking pose at axon branches | 3b resting (signal arrived, trace fading) |
| T5r | 3b replay | Replay signal | 5.0 s | Signal segment only, from the trigger-zone pose (0.6 s cut back first) | Same as T5 | Resting |
| T6 | 3b → 3c | Next (fires release) | 5.8 s | 0–0.8 cross-exposure to synapse · 0.8–1.4 calcium channel ticks · 1.4–2.4 vesicles dock and fuse · 2.2–3.6 transmitter crosses cleft · 3.4–4.0 binding · 3.8–4.8 postsynaptic response · whole: push-in 6% (`power1.inOut`) | Synapse: FOV 30°, terminal top, receptors bottom, cleft at optical centre | 3c resting (bound) |
| T6r | 3c replay | Replay | 5.0 s | Event only | Same | Resting |
| T7 | 3c → 4a | Next | 4.4 s | 0–0.9 cross-exposure to brain at az 70°, el 10°; scale bar back to 5 cm · 0.6–3.6 arc to az 15°, el −12° (`power2.inOut`) · 1.2–3.4 cortex opaque → translucent shell (`power1.inOut`) · settle · 3.4–4.6 fornix-route reveal (0.15 s per structure) | az 15°, el −12°, FOV 28°, (0.6, 0.55), 68% | 4a |
| T8 | 4a → 4b | Next | 1.6 s | 8° arc + 10% dolly-in (`power2.inOut`); highlight crossfade 0.6 s; amygdala reveal 0.3 s | az 7°, el −12°, FOV 28° | 4b |
| T9 | 4b → 5 | Next | 7.6 s | 0–1.4 cortex to solid, ease to lateral, FOV 26°→24° (`power2.inOut`) · 1.4–7.0 coronal sweep front-to-back (`sine.inOut`); behind plane: line work; ground charcoal → plate tied to plane · 6.2–7.6 threads draw (0.8 s each, 0.2 s stagger), annotations | az 0°, el 0°, FOV 24°, (0.62, 0.5), 56% | Final drawing |
| T10 | 5 → 1a | Start again | 0.6 s | Crossfade plate → abyss | 1a | 1a |
| X1 | Enter Explore | E / button | 0 s | Controls attach at current pose; hint line appears | Current | — |
| X2 | Leave Explore | Esc / button | 1.2 s | Tween from current orbit pose to stored teaching pose (`power2.inOut`) | Teaching pose (±0.001 units) | Snap to teaching pose |
| X3 | Explore select glide | Tap / Enter on structure | 1.2 s | Target and distance glide to frame structure, rest of brain in view (`power2.inOut`) | Structure-framed | User drag cancels |
| X4 | Explore guided view | View button | 1.2 s | Orbit to preset (`power2.inOut`) | Preset | User drag cancels |

## Timing overview

| Scene | Beats | Moves the presenter waits through | Longest |
|---|---|---|---|
| 1 | 1a, 1b/1c, 1c exploded | 7.5 s + 1.4 s | T1 7.5 s (skippable) |
| 2 | 2a, 2b | 3.0 s in, 3.0 s section | 3.0 s |
| 3 | 3a, 3b, 3c | 4.4 s in, 7.2 s signal, 5.8 s synapse | T5 7.2 s |
| 4 | 4a, 4b | 4.4 s in, 1.6 s | 4.4 s |
| 5 | final | 7.6 s | T9 7.6 s |

Total choreography if presented straight through: about 47 s across 11 resting beats; everything
else is the presenter's own pace.

## What the moves mean

| Verb | Used in | Why it is there |
|---|---|---|
| Cut | T1 (horizontal), T3 (midline), T9 (front-to-back) | To show what is inside, in the three standard anatomical planes |
| Descend + cross-exposure | T4, T6, T7 | Scale changes, which are honest cuts, not continuous zooms |
| Translucency | T7 | Networks: you must see several deep structures at once |
| Orbit | T2, T3, T7, T9 | To change to the next standard view |
| Follow | T5 | To keep the audience with the one signal |
