# NEUROVERSE — BodyParts3D licence obligations and compliance review

Status: **open, not resolved.** Prepared 26 Oct 2026. Not legal advice.

## 1. The conflict (from `asset-verification.md`)

| Statement | Where | Licence |
|---|---|---|
| Licensor's licence page, updated 2025-02-27 | dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html | CC BY 4.0 |
| Release 4.0 README, dated 2025-02-27 | …/data/bodyparts3d/LATEST/README_e.html | CC BY 4.0 |
| Header of every one of the 2,234 OBJ files in the 4.0 archive (2013) | inside `isa_BP3D_4.0_obj_99.zip` | CC BY-SA 2.1 Japan |
| Release 3.0 README | …/data/bodyparts3d/20110915/README_e.html | CC BY-SA 2.1 Japan |

Until the licensor clarifies, NEUROVERSE treats the 4.0 data as subject to **both** licences and
meets the stricter set of obligations.

## 2. Obligations

The licence legal texts could not be read from this environment (`creativecommons.org` is not on
the allowed domains). The lists below summarise the obligations of these licence families and
must be checked against the official legal code before production; for 2.1 Japan, the Japanese
legal code is the authoritative text.

### CC BY 4.0 (when sharing the data or an adaptation)

1. Give the attribution the licensor requests — here, the credit line:
   "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0
   International".
2. Retain any copyright notice, licence notice and disclaimer notice supplied with the data.
3. Provide a link (URI) to the source where reasonably practicable.
4. State that the material was modified, and keep any earlier modification notes.
5. State the licence and provide its text or a link to it.
6. Do not apply extra terms or technical measures (DRM) that stop recipients exercising the
   licence. Open compression formats such as meshopt are not such measures.
7. Our own additions can be under any terms we choose.

### CC BY-SA 2.1 Japan (if the file headers govern)

1. Keep the copyright notices; credit the licensor as requested — here:
   "BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution-Share
   Alike 2.1 Japan".
2. Give the source URI where reasonably practicable, and credit the use in any adaptation
   (for example "derived from BodyParts3D").
3. **Share-alike:** an adaptation (our modified model files) may be distributed only under this
   licence, a later version with the same elements, or a compatible licence, with a copy or URI
   of the licence.
4. No extra terms or technical measures restricting recipients.

### What is and is not an adaptation here

| Item | Status |
|---|---|
| `brain-s2.glb` (merged, welded, quantised, compressed geometry with computed normals and cavity values) | Adaptation of the data: share-alike would apply to it |
| `pipeline/anchors.json` (points derived from the geometry) | Derived data: treat as an adaptation |
| Application code (React, shaders, layout) | Our own work; uses the data but is not an adaptation of it under the usual reading. Should be confirmed |
| Screenshots and recordings of the model | Adaptations of the data in image form: carry the credit |

## 3. Compliance review of the public GitHub repository

`abbadithaer16/KDB-` is **public** (verified through the GitHub API). Branch `neuroverse-proof`
redistributes adapted model data:

| Commit | File | Size |
|---|---|---|
| `1217358`, `224a1df` | `neuroverse/proof-scene2/public/models/brain-s2.glb` (unquantised) | 11.0 MB |
| this round | same path, quantised and meshopt-compressed | 2.8 MB |
| `1217358` onwards | `neuroverse/proof-scene2/pipeline/anchors.json` | small |

The original OBJ files are not in the repository.

| Requirement | Before this round | Now |
|---|---|---|
| Credit line (BY 4.0 wording) | In README and inside the GLB (`asset.copyright`) | Kept |
| Credit line (BY-SA 2.1 JP wording) | Missing | Added (`public/models/ATTRIBUTION.md`, README, app credit) |
| Statement of modification | Present | Kept, with the list of changes |
| Source link | Missing | Added |
| Licence names and links | Names only; no links | Links added |
| Share-alike offer for the GLB | Stated in README | Kept, and stated next to the file |
| No restrictive technical measures | Met | Met |

Assessment: in substance the earlier commits identified the source, the licensor and the
modifications, but they lacked licence and source links and the BY-SA credit wording. The gaps
are corrected going forward. The earlier commits remain in public history; removing them would
mean rewriting public history, which needs your approval and is not recommended for a gap that
has now been fixed.

Another consequence of a public repository: your existing Vercel project for ÉCLAT
(homepage `eclatjewerly.vercel.app`) may build preview deployments for every pushed branch,
depending on its settings. Those would be ÉCLAT builds, but worth checking.

## 4. Clarification from the publisher

Contact on the official licence page: **bodyparts@dbcls.rois.ac.jp** (shown as an image on
the page), and the NBDC contact form at https://form2.jst.go.jp/s/contact_nbdc. A draft message
is in `dbcls-clarification-draft.md`. It must be sent from your address; I cannot send email
from this environment.

## 5. Decisions that need your approval

1. **Keep hosting the adapted model in this public repository**, with the corrected notices
   (recommended), or move proof assets out of the public repository.
2. **Dual-licence the model files**: offer `brain-s2.glb` under CC BY-SA 2.1 Japan as well as
   crediting CC BY 4.0, until DBCLS replies (recommended). The application code stays ours.
3. **Send the clarification request** to DBCLS (draft provided).
4. Whether to rewrite public history to remove the earlier 11 MB model commit (not recommended).
5. Allow `creativecommons.org` in the environment so the legal code can be checked word for word.
