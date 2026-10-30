/**
 * All on-screen copy. Every factual sentence carries its fact-register ID (docs/fact-register.md);
 * only entries marked Read are used. Unverified claims (amygdala-specific roles, the H.M. outcome,
 * the "open question" line, any numbers) are deliberately absent.
 */

// Step 4 shows the cortex translucent on desktop and cut away on touch screens (decision C8).
const CUT_AWAY = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const CORTEX_VIEW = CUT_AWAY ? 'outer cortex cut away' : 'cortex shown translucent'
const CORTEX_LEGEND = CUT_AWAY ? 'cut-away cortex' : 'translucent cortex'

export type LabelDef = {
  /** Anchor key, resolved by the world that owns the beat. */
  key: string
  name: string
  role?: string
  /** Brain regions this label selects (brain beats only). */
  regions?: string[]
  /** Which side of its dot the text sits on; by default it follows the dot's screen position. */
  side?: 'left' | 'right'
}

export type BeatDef = {
  /** Stable ID used for deep links (#id). */
  id: string
  statement: string
  caption?: string
  labels: LabelDef[]
  recorded: string
  illustrative: string
  /** Explore Mode available on this beat. */
  explore?: boolean
  /** Primary action label that replaces "Next" on this beat (e.g. Begin). */
  nextLabel?: string
}

export type StepDef = { id: string; title: string; beats: BeatDef[] }

const BRAIN_RECORDED = 'brain anatomy from the BodyParts3D model.'

