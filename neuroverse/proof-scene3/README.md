# NEUROVERSE — Scene 3 signal proof (isolated, local)

Authorised on 27 Oct 2026 as an isolated local proof before Checkpoint 4. **Not production, not
deployed, not to be merged.** The neuron data is fetched locally and never committed; no preview
link is published. The Scene 2 proof is untouched.

## What it shows

- 3a: a real human pyramidal neuron (NeuroMorpho.Org 290955) with labels.
- 3b, one press: the camera moves to a side view of the trigger zone, the signal fires, and the
  camera swings round behind it and follows it down the recorded axon. It then rises to show the
  whole 1.86 mm recorded path, ending at "End of the reconstructed axon".
- Lit nodes of Ranvier trail behind the front. Everything except the path falls into shadow while
  the signal is the subject.
- Interrupt (→ mid-signal) lands on the resting frame; Replay; Back (←).
- Reduced motion: no camera motion; a numbered static sequence; "Play the signal" on request.
- Phones: portrait framings; labels flip on narrow screens.

Not in scope: the synapse (3c), the descent from scene 2, depth of field and bloom, Explore Mode,
production shell.

## Run it

```bash
cd neuroverse/proof-scene3
npm ci
npm run data      # downloads the SWC from NeuroMorpho.Org, checks SHA-256, writes public/data (gitignored)
npm run dev       # or: npm run build && npm run preview
```

`?debug` exposes `window.__nv.seek(t)` and `window.__nv.stats()` for deterministic screenshots.

## What the pipeline does to the data

`pipeline/prepare_neuron.py`:
- rotates the cell so the apical dendrite points up and moves the soma to the origin;
- simplifies each unbranched section with a 0.5 µm tolerance (measured maximum deviation
  0.4999 µm);
- keeps **every** recorded point of the signal path (697 points, 1,864.82 µm);
- adds nothing beyond the recorded points and changes no radius.

The renderer:
- draws recorded radii;
- holds very thin branches at a minimum on-screen width in distant views (tagged on screen);
- adds illustrative myelin on the signal path only (tagged on screen).

## Credits

Neuron: NeuroMorpho.Org 290955 (790_Mohan_etal_2015), DeKock archive. Original paper: Mohan H. et
al. (2015), *Cerebral Cortex*, doi:10.1093/cercor/bhv188. NeuroMorpho.Org (RRID:SCR_002145).
Tecuatl C, Ljungquist B, Ascoli GA (2024), *FASEB Bioadv.* 6(7):207-221,
doi:10.1096/fba.2024-00048. Licence: CC BY 4.0 (NeuroMorpho.Org terms). See `ASSETS.md`.
