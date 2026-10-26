# NEUROVERSE — Scene 2 real-time proof

An isolated, approved exception to the "no code before Checkpoint 4" rule. It tests whether
the verified anatomical source can carry Scene 2 in real-time WebGL. **Not production code, not
deployed, not to be merged without approval.**

## What it shows

- The left lateral teaching frame with real BodyParts3D 4.0 geometry (32 region meshes,
  367k triangles), tissue material, the agreed lighting (warm-neutral key, desaturated violet
  rim), and cavity shading computed from the geometry.
- Lobe selection: violet tint and outline, everything else dims, label and leader line
  highlighted. Click a structure or its label; Tab/Enter work; Esc clears.
- The section transition (S): one camera move while a plane sweeps through the left
  hemisphere with capped cut faces; the left hemisphere is then removed to show the medial
  surface of the right hemisphere, with the corpus callosum cut on the midline.
- Explore Mode (E): orbit and zoom with limits; R resets; Esc returns to the exact frame.
- Narrow screens: labels move below the model; reduced motion: transitions become cuts.

## Not in scope

Real copy and functions (pending the fact register), depth of field and bloom, the scene
transitions in and out, the non-WebGL fallback, KTX2/meshopt compression, and real-device
performance work.

## Run it

```bash
cd neuroverse/proof-scene2
npm ci
npm run dev          # or: npm run build && npm run preview
```

## Rebuild the model

The OBJ source is not committed (136 MB). Download `isa_BP3D_4.0_obj_99.zip` from the
official page (https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html), check its
SHA-256 (`40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e`), unzip, then:

```bash
python3 -I pipeline/build_brain.py <unzipped>/isa_BP3D_4.0_obj_99 public/models/brain-s2.glb pipeline/anchors.json
```

The pipeline merges anatomical parts into regions, welds vertices, computes smooth normals and a
cavity term, and converts axes. It does not move any vertex.

## Credits and licence

Brain model: **BodyParts3D, © The Database Center for Life Science licensed under CC
Attribution 4.0 International**, modified (regions merged, vertices welded, normals and cavity
computed, axes converted). The licence text inside the original 4.0 files states CC
Attribution-Share Alike 2.1 Japan; see `../docs/asset-verification.md`. Until the licensor
confirms which applies, `public/models/brain-s2.glb` is also offered under CC BY-SA 2.1 JP.

Fonts: Newsreader and Atkinson Hyperlegible Next, SIL Open Font License 1.1.
GSAP is used under its standard no-charge licence.
