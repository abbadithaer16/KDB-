# NEUROVERSE — Asset and scientific-evidence dependency register (Checkpoint 3, D)

Status: for review. This register records what each scene depends on and what is still
unresolved. It is not legal advice. Nothing here is purchased or committed to; no licence
question is treated as settled.

## 1. Assets by scene

**Update 27 Oct (Scene 3 proof):**
- The Allen Cell Types candidates are excluded: the Allen Institute's own terms could not be read
  (sites blocked).
- The proof uses **NeuroMorpho.Org 290955** (DeKock lab, Mohan et al. 2015, human middle temporal
  gyrus, layer 2/3), contributed directly to NeuroMorpho.Org under its CC BY 4.0 terms (read in
  full on 27 Oct).
- The hemisphere is not recorded.
- See `scene3-signal-proof.md` and `proof-scene3/ASSETS.md`.

| Asset | Scenes | Source | Licence position (as read) | Verification still required | Approval needed |
|---|---|---|---|---|---|
| Brain region meshes (lobes, cerebellum, brainstem, white matter, callosum, thalamus, fornix, limbic) | 1, 2, 4, 5 | BodyParts3D release 4.0, `isa_BP3D_4.0_obj_99.zip`, SHA-256 `40665852…cd409e` | **Unresolved conflict, preserved:** licence page and README (2025-02-27) say **CC BY 4.0**; the text embedded in all 2,234 OBJ files says **CC BY-SA 2.1 Japan**. Both notices are kept on screen and in `ATTRIBUTION.md`. Commercial use and modification are allowed under either | DBCLS clarification (draft in `dbcls-clarification-draft.md`, not sent); CC legal code check (creativecommons.org blocked); anatomical atlas review at the asset gate | The five items in `licence-obligations.md` §5 are still open |
| Deep structures (hippocampus, amygdala, parahippocampal gyrus, cingulate gyrus, hypothalamus, prefrontal gyri) | 4 | Same release (present per `asset-verification.md`) | Same as above | Atlas check of position, shape, orientation; duplicate-mesh check (hypothalamus appears twice) | Same |
| Horizontal contours (about 48) | 1, 5 | **Derived** by us from the meshes above | **Adaptation of BodyParts3D:** same dual credit; offered under CC BY-SA 2.1 JP until clarified, exactly like the GLB | Accuracy test against CPU cross-sections | Covered by the GLB decision |
| SVG drawings and rendered stills for the fallback | All | **Derived** from the model by our build | Same as contours (they depict the adapted model) | — | Covered by the GLB decision |
| Lobe boundary lines | 2 | Derived from region adjacency in the meshes | Same as contours | Boundaries match the atlas landmarks (central and lateral sulci) | Covered |
| Human neuron reconstruction | 3 | Candidates: Allen Cell Types human layer 2/3 pyramidal neurons from the **left middle temporal gyrus**, distributed by NeuroMorpho.Org with "Dendrites & Axon Complete": IDs **162118, 162163, 162204, 162180, 162148** (reference DOI 10.1101/2020.03.31.018820). Alternatives: 107146 (Tamás lab, eLife, 10.7554/eLife.18167), 109431 (Wittner lab, left temporal, "Moderate") | NeuroMorpho.Org terms (read 26 Oct): **CC BY 4.0** with three citations (original paper, "NeuroMorpho.Org (RRID:SCR_002145)", Tecuatl, Ljungquist & Ascoli 2024). **Allen Institute terms of use for its data: not read yet.** The data originates there and may carry its own conditions | Read the Allen Institute terms and citation policy for Cell Types data, including commercial and derivative use; open each candidate record and its paper; check "complete" means complete **within the slice** (the long-range axon is cut) | **Yes**: choice of neuron and confirmation that its terms allow use in a commercial demo |
| Myelin sheaths and nodes | 3 | Procedural, in-house, on the real axon path | Ours | Labelled "Myelin shown simplified" | No |
| Synapse (terminal, vesicles, cleft, receptors, transmitter) | 3 | Procedural, in-house | Ours | Structure order checked against OS §12.5; labelled "Simplified", "Not to scale" | No |
| Surface-detail normal texture | 2, 4 | Procedural, in-house | Ours | — | No |
| Environment light | 1, 2, 4 | Built in-house with Lightformers (as in the proof) | Ours | — | No |
| Fonts | All | Newsreader, Atkinson Hyperlegible Next, `@fontsource-variable` 5.3.0 | SIL OFL 1.1 (verified on npm earlier) | — | No |
| Postprocessing library (outline mask, selective bloom, depth of field, edge pass) | 2, 3, 5 | `@react-three/postprocessing` / `postprocessing` (candidate) | To be read at Checkpoint 4 | Version, size, licence, last release; compatibility with three r186 / R3F 9 | **Yes**, at Checkpoint 4 (new dependency) |

Excluded:
- Tel Aviv University models (reported CC BY-NC-ND).
- Any purchased model.
- Any tractography or fibre data.
- Any background "neuron forest" assets.

## 2. Scientific evidence by scene

| Scene | Claims (see `fact-register.md`) | Sources read | Still needed |
|---|---|---|---|
| 1 | F1.1, F1.2 | OpenStax §12.1, §13.2, §16.2 | — (re-check before QA) |
| 2 | F2.1–F2.10 | OpenStax §13.2 | Cingulate gyrus (F2.10); cerebellum movement wording (F2.6) |
| 3 | F3.1–F3.6 | OpenStax §12.2, §12.4, §12.5; NeuroMorpho terms | Chosen neuron record and paper (F3.6) |
| 4 | F4.1–F4.8 | OpenStax §13.2, §16.2 | Atlas for amygdala position (F4.4); a textbook for amygdala roles (F4.8) and network wording (F4.5); full H.M. passage (F4.3) |
| 5 | F5.1, F5.2 | OpenStax §13.2 | A textbook source for "open question" (F5.2) |

Anatomical review references for the asset gate:
- BodyParts3D's own release notes list Mai, Paxinos & Voss, *Atlas of the Human Brain*,
  Nieuwenhuys et al. and *Gray's Anatomy*.
- None of these is accessible here. We need either access to an atlas (or uploaded plates) or
  an expert reviewer.

## 3. Blocked or unavailable

| Resource | Status 27 Oct | Effect |
|---|---|---|
| PubMed | Robot check | Peer-reviewed claims cannot be verified |
| Europe PMC, NCBI Bookshelf, NINDS, Wikipedia | Blocked by the network policy | Same |
| creativecommons.org | Blocked | Legal code not read word for word |
| Allen Institute site | Not yet tried | Neuron licence (T2) |
| Purves, Kandel (textbooks) | No copy | F2.10, F4.5, F4.8, F5.2 |
