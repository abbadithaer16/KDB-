# NEUROVERSE — Asset verification

Checked on 26 Oct 2026 (UTC) from the original sources, after network access was enabled.
This file records what the sources say. It is not legal advice.

## BodyParts3D (Database Center for Life Science, DBCLS)

### Sources read

| Source | URL | What it says |
|---|---|---|
| Official licence page (last updated 2025-02-27) | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html | "The license for this database is specified in the Creative Commons Attribution 4.0 International." Credit line: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International" |
| Official download page | https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html | Offers only release 4.0: `isa_BP3D_4.0_obj_99.zip` (136 MB) and `partof_BP3D_4.0_obj_99.zip` (62 MB), 99% polygon reduction |
| Release 4.0 README (`LATEST/README_e.html`, dated 2025-02-27) | https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/README_e.html | Same CC BY 4.0 wording and credit line |
| Release 4.0 notes (`release_4.0_e.html`) | https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/release_4.0_e.html | Release 4.0, 2013-05-16. Lists anatomical references (Nieuwenhuys et al.; Mai, Paxinos & Voss *Atlas of the Human Brain*; *Gray's Anatomy* 40th ed.; Prometheus; SPL-PNL Brain Atlas; Talairach). Warns: "The data may still contain many ERRORS to be used as CANONICAL MODEL" |
| Release 3.0 README (`20110915/README_e.html`) | https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html | **CC BY-SA 2.1 Japan**, credit line "BodyParts3D, Copyright© The Database Center for Life Science licensed by CC Attribution-Share Alike 2.1 Japan". Also offers `BodyParts3D_3.0_obj_95.zip` (522 MB) |
| Licence text inside every 4.0 OBJ file (all 2,234 files) | inside `isa_BP3D_4.0_obj_99.zip` | **CC BY-SA 2.1 Japan**, with the BY-SA credit line, pointing to the licence page above |

Downloaded file: `isa_BP3D_4.0_obj_99.zip`, 142,903,898 bytes,
SHA-256 `40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e`.

### Licence finding

- **Release 4.0:** the licensor's current statements (licence page and README, both 2025) say
  **CC BY 4.0**. The text embedded in the 2013 mesh files says **CC BY-SA 2.1 Japan**. The
  sources conflict.
- **Release 3.0:** its own README says **CC BY-SA 2.1 Japan**. Nothing states it was relicensed.
- **Commercial use is permitted under either licence.** Both CC BY 4.0 and CC BY-SA 2.1 JP allow
  commercial use and modification with attribution. The unresolved question is only whether
  modified model files must be shared under the same licence (share-alike).

### Recommended handling

1. Use **release 4.0** (the licensor's current CC BY 4.0 statement applies to it, and its
   anatomy is more complete; see below).
2. Until DBCLS confirms in writing, treat the shipped GLB files conservatively: give both credit
   lines, and be prepared to offer the optimised GLB files under CC BY-SA 2.1 JP. Doing both
   satisfies either reading. The application code is a separate work and is not affected.
3. Ask DBCLS to confirm that CC BY 4.0 supersedes the licence text in the 4.0 files (contact
   details on the licence page).
4. Internal proofs are not distribution, so no licence obligation is triggered by them. A
   public preview or deployment is distribution and needs the credits in place.

Decision needed from the client before production: accept the conservative handling in (2), or
wait for DBCLS confirmation.

### Geometry findings (official release 4.0, IS-A set, 99% reduction)

Inspected offline with my own renders (not WebGL).

| Check | Result |
|---|---|
| Brain structures available | 74 brain-related meshes: all lateral gyri including **inferior frontal gyrus**, occipital lobes, insula, cingulate and parahippocampal gyri, hippocampus, amygdala, fornix, corpus callosum, thalamus, caudate, putamen, globus pallidus, ventricles, hypothalamus, cerebellum, pons, medulla, midbrain, white matter |
| Lobe grouping | Gyri group cleanly into frontal, parietal, temporal and occipital lobes; lateral surface complete, insula correctly hidden |
| Detail | About 416k triangles for all brain meshes; cortex about 112k. Same anatomy as 3.0 at lower density: faceted at close range, credible at teaching distance with smoothed normals |
| Closed surfaces | All checked meshes are closed (0 open edges), so cut surfaces can be capped |
| Orientation | Millimetres; Z up (superior); patient left is +X |
| Known issues | Faceting at close range; some structures appear in two files (cerebellum, pons, midbrain, medulla, hypothalamus) — to be checked for duplicates before merging |
| Comparison with 3.0 | 3.0 (95%) is smoother, but lacks the inferior frontal gyrus mesh, and its own README is BY-SA |

Anatomical review against an atlas is still required for the asset quality gate (Checkpoint 4).

## NeuroMorpho.Org

| Source | URL | What it says |
|---|---|---|
| Terms of use (site version 8.6.131, released 2026-10-23) | https://neuromorpho.org/useterm.jsp | "NeuroMorpho.Org is licensed under a Creative Commons Attribution 4.0 International License." Users must cite (1) the original paper(s) for the reconstruction, (2) "NeuroMorpho.Org (RRID:SCR_002145)", and (3) Tecuatl C, Ljungquist B, Ascoli GA (2024), *FASEB Bioadv.* 6(7):207-221, doi:10.1096/fba.2024-00048. Scripted access must use the API or direct file URLs |

The specific neuron is not chosen yet; its record (species, region, axon completeness, original
paper) is checked when it is selected.

## Not used

- Tel Aviv University models: page still blocked; the reported CC BY-NC-ND licence would exclude
  commercial use.
- The GitHub mirror of BodyParts3D 3.0: used only for an earlier geometry inspection, never as
  licence evidence or as a source for shipped assets.
