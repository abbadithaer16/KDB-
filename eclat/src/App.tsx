import { Suspense, lazy, useEffect } from 'react'
import { initScroll } from './lib/scroll'
import { device } from './lib/device'
import { Preloader } from './components/Preloader'
import { Nav } from './components/Nav'
import { Cursor } from './components/Cursor'
import { ProductDetail } from './components/ProductDetail'
import { Enquiry } from './components/Enquiry'
import { InspectBar } from './components/InspectBar'
import { Awakening } from './components/sections/Awakening'
import { Diamond } from './components/sections/Diamond'
import { Campaign } from './components/sections/Campaign'
import { Necklace } from './components/sections/Necklace'
import { Craft } from './components/sections/Craft'
import { Bracelet } from './components/sections/Bracelet'
import { Collections } from './components/sections/Collections'
import { Finale, Footer } from './components/sections/Finale'

// three.js + R3F arrive as a separate chunk while the preloader paints
const Stage = lazy(() => import('./three/Stage'))

export default function App() {
  useEffect(() => initScroll(), [])

  return (
    <>
      {device.webgl && (
        <Suspense fallback={null}>
          <Stage />
        </Suspense>
      )}
      <Preloader />
      <Nav />
      <main>
        <Awakening />
        <Diamond />
        <Campaign />
        <Necklace />
        <Craft />
        <Bracelet />
        <Collections />
        <Finale />
      </main>
      <Footer />
      <ProductDetail />
      <Enquiry />
      <InspectBar />
      <Cursor />
      <div className="grain" aria-hidden />
      {!device.webgl && (
        <div className="nowebgl-note" role="status">
          3D is unavailable on this device, so the jewellery is shown as photographs. Everything else works as normal.
        </div>
      )}
    </>
  )
}
