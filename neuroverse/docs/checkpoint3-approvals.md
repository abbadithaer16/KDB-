# NEUROVERSE — Checkpoint 3 decisions and risks for approval (F)

Each item has a recommendation. Approving the storyboard approves the recommendations unless you
say otherwise.

## Creative decisions

| # | Decision | Recommendation | Alternatives | Trade-off |
|---|---|---|---|---|
| C1 | Scene 1 title | **The living fold** | "Folded to fit"; "Layer by layer" | The old working title "The Awakening" was ÉCLAT's opening, so it must go. "Living fold" names the subject (the cortex) and its key fact (folding) |
| C2 | Scene 1 opening | **Contour map seen from above → tilts into a stack → fills into the brain**, then an exploded lift of the top to show grey over white matter | Intact brain only at rest (no exploded view) | The exploded view teaches the grey/white fact visually, but depends on cut-face fidelity (T1) |
| C3 | Scene 3 title | **Electrical, then chemical** | "The neural network" (brief's working title) | "Neural network" now commonly means artificial networks, and it does not say what the scene teaches |
| C4 | Scene 3 neuron | **A human layer 2/3 pyramidal neuron from the left middle temporal gyrus** (Allen data via NeuroMorpho), with the descent landing on that gyrus | A Tamás-lab human neuron (frontal or unspecified neocortex); a rodent neuron with a longer axon | Human and geographically true, but its axon is complete only within the tissue slice; licence pending (T2) |
| C5 | Scene 3 context neurons | **None.** Depth comes from the neuron's own arbour and depth of field | Up to 8 static, dim real reconstructions in 3a only | Your brief asks for no decorative neural networks; a forest reads as spectacle more than teaching |
| C6 | Myelin and nodes | **Procedural myelin on the real axon path, labelled "Myelin shown simplified"** | Unmyelinated, continuous conduction only | The reconstruction has no myelin data; showing saltatory conduction teaches the key idea but needs the label |
| C7 | Scene 4 structure | **Two beats** (memory; then amygdala with memory) with **no drawn connections except the real fornix** | Three beats (memory, emotion, both); illustrative pathway curves | Drawn curves would invent anatomy; highlighting together says "network" honestly |
| C8 | Scene 4 cortex | **Translucent shell on desktop; cut-away window on phones** (and on desktop if artefacts appear) | Cut-away everywhere | The shell is the approved concept; the window is safer and atlas-like |
| C9 | H.M. line in scene 4 | **Include** (one sentence, after F4.3 is fully checked) | Omit | Strong lecture hook from a standard textbook case |
| C10 | Scene 2 section | **A beat inside step 2** (deep link `#architecture-section`), not its own step | Separate step (6 steps) | Answers the open question from the proof review; keeps five steps |
| C11 | Previous navigation | **450 ms crossfade to the previous resting frame**, never reversed choreography | Play moves backwards | Reversed descents and sweeps read wrongly; presenters going back want speed |
| C12 | Anatomical-plane rhyme | **Horizontal (1), midline (2), front-to-back (5)** | Free choice per scene | Gives the lecture a quiet structure an educator will recognise |
| C13 | Label layout and dimming | **Keep two margins and 3.5:1** from the proof | One margin; lighter dimming | These were open questions in `scene2-visual-review.md` |
| C14 | Fact-register exclusions | **No neuron count, energy share, speeds or sizes** until a readable source exists | Use common figures from memory | CLAUDE.md forbids unverified facts in shipped copy |

## Technical risks

| # | Risk | Likelihood / impact | Mitigation | Needs from you |
|---|---|---|---|---|
| T1 | Cut faces may not show a credible grey ribbon over white matter: BodyParts3D gyri may be solid volumes, not a 2.5 mm ribbon | Medium / high for scene 1's exploded view and scene 2's cut | Inspect cross-sections at the Checkpoint 4 asset gate; if not credible, use two-tone caps labelled "Simplified cut surface" and drop the "2.5 mm" juxtaposition | Accept the fallback |
| T2 | Neuron licence: Allen Institute terms not read | Medium / blocks scene 3 asset | Read the terms at Checkpoint 4; if commercial demo use is not clear, choose a Tamás or Wittner lab neuron and read its terms | Approve the choice once verified |
| T3 | BodyParts3D licence conflict unresolved | Known / affects distribution of model and derivatives | Dual credit; offer adapted files under BY-SA 2.1 JP until DBCLS replies | The five items in `licence-obligations.md` §5 (still open) |
| T4 | **Schedule.** About 5.5–6 working days remain (Checkpoint 4 with two asset gates about 1 day; scenes 1–5 about 3.5 days; shell, navigation and fallback about 0.75 day; QA about 0.75 day), plus gate review time. Fri 30 Oct leaves about 3.5 days | High | See options below | **Choose an option** |
| T5 | Scene 4 transparency on iPhone (sorting, overdraw) | Medium / medium | Cut-away window tier (C8) | — |
| T6 | Performance unmeasured on every device | Certain until measured | Per-scene measurement plan in `adaptation-plan.md` §7 | Your iPhone model and iOS version; access to a projector and a clicker if possible |
| T7 | New dependency for postprocessing (outline, bloom, depth of field, edge pass) | Low / medium | Listed with version, size and licence at Checkpoint 4; could be written by hand if rejected | Approve at Checkpoint 4 |
| T8 | Sources: PubMed, NCBI, NINDS blocked; no Purves or Kandel copy | Known / four claims blocked | Copy limited to OpenStax-supported lines; blocked claims left out | Allow `ncbi.nlm.nih.gov`, `europepmc.org` / `ebi.ac.uk`, or upload textbook pages; decide on expert review |
| T9 | Scene 3 cross-exposure renders two scenes for 0.8 s | Low / low | Measure on iPhone at the scene gate; shorten if needed | — |
| T10 | Faceting at Explore's closest zoom (99% reduced source) | Medium / medium | Minimum zoom 0.6×; asset gate at that distance; no effects used to hide it | — |

## Schedule options (T4)

| Option | What ships | When |
|---|---|---|
| **A (recommended)** | All five scenes at the storyboarded quality, every gate passed, QA report | About Wed 4 Nov, if Checkpoint 4 is approved on Wed 28 Oct |
| B | Fri 30 Oct with reduced scope: scenes 2 and 3 at full quality; scenes 1 and 5 share a simplified sweep and line work; scene 4 as cut-away window only; QA limited and labelled | Fri 30 Oct |
| C | Fri 30 Oct preview of approved scenes on Vercel (not production), full release later as in A | Preview Fri, final about Wed 4 Nov |

## Also confirm

1. Which scenes, if any, a subject-matter expert should review.
2. That nothing in this storyboard moves into Checkpoint 4 until you approve it. Not started,
   by design.
