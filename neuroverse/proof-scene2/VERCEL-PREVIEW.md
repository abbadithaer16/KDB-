# Isolated Vercel preview for the Scene 2 proof

Goal: a preview URL built only from branch `neuroverse-proof`, with no production deployment
and no merge into `main`. This needs your Vercel account; I have no access to it.

## One-time setup (about 5 minutes)

1. Open https://vercel.com/new and import the GitHub repository `abbadithaer16/KDB-`.
   Create a **new project** (for example `neuroverse-proof`). Do not reuse the ÉCLAT project.
2. On the configure screen:
   - **Root Directory:** `neuroverse/proof-scene2`
   - **Framework Preset:** Vite (picked up from `vercel.json`)
   - Build and install commands come from `vercel.json` (`npm ci`, `npm run build`, output `dist`).
   - No environment variables are needed.
3. Click **Deploy**. This first deployment uses `main`, which does not contain this folder, so it
   is skipped or fails. That is expected and harmless.
4. **Keep production empty:** Project → Settings → Environments → Production → Branch Tracking,
   set the production branch to a branch that will never exist, e.g. `neuroverse-production-off`.
5. **Keep previews private:** Project → Settings → Deployment Protection → Vercel Authentication
   → on for preview deployments ("Standard Protection"). Only people signed in to your Vercel
   team can open the link.
6. Create the preview: Project → Deployments → **Create Deployment** (or push any commit to
   `neuroverse-proof`), choose branch `neuroverse-proof`. `vercel.json`'s `ignoreCommand` skips
   builds for every other branch.
7. The preview URL appears on the deployment page, e.g.
   `neuroverse-proof-git-neuroverse-proof-<team>.vercel.app`.

## What the preview serves

- `models/brain-s2.glb`: meshopt-compressed (2.76 MB file; about 1.96 MB with Brotli, which Vercel
  applies automatically), decoded by the meshopt decoder bundled in the app (no CDN).
- `X-Robots-Tag: noindex` on every response, and long-term caching for hashed assets.

## Check before sharing

- The page credits BodyParts3D with links (bottom right) and links to `models/ATTRIBUTION.md`.
- A preview with protection off is public distribution of the adapted model; the credits above
  satisfy both licence readings (see `../docs/licence-obligations.md`).

## Note about the existing ÉCLAT project

The repository is already connected to Vercel for ÉCLAT (`eclatjewerly.vercel.app`). If that
project builds every branch, pushes to `neuroverse-proof` also create ÉCLAT preview builds. They
build only `eclat/`, so they are harmless, but you can limit them in that project's Settings →
Git → Ignored Build Step.
