# NEUROVERSE — Fact register (draft, Checkpoint 3)

Every factual statement in on-screen copy, labels or roles appears here with its source.
Statuses:
- **Read**: the claim matches a passage I read in the source on 27 Oct 2026. It still needs the
  final re-check before QA (CLAUDE.md, *Scientific accuracy* §5).
- **To check**: no source has been read yet. The line stays out of shipped copy until it is
  checked.
- **Simplified**: accurate at introductory level, but intentionally reduced; flagged on screen
  where it matters.

Source access on 27 Oct:
- OpenStax was readable.
- PubMed returned a robot check.
- Europe PMC, NCBI Bookshelf, NINDS and Wikipedia were blocked.
- No copy of Purves or Kandel is available.

Source key: **OS** = OpenStax, *Anatomy and Physiology 2e* (Betts et al., OpenStax, Rice
University; https://openstax.org/books/anatomy-and-physiology-2e), section as given.

| ID | Copy (draft) | Source and passage | Status |
|---|---|---|---|
| F1.1 | The cerebral cortex is a sheet of grey matter about 2.5 mm thick, folded so that more of it fits inside the skull | OS §13.2: "Extensive folding in the cerebral cortex enables more gray matter to fit into this limited space"; OS §16.2: the cortex "is the thin layer of gray matter… On average, it is approximately 2.55 mm thick and highly folded" | Read |
| F1.2 | White matter: fatty, myelinated fibres | OS §12.1: "white matter is fatty (from myelin) and gray matter is not" | Read |
| F2.1 | The cortex is mapped into four lobes using its largest folds as landmarks; lobes linked with functions but working together | OS §13.2: cortex "separated into four major regions, or lobes" by gyri and sulci landmarks; "no obvious anatomical border… consistent with the functions of these regions being interrelated" | Read; "work together" is our summary of "interrelated" |
| F2.2 | Frontal lobe: movement, planning, speech production | OS §13.2: frontal lobe "primarily associated with motor functions"; premotor area for planned movement; prefrontal cognitive functions; Broca's area "production of language… in the vast majority of people… only on the left side" | Read; speech production is left-sided in most people (our model shows the left) |
| F2.3 | Parietal lobe: touch and body position | OS §13.2: somatosensation, including touch and proprioception, in the postcentral gyrus | Read |
| F2.4 | Temporal lobe: hearing and memory | OS §13.2: primary auditory cortex in the superior temporal lobe; "memory is an important function associated with that lobe" | Read |
| F2.5 | Occipital lobe: vision | OS §13.2: areas 17 and 18 "responsible for primary visual perception" | Read |
| F2.6 | Cerebellum: compares movement with sensory feedback | OS §13.2: "largely responsible for comparing information from the cerebrum with sensory feedback from the periphery" | Read; "movement" needs the OS cerebellum detail paragraph re-read |
| F2.7 | Brainstem: connects the brain to the spinal cord | OS §13.2: "a tapering cone that connects the brain to the spinal cord" | Read |
| F2.8 | Corpus callosum: main link between the hemispheres | OS §13.2: "provides the major pathway for communication between the two hemispheres" | Read |
| F2.9 | Thalamus: relays sensory signals to the cortex | OS §13.2: "All sensory information, except for the sense of smell, passes through the thalamus before processing by the cortex" | Read; the role card says "(all senses except smell)" |
| F2.10 | Cingulate gyrus: part of the limbic system | OS §13.2 names the limbic cortex as part of the limbic system but not the cingulate gyrus by name in the passages read | To check (OS figure, Purves) |
| F3.1 | A neuron receives signals on its dendrites and sends them along a single axon | OS §12.2: "one, and only one, axon"; dendrites "receive information"; "Information flows… from the dendrites, across the cell body, and down the axon" | Read; "usually" in the source, so simplified |
| F3.2 | Once threshold is reached, an action potential travels down the axon; it is all-or-none | OS §12.4: threshold at −55 mV; "Action potentials are 'all or none'"; must propagate toward the axon terminals (refractory period) | Read |
| F3.3 | Along a myelinated axon it is renewed at each gap in the myelin | OS §12.4: saltatory conduction; "the new influx of Na+ renews the depolarized membrane" at nodes of Ranvier | Read; "jumps" is the textbook metaphor, labelled "Myelin shown simplified" |
| F3.4 | Calcium enters the terminal, vesicles release neurotransmitter, it crosses the gap and binds receptors on the next cell | OS §12.5: voltage-gated Ca2+ channels open; Ca2+ "facilitates the merging of the vesicle with the presynaptic membrane"; release "through exocytosis into… the synaptic cleft"; neurotransmitter "diffuses… and can interact with neurotransmitter receptors" | Read; "Typical chemical synapse" (target "not necessarily a neuron") |
| F3.5 | Trigger zone (label) | OS §12.2: "Action potentials are generated in the trigger zone, which is a combination of the axon hillock and initial segment" | Read |
| F3.6 | Neuron caption: human pyramidal neuron, left middle temporal gyrus, reconstructed from microscopy | NeuroMorpho.Org record of the chosen cell (candidates in `evidence-register.md`) | To check when the cell is chosen |
| F4.1 | Forming new long-term memories depends on the hippocampus and nearby structures in the temporal lobe | OS §16.2: "The storage of memory requires these structures of the medial temporal lobe"; "the function of the hippocampus, and adjacent structures… is to move (or consolidate)… to long-term memory" | Read; consolidation is simplified at this level |
| F4.2 | The memories themselves are stored across the cortex | OS §13.2: "the ultimate location of those memories is usually in the region in which the sensory perception was processed"; OS §16.2: "the location of those memories is in the multimodal integration areas of the cerebral cortex" | Read |
| F4.3 | Patient H.M., whose medial temporal lobes were removed in 1953, could no longer form new long-term memories | OS §16.2: Henry Molaison, bilateral medial temporal lobe removal in 1953 | Read in part; the outcome sentence needs the full passage re-read |
| F4.4 | The amygdala lies just in front of the hippocampus | Asset geometry plus an atlas | To check (atlas) |
| F4.5 | With nearby cortex, the hippocampus and amygdala are involved in emotional responses as well as memory, and they work as a network | OS §13.2: "The hippocampus and amygdala are medial-lobe structures that, along with the adjacent cortex, are involved in long-term memory formation and emotional responses"; "limbic system, a collection of structures involved in emotion, memory, and behavior" | Read; "network" wording to confirm with Purves |
| F4.6 | Hypothalamus: part of the limbic system; regulates the body's internal balance | OS §13.2: "largely involved in regulating homeostasis… Other parts… involved in memory and emotion as part of the limbic system" | Read |
| F4.7 | Prefrontal cortex: short-term (working) memory | OS §16.2: "short-term memory—also called working or active memory—is localized to the prefrontal lobe" | Read; **OS wording "localized" is too strong for our framing**. Use "involved in working memory" |
| F4.8 | Amygdala-specific role (for example, emotional significance, fear learning) | — | To check (Purves or Kandel); **not in copy until checked** |
| F5.1 | Every thought and feeling depends on activity in this tissue | OS §13.2: "A person's conscious experiences are based on neural activity in the brain" | Read |
| F5.2 | How that activity becomes experience is still an open question | — | To check (Kandel, consciousness chapter) |

## Claims deliberately excluded

| Claim | Why |
|---|---|
| Neuron counts ("86 billion") | Peer-reviewed source (Azevedo et al. 2009) could not be opened; OS §12.2 says "a number in the trillions", which conflicts with widely cited estimates. Neither is used |
| Brain energy share ("20%") | Source not readable here |
| Conduction speed, slowed-down factor, cleft width | Not sourced; tags say "Slowed down" and "Not to scale" without numbers |
| "Fear centre", "memory centre", "10% of the brain", "left/right-brained" | Myths or single-centre framings the brief excludes |

## Expert review

Before the QA report: do you want a subject-matter expert to review this register? (Checkpoint 3
approval item.)
