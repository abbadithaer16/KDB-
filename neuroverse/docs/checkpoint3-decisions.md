# NEUROVERSE — Checkpoint 3: creative decisions C1–C14 and visual-quality review

Status: for review, 27 Oct 2026. Checkpoint 3 is **not approved yet**. Checkpoint 4 has not
started. The Scene 2 proof (`neuroverse-proof`, `neuroverse-preview`) is unchanged.

## Your preliminary decisions (recorded, 27 Oct)

1. Target for the complete experience: about **Wed 4 Nov**, subject to realistic implementation
   and QA (schedule option A).
2. The neuron stays **conditional** on verifying all original source licensing terms.
3. A labelled simplified cut surface is allowed **only if** a scientifically credible grey/white
   matter representation proves technically infeasible.
4. The BodyParts3D licence conflict stays **unresolved** until properly reviewed.
5. Unverified scientific claims stay **excluded**.
6. The working Safari proof is **not modified or merged** during this review.

---

## Creative decisions

Each decision gives the recommended option first, then the alternatives, then what each choice
leads to.

### C1 — Scene 1 title

| Option | Consequences |
|---|---|
| **The living fold** (recommended) | Names the subject (the cortex) and its key fact (folding); distinct from ÉCLAT's "The Awakening". "Living" is carried by realistic tissue and the copy, never by a visual effect such as pulsing. Slightly poetic; the statement underneath does the factual work |
| Folded to fit | The most literal: the title *is* fact F1.1. Clear on a projector, but flatter as an opening line |
| Layer by layer | Matches the build sequence, but students may read it as the cortex's six cellular layers, which the scene does not show. **Risk of a misleading reading**; not recommended |

### C2 — Scene 1 opening and resting frame

| Option | Consequences |
|---|---|
| **Contour map → stack → tissue fill, then an exploded lift of the top** to show grey over white matter (recommended) | The strongest opening image, and the lift teaches the scene's fact visually. Depends on T1: the lift is only worth having if the cut face is credible. Under your decision 3, if a credible ribbon is infeasible the lift falls back to labelled simplified caps |
| Same build, intact brain at rest (no lift) | Safest and cheapest; independent of T1. The grey/white fact then lives in text only, and scene 1 ends on a beautiful object rather than an explanation |
| Same build, ending on a horizontal section held open in place (top hidden, no lift) | Teaches the same fact with less movement; a little cheaper. Visually close to scene 2's cut, which weakens the "different verb per scene" rhythm |

### C3 — Scene 3 title

