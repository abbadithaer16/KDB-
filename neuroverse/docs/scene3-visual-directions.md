# NEUROVERSE — Scene 3 visual refinement: three directions

Status: proposal, 27 Oct 2026. **No implementation until you approve a direction.** The neuron
geometry (NeuroMorpho 290955), the interaction logic, and all accuracy and licensing safeguards
stay as they are in every direction.

## What is wrong now (my diagnosis)

| Problem | Cause |
|---|---|
| The neuron reads as thin lines on black | One flat key light; no rim separation; no shadowing between branches; equal brightness at every depth |
| No sense of scale or space | Every branch is equally sharp and equally bright, so near and far collapse into one plane. The cell is also thin in depth (it was traced in a 350 µm slice) |
| The signal underwhelms | It is a small emissive dot and a sprite. It lights almost nothing around it, so it has no physical presence |
| Weak hierarchy | Trigger zone, axon and nodes get the same tube material as every dendrite; only dimming separates them |
| Close tracking looks like a road on a black plain | The axon runs to a vanishing point at the centre; nothing passes the lens; there is no foreground and no focus |
| The text looks like a document | The full citation block is always on screen; the legend and tags compete with the title |

## Common to all three directions (not optional)

- **Science:**
  - recorded geometry only;
  - every liberty labelled;
  - the signal is shown as light, now tagged "Signal shown as light (illustrative)";
  - every resting (teaching) frame is fully sharp;
  - no effect is used to hide geometry. Each frame must also read with blur and glow off.
- **Typography and sources:**
  - one editorial annotation style, used everywhere: a hairline leader, the name in Atkinson
    26 px, a short role line in `--mist`;
  - the title shrinks to a running head while the camera moves and returns at rest;
  - the legend becomes two short lines ("Recorded" / "Illustrative");
  - the on-screen credit becomes one line, "Neuron: NeuroMorpho.Org 290955 · CC BY 4.0 ·
    Sources", where Sources opens a panel with the full three-part citation and the list of
    changes (attribution stays one tap away, as CC BY allows; to be confirmed against the legal
    code once readable).
- **Mobile, accessibility, reduced motion:**
  - portrait shot list;
  - labels in the dock on phones;
  - no camera motion with reduced motion;
  - the WCAG flash analysis re-run;
  - a lighter mobile tier that still meets the look's core (no blur or glow dependence).

---

## Direction A — "Under the lens" (recommended)

**Idea:** the neuron is treated as a physical specimen filmed with a macro lens. Depth comes from
light, focus and atmosphere. The signal is the one moving light, and it physically lights the cell
around it.

| Area | Treatment |
|---|---|
| Lighting | A soft warm-neutral key from upper left, a low cool fill, and a **strong desaturated violet back-rim** (the scene 2 rim, `#8F86B3`), so every branch gets a bright edge against black. **Aerial perspective:** distant branches lose exposure and shift cooler with depth, an honest depth cue, not fog |
| Materials | Membrane with wrap lighting and a Fresnel edge, so tubes read as soft translucent tissue, not plastic. Ambient occlusion where branches cross and meet the cell body. Myelin as dense satin with a slight sheen; node gaps sit in shadow until lit |
| Signal | A real moving light. It pools on the surrounding membrane and myelin as it passes, flares briefly at each node (equal intensity, all-or-none), and leaves a fading trail. Bloom only on the front and lit nodes |
| Hierarchy | The trigger zone gets a small light pool and focus at the hold. The axon is the only fully exposed structure during the signal; dendrites fall back to rim light only. Nodes become the brightest points as they fire |
| Camera | **(1)** 3a: a three-quarter "specimen" frame at about 24° FOV (a 56 mm look), sharp, locked. **(2)** Push-in with a focus pull from the dendrites to the trigger zone, with the apical dendrite out of focus in the foreground. **(3)** Ignition hold. **(4)** Chase: longer lens (28°), the camera 40–60 µm off-axis so the axon runs diagonally across the frame on a third, collaterals passing the lens out of focus, focus locked on the front. **(5)** Crane up while focus widens to fully sharp, ending on the full-length frame |
| Mobile tier | No depth of field or occlusion pass. It keeps the rim light, aerial perspective, Fresnel material and the moving signal light, which are all cheap shader work. The bloom becomes the current sprite halo |
| Cost | Desktop needs a postprocessing chain: occlusion at half resolution, depth of field during moves, selective bloom. **New dependency** (`@react-three/postprocessing`), or hand-written passes. Estimated 3–5 ms per frame on a mid-range desktop GPU (to be measured). About 1 day |
| Risks | Depth of field could be misread as hiding detail, so the rule is that resting frames are sharp and every shot is checked with blur off. The macro look could be mistaken for real microscopy, so the caption reads "Rendered from a reconstruction" |
| Why it wins | Most cinematic and tactile. It continues scene 2's light language (raking key, violet rim, selection by light), so the lecture feels like one film. The signal becomes an event that changes the lighting of the shot, without exaggerating the science |

