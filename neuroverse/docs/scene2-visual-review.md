# Scene 2 — visual review of the proof (round 2, 26 Oct 2026)

Status: conditional approval of the proof only. Not final visual approval; not production.

## Already functional

| Area | What works now |
|---|---|
| Anatomy | Real BodyParts3D 4.0 geometry: lobes, cerebellum, brainstem; right hemisphere's medial surface; corpus callosum cut on the midline; thalamus, cingulate gyrus |
| Teaching frame | Left lateral view with the title, statement, view name, progress and controls laid out clear of the brain |
| Labels | Anterior structures labelled from the left margin, posterior from the right; every dot sits on a visible point of its structure; no line crosses another |
| Selection | Click a structure or its label (or Tab and Enter): violet tint and outline, other tissue dims to 3.5:1, label and line highlight; Esc clears |
| Section transition | One camera move with a cut sweeping through the left hemisphere (capped cut faces), then the medial view |
| Explore Mode | Orbit and zoom within limits; reset; exact return to the teaching frame |
| Responsive | Separate framing and label rows for phones and portrait tablets |
| Accessibility basics | Real buttons, visible focus, live announcements, reduced motion (cuts instead of camera moves) |
| Credits | BodyParts3D credited on screen with links to the source, both licences and the change notes |

## Still placeholder quality

| Area | Current state |
|---|---|
| Copy | Title and one neutral statement; no functions or explanations (waiting for the fact register) |
| Materials | A good start, but tissue reads slightly uniform and plastic up close; no subsurface or detail normal |
| Lighting | Correct direction and colour plan, but not yet dramatic: no depth of field, no bloom, no ground or atmosphere |
| Geometry close up | Faceted silhouettes and gyri at close range (99% polygon reduction in the source) |
| Cut faces | Flat colour fills, which read as "cut" but have no texture of grey and white matter |
| Labels | Correct and readable, but plain; no one-line roles yet; animation of labels is a simple fade |
| Explore Mode | Functional but bare: no on-screen hint of what can be done, no selection inside Explore |
| Transitions | Only within Scene 2; no entry from Scene 1 or exit to Scene 3 |
| Loading | A plain "Loading the brain model" line; no progress, no designed first frame |
| Fallback | No non-WebGL version yet |

## What the final cinematic experience adds

1. **Lighting and depth:** warmer key, stronger violet rim, depth of field during camera moves
   (desktop), subtle selective bloom only on the signal colour.
2. **Tissue realism:** wrap lighting for soft light bleed, a fine surface-detail normal, a wetter
   sheen; checked against faceting at the closest teaching distance.
3. **Cut surfaces:** grey and white matter shown on the cut, from the actual mesh layers rather
   than flat fills.
4. **Labels with meaning:** a sourced one-line role under each name; labels draw in after the
   camera settles.
5. **Choreography:** the arrival from Scene 1 and the descent into Scene 3, as storyboarded.
6. **Explore Mode:** a short on-screen guide, selection inside Explore, and the cut plane under
   the presenter's control.
7. **Loading and fallback:** a designed first frame and progress; a complete non-WebGL version.
8. **Presentation shell:** step navigation, keyboard map, fullscreen and the step counter working
   across all five scenes.

## Open questions for your review

- Is the two-margin label layout the right direction, or do you prefer labels on one side?
- Is the dimming level (3.5:1) right, or does the dimmed brain lose too much context?
- Should the section view stay a separate state within Scene 2, or become its own step?
