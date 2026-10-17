import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

// Dev-only annotation tool at /annotate. import.meta.env.DEV is false in
// production builds, so this branch (and the tool's code) is left out of them.
if (import.meta.env.DEV && window.location.pathname === '/annotate') {
  import('./annotate/AnnotateApp.jsx').then((mod) => {
    const AnnotateApp = mod.AnnotateApp
    root.render(
      <StrictMode>
        <AnnotateApp />
      </StrictMode>,
    )
  })
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
