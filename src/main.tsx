import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
    <Toaster position="top-left" />
  </StrictMode>,
)
