import { Picture } from './Picture'

/** Still photograph standing in for a 3D stage when WebGL is unavailable. */
export function Poster({ name, portrait }: { name: string; portrait?: string }) {
  return (
    <div className="poster">
      <Picture name={name} portrait={portrait} alt="" sizes="100vw" />
    </div>
  )
}
