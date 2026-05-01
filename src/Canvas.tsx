import { type ElementRef, useEffect, useRef } from 'react'
import { mountCanvasView } from './canvasView'
import { useScene } from './SceneContext'

export function Canvas() {
  const scene = useScene()
  const workspaceRef = useRef<ElementRef<'main'>>(null)

  useEffect(() => {
    const workspace = workspaceRef.current
    if (workspace == null) return

    const view = mountCanvasView(workspace, () => scene)

    const unsubscribeScene = scene.subscribe(() => {
      view.redraw()
    })

    const onCanvasClick = (e: MouseEvent) => {
      const { canvas, screenToWorld } = view
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const { x: wx, y: wy } = screenToWorld(x, y)
      scene.selectAtWorld(wx, wy)
    }

    view.canvas.addEventListener('click', onCanvasClick)

    return () => {
      unsubscribeScene()
      view.canvas.removeEventListener('click', onCanvasClick)
      view.unmount()
    }
  }, [scene])

  return <main ref={workspaceRef} className="app-main" id="workspace" />
}
