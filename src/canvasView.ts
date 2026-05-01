import type { Scene } from './scene'

export type CanvasViewApi = {
  redraw: () => void
  readonly canvas: HTMLCanvasElement
}

export function mountCanvasView(
  container: HTMLElement,
  getScene: () => Scene,
): CanvasViewApi {
  const canvas = document.createElement('canvas')
  canvas.className = 'design-canvas'
  container.appendChild(canvas)

  const maybeCtx = canvas.getContext('2d')
  if (maybeCtx == null) {
    throw new Error('2d context unavailable')
  }
  const ctx: CanvasRenderingContext2D = maybeCtx

  function layout(): void {
    const dpr = window.devicePixelRatio || 1
    const w = container.clientWidth
    const h = container.clientHeight
    canvas.width = Math.max(1, Math.floor(w * dpr))
    canvas.height = Math.max(1, Math.floor(h * dpr))
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    draw()
  }

  function drawGrid(cssW: number, cssH: number): void {
    const step = 20
    ctx.strokeStyle = 'rgba(100, 100, 120, 0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= cssW; x += step) {
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, cssH)
    }
    for (let y = 0; y <= cssH; y += step) {
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(cssW, y + 0.5)
    }
    ctx.stroke()
  }

  function draw(): void {
    const dpr = window.devicePixelRatio || 1
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    const scene = getScene()

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    ctx.fillStyle =
      getComputedStyle(container).backgroundColor || 'rgb(236, 236, 238)'
    ctx.fillRect(0, 0, cssW, cssH)

    drawGrid(cssW, cssH)

    for (const shape of scene.shapes) {
      ctx.fillStyle = shape.fill
      ctx.strokeStyle = shape.stroke
      ctx.lineWidth = 2
      ctx.fillRect(shape.x, shape.y, shape.w, shape.h)
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
    }

    if (scene.selectedId) {
      const sel = scene.shapes.find((s) => s.id === scene.selectedId)
      if (sel) {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2
        ctx.strokeRect(sel.x - 3, sel.y - 3, sel.w + 6, sel.h + 6)
      }
    }
  }

  const ro = new ResizeObserver(() => {
    layout()
  })
  ro.observe(container)
  layout()

  return {
    redraw: draw,
    canvas,
  }
}
