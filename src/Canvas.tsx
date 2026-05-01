import {
  forwardRef,
  type ElementRef,
  type MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { mountCanvasView } from './canvasView'
import { hitTest, type Scene } from './scene'

export type CanvasHandle = {
  redraw: () => void
}

type CanvasProps = {
  sceneRef: MutableRefObject<Scene>
}

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(
  function Canvas({ sceneRef }, ref) {
    const workspaceRef = useRef<ElementRef<'main'>>(null)
    const viewRef = useRef<ReturnType<typeof mountCanvasView> | null>(null)

    useImperativeHandle(ref, () => ({
      redraw: () => {
        viewRef.current?.redraw()
      },
    }))

    useEffect(() => {
      const workspace = workspaceRef.current
      if (workspace == null) return

      const view = mountCanvasView(workspace, () => sceneRef.current)
      viewRef.current = view

      const onCanvasClick = (e: MouseEvent) => {
        const { canvas, screenToWorld } = view
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const { x: wx, y: wy } = screenToWorld(x, y)
        const hit = hitTest(sceneRef.current, wx, wy)
        sceneRef.current.selectedId = hit?.id ?? null
        view.redraw()
      }

      view.canvas.addEventListener('click', onCanvasClick)

      return () => {
        view.canvas.removeEventListener('click', onCanvasClick)
        view.unmount()
        viewRef.current = null
      }
    }, [sceneRef])

    return (
      <main ref={workspaceRef} className="app-main" id="workspace" />
    )
  },
)
