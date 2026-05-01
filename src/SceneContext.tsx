import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react'
import { Scene } from './scene'

const SceneContext = createContext<Scene | null>(null)

export function SceneProvider({ children }: { children: ReactNode }) {
  const sceneRef = useRef<Scene | null>(null)
  if (sceneRef.current == null) {
    sceneRef.current = new Scene()
  }
  return (
    <SceneContext.Provider value={sceneRef.current}>
      {children}
    </SceneContext.Provider>
  )
}

export function useScene(): Scene {
  const scene = useContext(SceneContext)
  if (scene == null) {
    throw new Error('useScene must be used within a SceneProvider')
  }
  return scene
}
