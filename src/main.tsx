import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/auth'
import { I18nProvider } from './lib/i18n'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>
)

// react-snap prerendered pages use hydrateRoot, normal SPA uses createRoot
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
