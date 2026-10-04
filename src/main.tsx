import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoryboardProvider } from './state/StoryboardProvider'
import { Toaster } from '@/components/ui/sonner'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoryboardProvider>
        <App />
        <Toaster />
      </StoryboardProvider>
    </BrowserRouter>
  </StrictMode>,
)
