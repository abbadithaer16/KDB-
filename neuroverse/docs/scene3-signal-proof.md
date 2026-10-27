# NEUROVERSE — Scene 3 signal proof: results, risks and Checkpoint 3 approval checklist

Status: 27 Oct 2026. Isolated local proof (`neuroverse/proof-scene3`, branch
`neuroverse-proof-signal`), authorised before Checkpoint 4. **Not Checkpoint 4, not production, not
merged, not deployed.** The Scene 2 Safari proof is untouched.

## 1. Licence verification (done first)

| Candidate | Result |
|---|---|
| Allen Cell Types human neurons (162204, 162180, …) | **Excluded.** The Allen Institute's own terms could not be read (alleninstitute.org and brain-map.org are blocked). Their data originates there, so NeuroMorpho's licence alone is not enough to rely on |
| **DeKock lab neurons (Mohan et al. 2015), contributed directly to NeuroMorpho.Org** | **Chosen: 290955.** NeuroMorpho's terms were read in full today: CC BY 4.0 for "any material found on or downloaded from NeuroMorpho.Org", with three required citations. CC BY 4.0 permits commercial use and adaptation with attribution |
| Still not read | The CC BY 4.0 legal code itself (creativecommons.org blocked) and the original paper (PubMed blocked) |

Handling:
- The SWC file and its derived data are fetched locally and **gitignored**.
- No preview link is published.
- Screenshots go to you privately.
- Full record: `proof-scene3/ASSETS.md`.

## 2. The neuron, and why it suits the shot

NeuroMorpho 290955 is a human layer 2/3 pyramidal neuron from the middle temporal gyrus
(Brodmann area 21).
- Its main axon descends **1,864.82 µm** from the cell body along recorded points.
- That path is almost straight (1.79 mm end to end), with 7 recorded collaterals leaving it.
- It is 1.6× longer than the best Allen candidate.
- Its thicknesses are recorded in 0.045 µm steps (0.14–0.51 µm on the path). Unlike the Allen
  files, these are real measurements.

## 3. What was built

- **Beat 3a:** the whole neuron with Dendrites, Cell body, and "Axon (continues below)".
- **One press:**
  1. The camera moves to a side view of the cell body and trigger zone (1.8 s), and the rest of the
     cell falls into shadow.
  2. The signal fires.
  3. The camera swings round behind it (0.9 s) and follows it down the recorded axon. The axon
     recedes into depth, and passed nodes stay lit as a fading row of violet bands.
  4. The camera rises (2.2 s) to the whole cell, so the true length is visible at once. The
     resting frame labels Trigger zone, Myelin (illustrative), Node of Ranvier, and "End of the
     reconstructed axon".
- **Legend on screen:** "Recorded: the cell's shape and the axon's path (the file stores the cell
  body as a sphere). Illustrative: Slowed down · Illustrative colour · Myelin added for
  illustration (not in the recording) · Fine branches drawn wider than true scale in distant
  views."
- **Interactions:** interrupt, Replay, Back, and a reduced-motion static sequence; phone framings.

## 4. Gate results

| Area | Criterion | Result | Evidence |
|---|---|---|---|
| Licence | Terms read and recorded; citations listed | **Pass, with caveats** (legal code and paper not read) | `ASSETS.md` |
| Geometry | Within 0.5 µm of SWC; nothing beyond the last point; no added branches | **Pass.** Measured max deviation 0.4999 µm; signal path uses all 697 recorded points | Geometry check script |
| Science | Starts at the trigger zone; only moves forward; equal brightness at each node; no claim about why the axon ends | **Pass.** The front position is monotonic by construction; each node uses the same intensity formula; the end caption is neutral | Frame sequence, code |
| Honesty | Tags present while each liberty is on screen | **Pass.** Myelin tag strengthened to "not in the recording"; soma storage stated | Screenshots |
| Cinematic | Tracking reads as travel; the pull-back reveals the full length; the signal is the only moving light; no ambient glow or particles | **Pass for your review** (subjective). Weaknesses below | Screenshots, recording |
| Readability (1080p) | Front ≥ 6 px; tags ≥ 20 px | **Pass.** Halo about 46 px; legend 20 px; labels 26 px | 1920×1080 screenshots |
| Flashing | No more than 3 flashes per second over more than 25% of any 10° field | **Pass (Estimated):** at most 7.5%, sampled at 20 Hz from software-rendered frames | Luminance analysis |
| Interaction | One press, one signal; interrupt within 300 ms; no queueing | **Pass.** Interrupt landed in 172 ms; six rapid presses ended on one resting frame; alternating →/← ended consistently; no console errors | Automated test |
| Mobile | Composition at 390×844 | **Pass in emulation**; your iPhone: **Not run** (needs a preview link; see risk R1) | Phone screenshots |
| Reduced motion | No camera motion; static sequence conveys the order | **Pass** | Screenshot |
| Performance | Draw calls, triangles, payload | **Estimated:** 3 draw calls; 86k triangles desktop, 65k phone; neuron data 58 KB gzip; JS 339 KB gzip. Container ran about 10 fps in software WebGL, which is **not** evidence. Real devices: **Not run** | `renderer.info` |

