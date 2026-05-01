import './style.css'
import { Canvas } from './Canvas'
import { useScene } from './SceneContext'

export function App() {
  const scene = useScene()

  const onAdd = () => {
    scene.addRectangle()
  }

  const onClear = () => {
    scene.clear()
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
      <Canvas />
    </>
  )
}
