import { type ElementRef, useEffect, useRef } from 'react'
import './style.css'
import { mountCanvasView } from './canvasView'
import {
  addRectangle,
  clearScene,
  createScene,
  hitTest,
  type Scene,
} from './scene'

export function App() {
  const sceneRef = useRef<Scene>(createScene())
  const workspaceRef = useRef<ElementRef<'main'>>(null)
  const viewRef = useRef<ReturnType<typeof mountCanvasView> | null>(null)

  useEffect(() => {
    const workspace = workspaceRef.current
    if (workspace == null) return

    const view = mountCanvasView(workspace, () => sceneRef.current)
    viewRef.current = view

    const onCanvasClick = (e: MouseEvent) => {
      const { canvas } = view
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const hit = hitTest(sceneRef.current, x, y)
      sceneRef.current.selectedId = hit?.id ?? null
      view.redraw()
    }

    view.canvas.addEventListener('click', onCanvasClick)

    return () => {
      view.canvas.removeEventListener('click', onCanvasClick)
      view.unmount()
      viewRef.current = null
    }
  }, [])

  const onAdd = () => {
    addRectangle(sceneRef.current)
    viewRef.current?.redraw()
  }

  const onClear = () => {
    clearScene(sceneRef.current)
    viewRef.current?.redraw()
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
      <main ref={workspaceRef} className="app-main" id="workspace" />
    </>
  )
}
