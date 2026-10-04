import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoryboardProvider } from './state/StoryboardProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoryboardProvider>
        <App />
      </StoryboardProvider>
    </BrowserRouter>
  </StrictMode>,
)