| Option | Consequences |
|---|---|
| **Electrical, then chemical** (recommended) | States the learning objective; the audience knows what to watch for before the signal fires |
| The neural network (brief's working title) | Familiar, but now widely read as artificial neural networks, and it promises a network when the scene shows one neuron and one synapse |
| One signal | Evocative and short, but does not say what changes; the distinction you asked for lives only in the statement |

### C4 — Scene 3 neuron (conditional on licence verification, your decision 2)

| Option | Consequences |
|---|---|
| **Human layer 2/3 pyramidal neuron, left middle temporal gyrus** (Allen Cell Types data via NeuroMorpho, IDs 162118 / 162163 / 162204 / 162180 / 162148) (recommended) | Human, and geographically true: the descent lands on the gyrus the cell came from, the scene's most credible touch. The axon is complete only within the tissue slice, so the tracking shot follows a few hundred micrometres of real axon. The synapse beat shows a *typical* synapse, not this cell's actual one, and is labelled so. **Blocked until the Allen Institute's terms are read** |
| Tamás-lab human neuron (107146, layer 2/3 neocortex, region unspecified) | Human and complete within the slice, but the region is not given, so the descent becomes "the cortex" generally and loses the geographic link. Its own record and paper terms must be read |
| Wittner-lab human neuron (109431, left temporal cortex, layer 2) | Keeps the left temporal location; the reconstruction is rated "Moderate", so expect visible gaps on close camera passes |
| A rodent neuron with a long, more complete axon | A longer, more spectacular tracking shot, but the caption must say "mouse" or "rat" in a lecture about the human brain. Breaks the scene 2 → 3 geography |

### C5 — Context neurons in scene 3

| Option | Consequences |
|---|---|
| **None** (recommended) | Keeps the frame honest and focused: one cell, one signal. Fewer draw calls, and no extra licences. Risk: 3a could feel sparse. Mitigated by the neuron's own depth, depth of field, the raking light, and the descent that precedes it |
| Up to 8 static, dim real reconstructions in 3a only | Conveys density and gives parallax during the descent. Costs about 8 draw calls and 8 more licence and citation checks. Close to the "decorative neural network" you asked to avoid, even when the data is real |

### C6 — Myelin and nodes

| Option | Consequences |
|---|---|
| **Procedural myelin on the real axon path, labelled "Myelin shown simplified"** (recommended) | Teaches saltatory conduction (fact F3.3), the key undergraduate idea, and gives the signal its rhythm: renewal at each node. Node spacing and sheath length are illustrative, and the label says so |
| Unmyelinated, continuous conduction only | No added simplification, but the signal becomes a smooth glow along a tube, which is weaker visually and misses a core concept |
| Both, side by side or in sequence | The most complete teaching, but it adds a beat and splits attention, and the "single purposeful signal event" becomes two |

### C7 — Scene 4 structure

| Option | Consequences |
|---|---|
| **Two beats (memory; then amygdala with memory), with only the real fornix drawn** (recommended) | Shows networks honestly: structures highlight together, no invented paths. Fits the facts we have read: amygdala-specific roles are not verified, so it has no beat of its own |
| Three beats (memory, emotion, both) | A clearer textbook structure, but an emotion-only beat implies a separate system and needs the unverified amygdala copy (F4.8). Longer |
| Illustrative pathway curves between structures | Visually richer and closer to the reference image, but it invents anatomy; the "Simplified" label would not undo the impression |

### C8 — Scene 4 cortex treatment

| Option | Consequences |
|---|---|
| **Translucent shell on desktop; cut-away window on phones**, and on desktop too if artefacts appear (recommended) | Keeps the approved concept where it renders well and gives iPhone a safe version. The two tiers look different, so screenshots and the fallback need both |
| Cut-away window everywhere | Consistent, cheaper, very atlas-like, no sorting artefacts. Loses the "seeing through to a network" idea, which is scene 4's verb |
| Translucent shell everywhere | Consistent concept, but carries the highest iPhone risk (overdraw, sorting) of the whole project |

### C9 — The H.M. line in scene 4

| Option | Consequences |
|---|---|
| **Include one sentence, only after F4.3 is fully checked** (recommended) | A real case gives the lecture a human anchor, and it is the standard textbook example. Written factually and respectfully (his name is public in the textbook). Adds one line to a medium-density scene |
| Omit | A leaner scene; the memory point rests on the statement alone |

### C10 — Scene 2 midline section

| Option | Consequences |
|---|---|
| **A beat inside step 2** (deep link `#architecture-section`) (recommended) | Keeps the five steps agreed at Checkpoint 1; the counter reads "2 of 5" across both beats. Presenters reach the section with one more press |
| A separate step (six steps) | Clearer navigation, but it changes the approved brief (five steps), the counter and the progress ticks. It would need a Checkpoint 1 change |

### C11 — Going back (previous)

| Option | Consequences |
|---|---|
| **A 450 ms crossfade to the previous resting frame** (recommended) | Fast and predictable for a presenter recovering a slide. Going backwards never shows the choreography |
| Play every move in reverse | Cinematic both ways, but reversed descents and sweeps read wrongly (scale and tissue "un-drawing"), and going back takes up to 7.6 s |
| Mixed: reverse short orbits (T2, T3, T8), crossfade the rest | More polished for nearby beats; two behaviours to learn and test. Viable if you prefer it |

### C12 — Anatomical-plane rhyme

| Option | Consequences |
|---|---|
| **Horizontal in scene 1, midline in scene 2, front-to-back in scene 5** (recommended) | A quiet structure an educator recognises: the three standard planes, one per cut. It fixes scene 5's sweep direction (left to right on screen) |
| A free choice per scene | More freedom for each scene, but the cuts become unrelated effects rather than a system |

### C13 — Label layout and selection dimming

| Option | Consequences |
|---|---|
| **Keep two margins and 3.5:1 dimming** from the proof (recommended) | Proven on desktop and iPhone: no leader line crosses tissue, and the selection reads on projectors and for low-vision viewers |
| One margin (all labels on one side) | Simpler reading order, but leader lines for structures on the far side must cross the brain |
| Lighter dimming (about 2.5:1) | More context visible around the selection; the selection is weaker on washed-out projectors |

### C14 — Fact-register exclusions

| Option | Consequences |
|---|---|
| **Exclude neuron counts, energy share, speeds and sizes until a readable source exists** (recommended; matches your decision 5) | Copy stays fully defensible. The opening loses a "big number" hook; the visuals carry the awe instead |
| Use common figures from memory, marked unverified | Not allowed by CLAUDE.md for shipped copy |
| Unblock sources (NCBI, Europe PMC) or upload textbook pages, then add the figures that check out | The best route if you want the numbers. Each one goes through the fact register first |

---

## Visual-quality review

### Where the strongest moments are

Ranked by intended impact.

1. **The signal (scene 3, T5).** The camera travels low beside a real human axon as a single
   violet front races ahead and is renewed at each node, lighting the membrane it passes. It is
   the only autonomous light in the whole presentation, so it lands with full force. This is the
   showpiece.
2. **The drawing (scene 5, T9).** The slowest move of the lecture: a front-to-back cut crosses
   the brain and leaves a precise ink drawing behind it while the room brightens from charcoal to
   plate. It turns the whole presentation's look into its conclusion.
3. **The map becomes a brain (scene 1, T1).** A flat contour map, seen from above, tilts and
   becomes a stack in depth, then tissue. It is an opening that makes the audience lean in,
   because for two seconds they cannot tell what they are looking at.
4. **The descent (scene 2 → 3, T4).** A small violet ring marks the left middle temporal gyrus.
   The camera falls toward it, and the cross-exposure cuts to the very cell recorded there. Scale
   changes honestly, and geography is preserved.
5. **The release (scene 3, T6).** Amber appears for the first and only time, in a single burst
   across the cleft. The colour itself marks the change from electrical to chemical.
6. **The network reveal (scene 4, T7).** The cortex turns to glass, and structures light in order
   along the real fornix arch.

### How it avoids becoming a static academic presentation

- **Every step has a move, and every move means something.** There are 11 resting beats and
  about 47 s of choreography. No two adjacent scenes reveal the same way: construction, cut,
  descent, translucency, sweep.
- **Rhythm, not motion everywhere.** Stillness while the presenter talks, then decisive motion.
  The contrast makes the moves feel directed, the way an edit does. Constant drift would make
  them feel like a screensaver.
- **The presenter performs it.** The signal and the release fire on the presenter's press and can
  be replayed. The room watches cause and effect.
- **The audience can touch it.** Selection in every brain scene, Explore Mode in scenes 2, 3a and
  4, the cut-depth slider, and the scene 4 cortex control.
- **Composition, not centring.** Off-centre subjects, a changing lens per scene (22° to 40°),
  raking light and real depth (cut faces, an arbour in depth, a translucent shell). Each resting
  frame is composed as a plate, not a slide.
- **An exposure arc with an ending.** Dark scenes build to the one light scene, so the lecture
  feels like it arrives somewhere.

### Where it could still fall flat, and the safeguard

| Risk | Safeguard |
|---|---|
| Scene 2's resting frames are the most textbook-like | Production tissue, a raking key, label draw-in and clean selection; judged at its scene gate against the proof, not against a slide |
| Scene 3a could feel empty without context neurons (C5) | Depth of field and composition in depth; if the gate review finds it sparse, revisit C5 with you rather than adding effects |
| Scene 4's glass cortex can look like a stock "holographic brain" | Low opacity, an edge rim only, no glow, solid deep structures; the cut-away window if it reads as a cliché |
| Scene 5's line work could look thin on a projector | A line-weight hierarchy (silhouette heavier than contours and hidden lines), checked at 1080p |
| Faceting at close range | Teaching distances and Explore limits are tested at the asset gate. Geometry flaws are not hidden with effects |

**A rejected idea:** a slow camera drift at rest, to make resting frames feel alive. I rejected it
because it would make text harder to read and blur the meaning of "the camera moves only when
the idea changes".
