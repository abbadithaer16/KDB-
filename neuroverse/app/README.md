# NEUROVERSE — the presentation

Five steps about the human brain for an introductory undergraduate audience. A Hybrid experience
(CLAUDE.md): a Presentation Mode driven step by step, plus Explore Mode in steps 2, 3 and 4.

Built on branch `neuroverse-build` after the client asked for all five scenes to be built for one
review at the end (29 Oct 2026). Not merged, not deployed.

## Run it

```bash
cd neuroverse/app
npm ci
npm run data      # fetches the neuron (NeuroMorpho.Org 290955) and derives line and section data from the brain model
npm run dev       # or: npm run build && npm run preview
```

`?debug` exposes `window.__nv` (state, rig, director) for the screenshot and interaction harness.

## Structure

| Path | Role |
|---|---|
| `src/content.ts` | Every on-screen sentence and label, with fact-register IDs (`docs/fact-register.md`) |
| `src/state.ts` | UI state machine (beat index, transition, explore, selection) |
| `src/director.ts` | Navigation: resting state per beat, choreographed timelines, interrupt and previous, deep links |
| `src/rig.ts` | Per-frame values (camera pose and scene parameters), written by GSAP, read by the render loop |
| `src/Stage.tsx` | One canvas for all five steps: brain camera, Explore Mode, label projector, desktop postprocessing |
| `src/brain/` | Brain model, tissue shader (slabs, cut faces, shell, line work), cross-section cap, contours, sulcus traces |
| `src/neuron/` | The approved "Under the lens" neuron and signal (from `proof-scene3`) |
| `src/synapse/` | The procedural chemical synapse and its release timeline |
| `src/ui/` | Sources and changes, keys, text version (also the non-WebGL fallback) |
| `pipeline/` | Data scripts (below) |

## Data

| File | Made by | Notes |
|---|---|---|
| `public/models/brain.glb` | Scene 2 proof pipeline (BodyParts3D 4.0) | Licence: see below |
| `public/data/contours.*` | `build_brain_data.mjs` | Horizontal sections of the model's outer surfaces |
| `public/data/landmarks.json` | `build_brain_data.mjs` | Central and lateral sulci where the model's lobe meshes meet |
| `public/data/section.*` | `build_section.mjs` | True cross-section at the step 1 cut height (ray parity through the closed meshes) |
| `public/data/neuron.json` | `prepare_neuron.py` | **Gitignored, never committed.** Fetched from NeuroMorpho.Org with a pinned SHA-256 |

## Licences

- **Brain model and everything derived from it:** BodyParts3D, © The Database Center for Life
  Science. The licensor's page states CC BY 4.0; the text inside the 4.0 files states CC BY-SA
  2.1 Japan. This conflict is **unresolved**. Both notices are shown, and the adapted files are
  offered under CC BY-SA 2.1 Japan (`public/models/ATTRIBUTION.md`, `docs/licence-obligations.md`).
- **Neuron:** NeuroMorpho.Org 290955, CC BY 4.0, with the three required citations on screen
  ("Sources and changes").
- **Synapse:** made for this presentation.
- **Text:** OpenStax *Anatomy and Physiology 2e*.
- **Fonts:** Newsreader and Atkinson Hyperlegible Next (OFL 1.1).
