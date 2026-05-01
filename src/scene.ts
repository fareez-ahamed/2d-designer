export type Shape = {
  id: string
  x: number
  y: number
  w: number
  h: number
  fill: string
  stroke: string
}

export type SceneListener = () => void

let idCounter = 0

export class Scene {
  shapes: Shape[] = []
  selectedId: string | null = null

  private readonly listeners = new Set<SceneListener>()

  subscribe(listener: SceneListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }

  addRectangle(): void {
    idCounter += 1
    const offset = this.shapes.length * 24
    this.shapes.push({
      id: `r${idCounter}`,
      x: 80 + offset,
      y: 80 + offset,
      w: 120,
      h: 80,
      fill: '#7c3aed',
      stroke: '#4c1d95',
    })
    this.notify()
  }

  clear(): void {
    this.shapes = []
    this.selectedId = null
    this.notify()
  }

  /** Top-most shape last in array wins (draw order). */
  hitTest(x: number, y: number): Shape | null {
    for (let i = this.shapes.length - 1; i >= 0; i -= 1) {
      const s = this.shapes[i]!
      if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
        return s
      }
    }
    return null
  }

  selectAtWorld(x: number, y: number): void {
    const hit = this.hitTest(x, y)
    const next = hit?.id ?? null
    if (next === this.selectedId) {
      return
    }
    this.selectedId = next
    this.notify()
  }
}
