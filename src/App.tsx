import { useRef } from 'react'
import './style.css'
import { Canvas, type CanvasHandle } from './Canvas'
import { addRectangle, clearScene, createScene, type Scene } from './scene'

export function App() {
  const sceneRef = useRef<Scene>(createScene())
  const canvasRef = useRef<CanvasHandle>(null)

  const onAdd = () => {
    addRectangle(sceneRef.current)
    canvasRef.current?.redraw()
  }

  const onClear = () => {
    clearScene(sceneRef.current)
    canvasRef.current?.redraw()
  }

  return (
    <>
      <header className="app-header">
        <h1>2D Designer</h1>
        <div className="app-header__actions">
          <button
            type="button"
            className="btn-danger"
            onClick={onClear}
          >
            Clear canvas
          </button>
        </div>
      </header>
      <aside className="app-sidebar">
        <div>
          <h2>Tools</h2>
          <p>Add rectangles to the scene. Click a shape to select it.</p>
        </div>
        <button type="button" className="btn-primary" onClick={onAdd}>
          Add rectangle
        </button>
      </aside>
      <Canvas ref={canvasRef} sceneRef={sceneRef} />
    </>
  )
}
