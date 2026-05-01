import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { SceneProvider } from './SceneContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SceneProvider>
      <App />
    </SceneProvider>
  </StrictMode>,
)
