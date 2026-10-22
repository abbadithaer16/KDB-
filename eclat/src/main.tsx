import { binaryFetchUrl } from './lib/binary'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { device } from './lib/device'

// critical 3D assets start downloading immediately — only when they can be used
if (device.webgl) {
  for (const href of ['models/ring.glb', 'env/studio.hdr', 'env/gems.hdr'].map(binaryFetchUrl)) {
    const l = document.createElement('link')
    l.rel = 'preload'
    l.as = 'fetch'
    l.href = href
    l.crossOrigin = 'anonymous'
    document.head.appendChild(l)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