### Visual weaknesses I found

These are honest, not hidden by effects:
- **Recorded tracing jitter is visible in close tracking.** The traced path zigzags by a few
  micrometres. This is the data; smoothing it would alter the recording, so I kept it.
- **Membranes read as smooth grey tubes up close.** No surface detail or depth of field yet (the
  postprocessing dependency is a Checkpoint 4 decision, T7).
- **The violet signal is deliberately restrained.** It may need more presence on a washed-out
  projector, to be judged on real hardware.
- **The cell body is a sphere** because the standardised file stores it that way. The hold frame
  was widened so it stays a small detail.

## 5. Unresolved risks

| # | Risk | Proposed handling |
|---|---|---|
| R1 | **iPhone test needs a link.** Any preview distributes a CC BY derivative of the neuron | Your choice: (a) a protected Vercel preview with attribution; (b) GitHub Pages like scene 2 (public); (c) no device test until Checkpoint 4 |
| R2 | The original paper is not read: tissue origin, the recorded patient condition ("Meningitis"), why the axon ends | Unblock `ncbi.nlm.nih.gov` / `academic.oup.com` or upload the paper; until then no copy about tissue origin and a neutral end caption (F3.7) |
| R3 | **Hemisphere not recorded.** The storyboard's "left middle temporal gyrus" caption and descent target are too specific | Change to "middle temporal gyrus" and have the scene 2 → 3 descent land on that gyrus, captioned "Region where this neuron was recorded (hemisphere not recorded)" |
| R4 | Myelination of this particular axon is not in the data | Keep the general statement (F3.3) with the "not in the recording" tag |
| R5 | Synapse (3c) not proven | Scene 3 gate at build time; in-house model, no licence risk |
| R6 | Depth of field and bloom not proven; mobile tier unaffected | Checkpoint 4 dependency decision (T7) |
| R7 | Real-device performance unmeasured | Your iPhone, once R1 is decided |
| R8 | Evidence register and storyboard still name Allen candidates | Updated in this commit (`evidence-register.md` note) |

If you judge the cinematic result below the premium bar, alternatives (without lowering the
standard):
1. Add depth of field and a subtle membrane surface detail at Checkpoint 4. A new dependency;
   desktop only.
2. Choose the backup cell 290932 (1.79 mm path with more collaterals), which gives a busier,
   denser chase.
3. Change the chase lens: lower and longer (40° → 28° field of view) for more compression, still on recorded
   geometry.

## 6. Checkpoint 3 final approval checklist

| # | Item | Status | Your decision |
|---|---|---|---|
| 1 | C1, C2, C3, C5, C6, C7, C10, C11 | Approved | — |
| 2 | C12 (anatomical-plane rhyme) | Provisionally approved | Confirm |
| 3 | C13 (two margins, 3.5:1), C14 (exclude unverified claims) | Approved | — |
| 4 | C8 (desktop transparency, mobile cut-away) | Approved, both at premium standard | — |
| 5 | Scene 2 revised direction (landmark trace, hemisphere parting, selection by light) | Approved, subject to visual and anatomical validation | — |
| 6 | C4: neuron = NeuroMorpho 290955 (DeKock), CC BY 4.0 via NeuroMorpho; Allen excluded | Licence read; legal code and paper unread | Approve or ask for more verification |
| 7 | Scene 3 signal proof (this report) | Gate passed except the iPhone and performance items | Accept, or request changes |
| 8 | Caption change for R3 (hemisphere not recorded) | Proposed | Approve |
| 9 | C9 (H.M. line) | Conditional on F4.3 check | — |
| 10 | Preview for iPhone testing (R1) | Not published | Choose a, b or c |
| 11 | BodyParts3D licence: five open items in `licence-obligations.md` §5 | Unresolved, as you instructed | Decide when ready |
| 12 | Fact register: To-check items; expert review | Open | Decide on an expert |
| 13 | Schedule: about 4 Nov | Accepted | — |
| 14 | **Authorisation to begin Checkpoint 4** | Not started | Explicit go / no-go |
