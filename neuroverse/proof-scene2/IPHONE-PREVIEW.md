# Testing the Scene 2 proof on an iPhone

The claude.ai artifact link runs inside the Claude app's frame, which can capture touch
gestures. For touch testing, open a direct HTTPS URL in Safari. Two ways to get one:

## Option A: GitHub Pages (about 1 minute, no new accounts)

The built proof is on branch **`neuroverse-preview`** (generated files only; it never merges
into `main`).

1. Open https://github.com/abbadithaer16/KDB-/settings/pages
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. **Branch:** `neuroverse-preview`, folder **`/ (root)`** → **Save**.
4. After about a minute the page shows the URL: **https://abbadithaer16.github.io/KDB-/**
5. Open that URL in iPhone Safari.

Notes:
- The site is public to anyone with the URL (the page asks search engines not to index it).
  The model credits and licence links are on the page.
- GitHub Pages serves one branch per repository. If you later want Pages for something else,
  switch it there; to take the preview down, choose **None** under Source.

## Option B: Vercel (isolated preview, can be password-protected)

Follow `VERCEL-PREVIEW.md`. With Deployment Protection on, you must be signed in to Vercel in
Safari to open it.

## What to test on the device

1. Tap a structure on the brain, then a name in the list: both highlight it.
2. Tap **Explore**: drag with one finger to rotate; pinch to zoom (it stops at a limit).
3. Tap **Reset view**: the camera returns to the start of Explore.
4. Tap **Leave explore**: the presentation frame and labels return exactly.
5. Tap **Show midline section**: the cut sweeps through; tap **Corpus callosum** or **Thalamus**.
6. Rotate the phone and back; check nothing overlaps.

Please note the iPhone model and iOS version, and anything that stutters, lags or looks wrong.
Performance is unverified until it has been measured on your device.
