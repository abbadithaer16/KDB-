import { asset } from '../lib/asset'
import { forwardRef, useState } from 'react'
import manifest from '../lib/images.json'

type Entry = { w: number; h: number; widths: number[]; lqip: string; source: string }
const IMAGES = manifest as Record<string, Entry>

export const imageEntry = (key: string) => IMAGES[key]

const srcset = (key: string, ext: 'avif' | 'webp') =>
  IMAGES[key].widths.map((w) => `${asset(`img/${key}-${w}.${ext}`)} ${w}w`).join(', ')

export const imageUrl = (key: string, target = 1200) => {
  const e = IMAGES[key]
  const w = e.widths.find((x) => x >= target) ?? e.widths[e.widths.length - 1]
  return asset(`img/${key}-${w}.webp`)
}

interface Props {
  name: string
  /** art-directed source for portrait / narrow viewports */
  portrait?: string
  alt: string
  sizes?: string
  eager?: boolean
  className?: string
  imgClassName?: string
}

/** Responsive AVIF/WebP picture with a blurred LQIP that fades out on load. */
export const Picture = forwardRef<HTMLImageElement, Props>(function Picture(
  { name, portrait, alt, sizes = '100vw', eager, className, imgClassName },
  ref,
) {
  const [loaded, setLoaded] = useState(false)
  const e = IMAGES[name]
  if (!e) return null
  return (
    <picture
      className={className}
      style={{
        backgroundImage: `url(${e.lqip})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'block',
      }}
    >
      {portrait && IMAGES[portrait] && (
        <>
          <source media="(max-aspect-ratio: 4/5)" type="image/avif" srcSet={srcset(portrait, 'avif')} sizes={sizes} />
          <source media="(max-aspect-ratio: 4/5)" type="image/webp" srcSet={srcset(portrait, 'webp')} sizes={sizes} />
        </>
      )}
      <source type="image/avif" srcSet={srcset(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(name, 'webp')} sizes={sizes} />
      <img
        ref={ref}
        className={imgClassName}
        src={imageUrl(name)}
        width={e.w}
        height={e.h}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-expect-error fetchpriority is valid HTML, not yet in React 18 types
        fetchpriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.9s cubic-bezier(.22,1,.36,1)' }}
      />
    </picture>
  )
})
