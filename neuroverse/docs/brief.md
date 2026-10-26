# NEUROVERSE — Checkpoint 1: Brief

Status: approved with corrections (26 Oct 2026). This version includes those corrections.

| Item | Brief |
|---|---|
| **Project** | NEUROVERSE, Hyperform's first flagship interactive 3D presentation, about the human brain |
| **Dates** | Work starts Mon 26 Oct 2026; target launch Fri 30 Oct 2026 |
| **Experience type** | Hybrid: Presentation Mode plus Explore Mode. No Lenis or ScrollTrigger unless an approved interaction needs them |
| **Presentation Mode** | 5 steps; next/previous; keyboard, touch and presentation clickers; fullscreen with an iPhone fallback; smooth transitions that can be interrupted; a link to each step |
| **Explore Mode** | Scenes 2 and 4: orbit, zoom, select, reset, educational labels. Scene 3: limited orbit. Leaving Explore Mode returns to the exact presentation step and camera |
| **Scenes (working titles)** | 1 The Awakening · 2 The Architecture of Thought · 3 The Neural Network · 4 Memory & Emotion · 5 The Human Mind. Final designs come at Checkpoint 3 |
| **Audience** | University students, professors and educators, institutions. Introductory undergraduate level. English only |
| **Target buyers** | Students commissioning premium presentations; academic departments and institutions; organisations that need immersive educational presentations |
| **Service demonstrated** | Hyperform's custom cinematic 3D interactive presentation design |
| **Emotional response** | Awe, curiosity, intellectual excitement, and confidence in the quality of the presentation |
| **Unique value** | Complex academic content turned into immersive, interactive visual storytelling instead of ordinary slides |
| **Excluded** | Pricing, testimonials, agency banners, sales sections, audio, multiple languages, CMS, analytics, presenter view |
| **Devices and browsers** | Desktop, laptop, tablet, phone, and 1920×1080 projectors. Chrome, Safari, Edge, Firefox, with priority on iPhone Safari. Performance claims only from real-device measurements |
| **Classroom use** | Readable on projectors; presentation clickers work (PageDown/PageUp) |
| **Stretch goals** | Offline operation after first load; running directly from a local folder or USB stick |
| **Content** | Educational and scientific, under the full accuracy workflow in `CLAUDE.md`: authoritative sources, fact register, anatomical review, visible labelling of artistic visualisation |
| **Assets** | Original art direction; licensed assets only; a brain model split into regions plus a neuron and synapse, each passing the asset quality gate; nothing assumed available until verified |
| **Creative direction** | cinematic-ui *Surprise me*; no image placeholders |
| **Fallback** | A complete non-WebGL version with all text and labelled images for each step |
| **Deployment** | Vercel |

## Schedule

| Day | Work |
|---|---|
| Mon 26 Oct | Checkpoint 2 (decisions); Checkpoint 3 (storyboard) if approved in time |
| Tue 27 Oct | Checkpoint 4 (compiled spec, interaction spec, asset gate); scene 1 build |
| Wed 28 Oct | Scenes 2 and 3 |
| Thu 29 Oct | Scenes 4 and 5; integration; optimisation |
| Fri 30 Oct | Final QA, fixes, Vercel deployment |

Risk flags:
- The schedule lost Sunday. Each scene now has about half a day including its quality gate.
- **Assets:** no brain model is verified yet, and the asset sites are blocked from this environment. If no brain model has passed the asset gate by Tue 27 Oct midday, I bring a fallback plan instead of building on an unverified model.
- **Sources:** source sites are blocked, so the fact register cannot be verified until access is fixed or sources are uploaded.
- **Performance:** no real-device measurements are possible from this environment.

## Open items

1. **Network access** to source and asset sites (see `sources.md`), or uploaded material instead.
2. **Asset selection and licensing:** a verified brain model with separate regions, and a neuron source.
3. **Real-device testing:** which devices are available for measurement, especially an iPhone.
4. **External scientific review:** whether a subject-matter expert can review the fact register.
