import { useEffect, useRef } from 'react'

const KEYS: [string, string][] = [
  ['→  Space  Page Down', 'Next (presentation clickers send Page Down)'],
  ['←  Page Up', 'Previous'],
  ['Home  End', 'First and last step'],
  ['E', 'Explore, where available'],
  ['R', 'Reset the view in Explore; replay the signal or the release'],
  ['Esc', 'Leave Explore, or clear the highlight'],
  ['F', 'Full screen'],
  ['?', 'This list'],
]

export function Help({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="help-title" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <h2 id="help-title">Keys and gestures</h2>
      <dl className="keys">
        {KEYS.map(([k, v]) => (
          <div key={k}><dt>{k.split('  ').map((x) => <kbd key={x}>{x}</kbd>)}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <p>On touch screens, swipe left or right to move between steps, or use the buttons. In Explore, drag with one finger to rotate and pinch to zoom.</p>
      <button className="close" onClick={onClose}>Close</button>
    </dialog>
  )
}
