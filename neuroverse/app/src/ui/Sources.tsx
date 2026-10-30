import { useEffect, useRef } from 'react'

/** Sources, credits and every change made to third-party data. A modal: focus moves in and returns. */
export function Sources({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sources-title" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <h2 id="sources-title">Sources and changes</h2>

      <h3>Brain model (steps 1, 2, 4, 5)</h3>
      <p>
        Adapted from BodyParts3D, © The Database Center for Life Science. The licensor's licence page and README
        (2025) state <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC Attribution 4.0 International</a>;
        the licence text inside the original release 4.0 files states{' '}
        <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/" target="_blank" rel="noreferrer">CC Attribution-Share Alike 2.1 Japan</a>.
        Until the licensor clarifies, both notices apply and the adapted model files are offered under CC BY-SA 2.1 Japan.{' '}
        <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/" target="_blank" rel="noreferrer">BodyParts3D</a>.
      </p>
      <ul>
        <li>Anatomical parts merged into regions; vertices welded; smooth normals and a cavity (sulcus) shading term computed; axes converted; positions quantised (largest change 0.007 mm).</li>
        <li>Horizontal contours (step 1) and the central and lateral sulcus traces (step 2) are computed from the model.</li>
        <li>Cut surfaces, the lifted top, the moved hemisphere, the translucent cortex and the line drawing are renderings of the model, not anatomy.</li>
      </ul>

      <h3>Neuron (step 3)</h3>
      <p>
        Human pyramidal neuron, middle temporal gyrus, layer 2/3 (hemisphere not recorded). NeuroMorpho.Org 290955
        (790_Mohan_etal_2015). Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.
      </p>
      <ol>
        <li>Mohan H, et al. (2015). <i>Cerebral Cortex</i>. doi:10.1093/cercor/bhv188</li>
        <li>NeuroMorpho.Org (RRID:SCR_002145)</li>
        <li>Tecuatl C, Ljungquist B, Ascoli GA (2024). <i>FASEB BioAdvances</i> 6(7):207–221. doi:10.1096/fba.2024-00048</li>
      </ol>
      <ul>
        <li>Rotated so the apical dendrite points up; simplified within 0.5 µm; the signal path keeps every recorded point.</li>
        <li>Drawn as tubes from the recorded radii; thin branches held at a minimum width in distant views.</li>
        <li>Myelin and its gaps are added for illustration; the recording does not include myelin.</li>
        <li>The cell body is drawn as the sphere stored in the standardised file.</li>
        <li>The signal is shown as violet light, slowed down; colour, light and timing are illustrative.</li>
      </ul>

      <h3>Synapse (step 3)</h3>
      <p>A typical chemical synapse modelled for this presentation: simplified and not to scale. It is not this neuron's terminal.</p>

      <h3>Text</h3>
      <p>
        OpenStax, <i>Anatomy and Physiology 2e</i> (Betts et al.), sections 12.1, 12.2, 12.4, 12.5, 13.2 and 16.2.{' '}
        <a href="https://openstax.org/books/anatomy-and-physiology-2e" target="_blank" rel="noreferrer">openstax.org</a>
      </p>

      <h3>Type</h3>
      <p>Newsreader and Atkinson Hyperlegible Next, SIL Open Font License 1.1.</p>

      <button className="close" onClick={onClose}>Close</button>
    </dialog>
  )
}
