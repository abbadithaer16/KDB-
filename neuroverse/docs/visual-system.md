# NEUROVERSE — Visual-system consistency matrix (Checkpoint 3, C)

Status: for review. Exact values are locked as tokens at Checkpoint 4.

## Across the five scenes

| | 1 The living fold | 2 The architecture of thought | 3 Electrical, then chemical | 4 Memory & emotion | 5 The human mind |
|---|---|---|---|---|---|
| **Ground** | Abyss `#07080A` | Charcoal `#15171B` | Abyss | Charcoal | Plate `#E6E5E0` |
| **Exposure** | Darkest | Dark | Darkest | Dark | Light |
| **Subject** | Whole brain from contours | Region model, section | Real neuron; procedural synapse | Brain with deep structures | Brain as ink drawing |
| **Composition** | Right of centre, text left | Centre right, labels in both margins | Diagonal (neuron), vertical (synapse) | Right of centre, labels left | Right of centre, annotations left |
| **Lens (vertical FOV)** | 22° → 26° | 26° | 35° → 40° → 30° | 28° | 24° |
| **Key light** | Warm-neutral `#FFEBDD`, upper front left | Same, lower and more raking | Soft top key, neutral | From behind and above (rims the shell) | None: unlit line render |
| **Fill** | Cool `#A9B8C9`, low | Same | Faint | Same as 2 | — |
| **Rim** | Desaturated violet `#8F86B3` | Same | Faint neutral rim | Desaturated violet, stronger | — |
| **Saturated violet `#9C86F0` means** | Contours (then fade out) | Selection | The electrical signal | The highlighted network | Violet ink `#5B3FB0`: the journey threads |
| **Amber `#E3A857`** | — | — | Neurotransmitter only (3c) | — | — |
| **Tissue material** | Production tissue; cut faces grey/white | Same, full quality | Membrane: pale, translucent sheen; myelin matte | Tissue for deep structures; Fresnel shell cortex | Ink lines; hidden lines graphite dashed |
| **Bloom** | None | None | Signal front only (desktop) | None | None |
| **Depth of field** | During T1 only | During moves only | 3a resting (shallow but subject sharp); moves | During moves only | None |
| **Title** | Newsreader | Newsreader | Newsreader | Newsreader | Newsreader, ink on plate |
| **Statement** | Atkinson, ≤ 25 words | Same | Same, one per beat | Same | Same |
| **Labels** | 2, leader lines | Up to 6, two margins, with roles | Up to 5 per beat | Up to 5 | 3 annotations with threads |
| **Tags (artistic)** | "Computed from the 3D model" | "Highlight colour is illustrative" | "Slowed down", "Simplified", "Not to scale", "Illustrative colour", "Myelin shown simplified" | "Cortex shown translucent (simplified)" | — |
| **Scale bar** | 5 cm | 5 cm | 100 µm (3a/3b); none in 3c ("Not to scale") | 5 cm | None |
| **Interaction** | Begin; label highlight | Select, section, full Explore | Replay; limited orbit in 3a | Select, cortex toggle, full Explore | Annotation highlight; Sources and credits |
| **Reveal used** (no two adjacent alike) | Construction from contours | Label draw-in + section sweep | Cross-exposure + signal | Translucency + fornix-route reveal | Coronal sweep to line work |

## Type scale (proposed; locked at Checkpoint 4)

| Role | Family | 1920×1080 | 1440×900 | 390×844 portrait |
|---|---|---|---|---|
| Wordmark | Atkinson 400 | 16 px | 14 px | 13 px |
| Scene title | Newsreader, optical size auto, 380 | 72 px | 60 px | 32 px |
| Statement | Atkinson 400 | 30 px | 24 px | 16 px |
| Label name | Atkinson 400 | 26 px | 21 px | 16 px |
| Label role | Atkinson 400, `--mist` | 20 px | 16 px | 14 px |
| Caption and tags | Atkinson 400 | 20 px | 15 px | 13 px |
| Controls | Atkinson 400 | 18 px | 15 px | 15 px (44 px targets) |

The proof uses 21 px labels at every desktop size. Production scales labels with the viewport,
so a 1080p projector gets 26 px.

Sentence case everywhere; no all-caps; no monospace; line length ≤ 60 characters for statements.

## Interaction consistency

| Action | Every scene behaves the same |
|---|---|
| Next / previous | `→`, `Space`, `PageDown` / `←`, `PageUp` (clickers send PageDown/PageUp); on-screen buttons; swipe on the dock (touch) |
| First / last | `Home` / `End` |
| Explore | `E` and a button where available; disabled with a reason elsewhere |
| Reset (Explore) | `R` and a button |
| Leave mode / clear selection | `Esc` |
| Fullscreen | `F` and a button; iPhone gets the full-viewport `dvh` layout |
| Help | `?` overlay listing the keys |
| Select | Tap or click a structure; Tab to labels, Enter |
| Selection look | Dim rest to 3.5:1, violet tint, 2 px outline, violet label and leader line, "Highlight colour is illustrative" |
| Announcements | `aria-live="polite"`: step and beat title, then selection changes |

## Anti-ÉCLAT check

| ÉCLAT trait | NEUROVERSE |
|---|---|
| Scroll-pinned scenes | Step and beat state machine |
| Beam of light reveals the object ("The Awakening") | Brain built from its own cross-sections; lighting constant |
| Warm obsidian, ivory, gold | Cool abyss and charcoal, plate, violet, one amber |
| Cormorant Garamond + Manrope | Newsreader + Atkinson Hyperlegible Next |
| Softbox studio, velvet, turntable | Atlas field, raking key with rim, no turntable |
| Full-bleed photography, cards, custom cursor | Real-time 3D only, margin labels, system cursor |
| Numbered 00–09 markers | "2 of 5" and ticks |
| Stays dark throughout | Ends on a light plate |
