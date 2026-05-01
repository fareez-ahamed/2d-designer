export type Shape = {
  id: string
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke: string
}

export type Scene = {
  shapes: Shape[]
  selectedId: string | null
}

export function createScene(): Scene {
  return { shapes: [], selectedId: null }
}

let idCounter = 0

export function addRectangle(scene: Scene): void {
  idCounter += 1
  const offset = scene.shapes.length * 24
  scene.shapes.push({
    id: `r${idCounter}`,
    x: 80 + offset,
    y: 80 + offset,
    w: 120,
    h: 80,
    fill: '#7c3aed',
    stroke: '#4c1d95',
  })
}

export function clearScene(scene: Scene): void {
  scene.shapes = []
  scene.selectedId = null
}

/** Top-most shape last in array wins (draw order). */
export function hitTest(scene: Scene, x: number, y: number): Shape | null {
  for (let i = scene.shapes.length - 1; i >= 0; i -= 1) {
    const s = scene.shapes[i]!
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
      return s
    }
  }
  return null
}
