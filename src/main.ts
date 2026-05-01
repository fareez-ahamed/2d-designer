import './style.css'
import { mountCanvasView } from './canvasView'
import {
  addRectangle,
  clearScene,
  createScene,
  hitTest,
  type Scene,
} from './scene'

const scene: Scene = createScene()

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="app-header">
    <h1>2D Designer</h1>
    <div class="app-header__actions">
      <button type="button" id="btn-clear" class="btn-danger">Clear canvas</button>
    </div>
  </header>
  <aside class="app-sidebar">
    <div>
      <h2>Tools</h2>
      <p>Add rectangles to the scene. Click a shape to select it.</p>
    </div>
    <button type="button" id="btn-add" class="btn-primary">Add rectangle</button>
  </aside>
  <main class="app-main" id="workspace"></main>
`

const workspace = document.getElementById('workspace')!
const { redraw, canvas } = mountCanvasView(workspace, () => scene)

document.getElementById('btn-add')!.addEventListener('click', () => {
  addRectangle(scene)
  redraw()
})

document.getElementById('btn-clear')!.addEventListener('click', () => {
  clearScene(scene)
  redraw()
})

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const hit = hitTest(scene, x, y)
  scene.selectedId = hit?.id ?? null
  redraw()
})