export const STEPS: StepDef[] = [
  {
    id: 'living-fold',
    title: 'The living fold',
    beats: [
      {
        id: 'living-fold',
        statement: 'An introduction to the human brain in five steps.',
        caption: 'The top horizontal section of the brain, seen from above',
        labels: [],
        recorded: 'the outline is cut from the 3D brain model.',
        illustrative: 'violet line colour.',
        nextLabel: 'Begin',
      },
      {
        id: 'living-fold-built',
        // F1.1
        statement: 'The cerebral cortex is a sheet of grey matter about 2.5 mm thick, folded so that more of it fits inside the skull.',
        caption: 'Seen from the front left',
        labels: [{ key: 'cortex', name: 'Cerebral cortex', role: 'Folded grey matter' }],
        recorded: BRAIN_RECORDED,
        illustrative: 'the assembly from horizontal sections.',
      },
      {
        id: 'living-fold-section',
        // F1.1, F1.2
        statement: 'Opened along a horizontal cut, the brain shows grey matter folded around the white matter beneath it.',
        caption: 'Horizontal section, computed from the 3D model',
        labels: [
          { key: 'grey', name: 'Grey matter', role: 'The folded cortex' },
          { key: 'white', name: 'White matter', role: 'Fatty, myelinated fibres' },
        ],
        recorded: BRAIN_RECORDED,
        illustrative: 'the top opened like a lid; cut-surface colours.',
      },
    ],
  },
  {
    id: 'architecture',
    title: 'The architecture of thought',
    beats: [
      {
        id: 'architecture',
        // F2.1
        statement: 'The cortex is mapped into four lobes using its largest folds as landmarks. Each lobe is linked with particular functions, but the lobes work together.',
        caption: 'Left lateral view',
        explore: true,
        labels: [
          // F2.2 – F2.7
          { key: 'frontal', name: 'Frontal lobe', role: 'Movement, planning, speech production', regions: ['frontal'] },
          { key: 'parietal', name: 'Parietal lobe', role: 'Touch and body position', regions: ['parietal'] },
          { key: 'temporal', name: 'Temporal lobe', role: 'Hearing and memory', regions: ['temporal'] },
          { key: 'occipital', name: 'Occipital lobe', role: 'Vision', regions: ['occipital'] },
          { key: 'cerebellum', name: 'Cerebellum', role: 'Compares movement with sensory feedback', regions: ['cerebellum'] },
          { key: 'brainstem', name: 'Brainstem', role: 'Connects the brain to the spinal cord', regions: ['brainstem'] },
        ],
        recorded: 'structure positions and the sulci that bound the lobes (BodyParts3D).',
        illustrative: 'highlight colour.',
      },
      {
        id: 'architecture-midline',
        // F2.8
        statement: 'Separated along the midline, the brain shows what joins its two halves.',
        caption: 'Right hemisphere, inner surface, seen from the left',
        explore: true,
        labels: [
          // F2.8, F2.9; the cingulate gyrus is named only (its role is not yet sourced, F2.10)
          { key: 'callosum', name: 'Corpus callosum', role: 'Main link between the hemispheres', regions: ['callosum'] },
          { key: 'thalamus', name: 'Thalamus', role: 'Relays sensory signals to the cortex', regions: ['thalamus'] },
          { key: 'cingulate', name: 'Cingulate gyrus', regions: ['limbic'] },
          { key: 'cerebellum', name: 'Cerebellum', regions: ['cerebellum'] },
          { key: 'brainstem', name: 'Brainstem', regions: ['brainstem'] },
        ],
        recorded: 'structure positions (BodyParts3D).',
        illustrative: 'the left hemisphere moved aside; highlight colour.',
      },
    ],
  },
  {
    id: 'signal',
    title: 'Electrical, then chemical',
    beats: [
      {
        id: 'signal',
        // F3.1
        statement: 'A neuron receives signals on its dendrites and sends them along a single axon.',
        caption: 'Human pyramidal neuron, middle temporal gyrus (hemisphere not recorded)',
        explore: true,
        labels: [
          { key: 'dendrites', name: 'Dendrites', role: 'Receive signals' },
          { key: 'soma', name: 'Cell body' },
          { key: 'axon', name: 'Axon', role: 'Sends the signal on; continues below' },
        ],
        recorded: "the cell's shape and the axon's path.",
        illustrative: 'thin branches drawn wider at a distance.',
        nextLabel: 'Send a signal',
      },
      {
        id: 'signal-axon',
        // F3.2, F3.3
        statement: 'Once threshold is reached, an action potential travels down the axon. It is all-or-none: it does not get weaker. Along a myelinated axon it is renewed at each gap in the myelin.',
        caption: 'Slowed down',
        labels: [
          { key: 'trigger', name: 'Trigger zone', role: 'Where the signal starts' },
          { key: 'myelin', name: 'Myelin', role: 'Illustrative, not in the recording' },
          { key: 'node', name: 'Node of Ranvier', role: 'Where the signal is renewed' },
          { key: 'end', name: 'End of the reconstructed axon', role: 'The recording stops here' },
        ],
        recorded: "the cell's shape and the axon's path.",
        illustrative: 'signal shown as light; colour and timing; myelin; thin branches drawn wider at a distance.',
      },
      {
        id: 'signal-synapse',
        // F3.4
        statement: 'At the synapse the signal becomes chemical. Calcium enters the terminal, vesicles release neurotransmitter, and it crosses the gap to bind receptors on the next cell.',
        caption: 'A typical chemical synapse, cut open',
        labels: [
          { key: 'terminal', name: 'Axon terminal', side: 'right' },
          { key: 'vesicles', name: 'Vesicles', role: 'Hold neurotransmitter', side: 'right' },
          { key: 'transmitter', name: 'Neurotransmitter', side: 'left' },
          { key: 'cleft', name: 'Synaptic cleft', side: 'right' },
          { key: 'receptors', name: 'Receptors', role: 'On the next cell', side: 'right' },
        ],
        recorded: 'nothing: this synapse is a model, not this neuron’s terminal.',
        illustrative: 'simplified and not to scale; cut open to show the inside; colours and timing.',
      },
    ],
  },
  {
    id: 'memory',
    title: 'Memory & emotion',
    beats: [
      {
        id: 'memory',
        // F4.1, F4.2
        statement: 'Forming new long-term memories depends on the hippocampus and nearby structures in the temporal lobe. The memories themselves are stored across the cortex.',
        caption: `Seen from below left · ${CORTEX_VIEW} (simplified)`,
        explore: true,
        labels: [
          { key: 'hippocampus', name: 'Hippocampus', role: 'Needed to form new long-term memories', regions: ['hippocampus'] },
          { key: 'fornix', name: 'Fornix', regions: ['fornix'] },
          { key: 'parahippocampal', name: 'Parahippocampal gyrus', regions: ['limbic'] },
          // F4.7 (wording softened from the source's "localized")
          { key: 'frontal', name: 'Frontal lobe', role: 'Includes prefrontal cortex: working memory', regions: ['frontal'] },
        ],
        recorded: 'positions of deep structures (BodyParts3D).',
        illustrative: `${CORTEX_LEGEND}; highlight colour.`,
      },
      {
        id: 'memory-emotion',
        // F4.5, F4.6
        statement: 'With the nearby cortex, the hippocampus and amygdala are involved in both memory and emotional responses. They work as part of a network, not as single centres.',
        caption: 'Highlighted structures work together; the connections between them are not drawn',
        explore: true,
        labels: [
          { key: 'amygdala', name: 'Amygdala', regions: ['amygdala'] },
          { key: 'hippocampus', name: 'Hippocampus', regions: ['hippocampus'] },
          { key: 'hypothalamus', name: 'Hypothalamus', role: "Regulates the body's internal balance", regions: ['hypothalamus'] },
          { key: 'cingulate', name: 'Cingulate gyrus', regions: ['limbic'] },
          { key: 'frontal', name: 'Frontal lobe', regions: ['frontal'] },
        ],
        recorded: 'positions of deep structures (BodyParts3D).',
        illustrative: `${CORTEX_LEGEND}; highlight colour.`,
      },
    ],
  },
  {
    id: 'mind',
    title: 'The human mind',
    beats: [
      {
        id: 'mind',
        // F5.1; the second sentence describes this presentation, not a scientific claim
        statement: 'Every thought and feeling depends on activity in this tissue. These five steps show its structure, signals and networks; they do not explain experience itself.',
        caption: 'Left lateral view, drawn',
        labels: [
          { key: 'structures', name: 'Structures', role: 'Step 2: lobes and their landmarks' },
          { key: 'signals', name: 'Signals', role: 'Step 3: where the neuron was recorded' },
          { key: 'networks', name: 'Networks', role: 'Step 4: memory and emotion' },
        ],
        recorded: BRAIN_RECORDED,
        illustrative: 'drawn as line work.',
        nextLabel: 'Start again',
      },
    ],
  },
]

/** Flat list of beats with their step, for navigation. */
export const BEATS = STEPS.flatMap((step, s) => step.beats.map((beat, b) => ({ step, stepIndex: s, beat, beatIndex: b })))
export type BeatRef = (typeof BEATS)[number]
export const beatIndexById = (id: string) => BEATS.findIndex((b) => b.beat.id === id)
