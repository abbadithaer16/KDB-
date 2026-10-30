/**
 * Synaptic release, as a function of event time (seconds). Order of events from OpenStax §12.5
 * (fact F3.4): the arriving signal opens calcium channels, vesicles fuse with the membrane,
 * neurotransmitter crosses the cleft and binds receptors, and the next cell responds.
 * Timing is illustrative ("slowed down").
 */
export const SYN = {
  channels: [0.0, 0.6],
  fusion: [0.6, 1.6],
  diffusion: [1.4, 2.9],
  binding: [2.6, 3.3],
  response: [3.1, 4.4],
} as const
export const SYN_END = 5.0

/** 0..1 progress of a phase at time t. */
export const phase = (t: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)))