## Direction B — "Lit from within" (dark-field)

**Idea:** inspired by dark-field and fluorescence microscopy. The cell is near-black matter
defined only by luminous edges, and the signal is the light source of the whole frame.

| Area | Treatment |
|---|---|
| Lighting | Almost no key light. Strong edge light (Fresnel) in cool grey defines the cell. The signal's light is the main illumination when it fires |
| Materials | Dark, glassy membrane; myelin slightly brighter than the axon; nodes visible as gaps in the edge light |
| Signal | Very dramatic: each node firing illuminates its neighbourhood in a dark frame |
| Camera | Same shot list as A, with more emphasis on silhouettes and negative space |
| Mobile | Excellent: cheap, high contrast, readable on small screens |
| Cost | No new dependency needed (bloom optional). About 0.5 day |
| Risks | Closest to the generic "glowing neuron" stock look that the brief bans. It reads as microscopy-styled art, not tissue. The tissue realism that scenes 2 and 4 establish would break here. On a washed-out projector, the dark cell may disappear between firings |

## Direction C — "Depth-graded atlas"

**Idea:** the scene stays in the atlas language (and anticipates scene 5's line work).
Monochrome, with line weight and exposure graded by depth, a precise violet signal, and strongly
editorial annotation.

| Area | Treatment |
|---|---|
| Lighting | A flat-ish key; depth expressed by line weight and brightness (near heavy and bright, far fine and faint) |
| Materials | Matte, ink-like surfaces; myelin as hatched or banded segments |
| Signal | A precise violet line advancing node to node, with small numbered beats in the margin |
| Camera | Slow, documentary moves; fewer close-ups |
| Mobile | Excellent and cheapest |
| Cost | No new dependency. About 0.5 day |
| Risks | This is closest to what you just rejected: it will still read as a scientific diagram. Scene 5 already owns the line-work idea, so using it here weakens the finale |

## Comparison

| | A Under the lens | B Lit from within | C Depth-graded atlas |
|---|---|---|---|
| Cinematic impact | Highest | High | Low–medium |
| Feels three-dimensional | Highest (light, focus, occlusion, atmosphere) | Medium (silhouette only) | Medium (graphic) |
| Scientific restraint | High, with the sharp-at-rest rule | Medium (risk of glow cliché) | Highest |
| Fits scenes 2, 4, 5 | Best (shares scene 2's light language) | Breaks tissue realism | Competes with scene 5 |
| Mobile and projector | Good (lighter tier keeps the look) | Excellent on phones, weak on projectors | Excellent |
| Cost | About 1 day; new dependency | About 0.5 day | About 0.5 day |

## Recommendation

**Direction A.** It is the only one that answers all six points of your brief at once. It also
borrows two things from C that cost nothing: depth-graded exposure as a depth cue, and the
editorial annotation system.

The new dependency for the postprocessing chain is the one decision to make now. It was already
listed as T7 for Checkpoint 4; here it would be pulled forward into this proof.

## If you approve A, the order of work

1. **Look frames first:** four stills (specimen, trigger-zone hold, chase, full-length reveal) at
   1920×1080 and 390×844, sent to you for a quick yes or no before the motion work.
2. Then the motion pass, typography and sources panel, mobile tier, and reduced-motion check.
3. A re-run of the full gate: geometry, flash analysis, interaction, screenshots, recording.

Not started until you approve.
