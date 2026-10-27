# Scene 3 proof — asset record

## Neuron: NeuroMorpho.Org 290955

| Field | Value (read 27 Oct 2026 from the NeuroMorpho.Org API record) |
|---|---|
| Name | 790_Mohan_etal_2015 |
| Archive | DeKock (contributed by the lab; deposited 2024-11-18, uploaded 2024-12-04) |
| Species, age | Human, adult (record age range 19–45 years) |
| Region | Neocortex, temporal, middle temporal gyrus, Brodmann area 21, layer 2/3 |
| Cell type | Pyramidal, principal cell |
| Method | Biocytin, in vitro, coronal slices 350 µm, Neurolucida, 100× oil |
| Domain, integrity | Dendrites, soma, axon; "Dendrites Moderate, Axon Incomplete" |
| Experiment condition (record) | "Meningitis" (the patients' condition as recorded; not interpreted here) |
| Hemisphere | Not recorded |
| Original paper | Mohan et al. 2015, *Cerebral Cortex*, doi:10.1093/cercor/bhv188 (PMID 26318661). **Not read** (PubMed blocked from this environment) |
| File | `dekock/CNG version/790_Mohan_etal_2015.CNG.swc`, SHA-256 `9b1aa8278c65868e715dc0de7ed0328ac6fe3286f3675e13e9d29aa539398569` |
| Access | Direct file URL, permitted by the terms for programmatic access; identified user agent |

## Licence

- **NeuroMorpho.Org terms of use** (site version 8.6.131, released 2026-10-23), read in full on
  27 Oct 2026: "NeuroMorpho.Org is licensed under a Creative Commons Attribution 4.0
  International License."
- When using "any material found on or downloaded from NeuroMorpho.Org", cite:
  1. the original paper;
  2. "NeuroMorpho.Org (RRID:SCR_002145)";
  3. Tecuatl, Ljungquist & Ascoli (2024), doi:10.1096/fba.2024-00048.
- Disclaimer: use at the user's own risk.
- CC BY 4.0 permits commercial use and adaptation with attribution, and an indication of changes.
- **Not read:** the CC BY 4.0 legal code itself (creativecommons.org is blocked); the original
  paper.
- Why this cell and not the Allen Institute candidates: those cells originate from the Allen
  Institute, whose own terms could not be read (alleninstitute.org and brain-map.org are blocked).
  This cell was contributed directly to NeuroMorpho.Org by the lab, so NeuroMorpho's terms are
  the operative licence.

## Changes made (for the attribution's "indicate changes")

- Rotated so the apical dendrite points up; soma moved to the origin.
- Sections simplified within 0.5 µm; signal path kept at every recorded point.
- Drawn as tubes, with a minimum on-screen width for fine branches in distant views.
- Myelin sheaths and node gaps added for illustration on the signal path (not in the recording).
- The cell body is drawn as the sphere stored in the standardised file.

## Distribution status

Local proof only. The SWC file and the derived `public/data/neuron.json` are gitignored and not
published. Screenshots were shared privately with the client for review. A public preview
needs the client's approval.

## Asset quality gate (for Checkpoint 4)

| Check | Status |
|---|---|
| Geometry fidelity | Measured: max deviation 0.4999 µm; path exact |
| Radii | Recorded in steps of 0.045 µm (axon 0.14–0.51 µm on the path) |
| Orientation | Apical dendrite up; pia direction assumed from the apical dendrite |
| Scientific accuracy | Morphology is the recorded data. The paper is not read; the patient condition and tissue origin are not interpreted |
| Licence | CC BY 4.0 via NeuroMorpho.Org (read); legal code and paper not read |
| Size | 162 KB JSON (58 KB gzip) after simplification |
