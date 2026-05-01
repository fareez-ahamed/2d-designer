import type { Scene } from './scene'

const MIN_SCALE = 0.1
const MAX_SCALE = 8
const GRID_STEP = 20
const ZOOM_INTENSITY = 0.0018
const PAN_CLICK_SUPPRESS_PX = 5
const SPACE_PAN_START_PX = 5

export type CanvasViewApi = {
  redraw: () => void
  readonly canvas: HTMLCanvasElement
  screenToWorld: (canvasRelX: number, canvasRelY: number) => { x: number; y: number }
  unmount: () => void
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

  let scale = 1
  let offsetX = 0
  let offsetY = 0

  let spaceHeld = false
  let panPointerId: number | null = null
  let pendingSpacePan: { pointerId: number; sx: number; sy: number } | null =
    null
  let lastPanClientX = 0
  let lastPanClientY = 0
  let panAccumSq = 0
  let suppressNextClick = false

  function screenToWorld(canvasRelX: number, canvasRelY: number): {
    x: number
    y: number
  } {
    return {
      x: (canvasRelX - offsetX) / scale,
      y: (canvasRelY - offsetY) / scale,
    }
  }

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

  function drawGridWorld(
    worldMinX: number,
    worldMaxX: number,
    worldMinY: number,
    worldMaxY: number,
  ): void {
    const step = GRID_STEP
    ctx.strokeStyle = 'rgba(100, 100, 120, 0.12)'
    ctx.lineWidth = 1 / scale
    const startX = Math.floor(worldMinX / step) * step
    const endX = Math.ceil(worldMaxX / step) * step
    const startY = Math.floor(worldMinY / step) * step
    const endY = Math.ceil(worldMaxY / step) * step
    ctx.beginPath()
    for (let x = startX; x <= endX; x += step) {
      ctx.moveTo(x + 0.5 / scale, worldMinY)
      ctx.lineTo(x + 0.5 / scale, worldMaxY)
    }
    for (let y = startY; y <= endY; y += step) {
      ctx.moveTo(worldMinX, y + 0.5 / scale)
      ctx.lineTo(worldMaxX, y + 0.5 / scale)
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

    const worldMinX = -offsetX / scale
    const worldMaxX = (cssW - offsetX) / scale
    const worldMinY = -offsetY / scale
    const worldMaxY = (cssH - offsetY) / scale

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    drawGridWorld(worldMinX, worldMaxX, worldMinY, worldMaxY)

    for (const shape of scene.shapes) {
      ctx.fillStyle = shape.fill
      ctx.strokeStyle = shape.stroke
      ctx.lineWidth = 2 / scale
      ctx.fillRect(shape.x, shape.y, shape.w, shape.h)
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h)
    }

    if (scene.selectedId) {
      const sel = scene.shapes.find((s) => s.id === scene.selectedId)
      if (sel) {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 2 / scale
        ctx.strokeRect(sel.x - 3, sel.y - 3, sel.w + 6, sel.h + 6)
      }
    }

    ctx.restore()
  }

  function onWheel(e: WheelEvent): void {
    e.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)
    const prevScale = scale
    const nextScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, scale * Math.exp(-e.deltaY * ZOOM_INTENSITY)),
    )
    if (nextScale === prevScale) {
      return
    }
    scale = nextScale
    offsetX = sx - world.x * scale
    offsetY = sy - world.y * scale
    draw()
  }

  function updatePanCursor(): void {
    if (panPointerId != null) {
      canvas.style.cursor = 'grabbing'
    } else if (spaceHeld) {
      canvas.style.cursor = 'grab'
    } else {
      canvas.style.cursor = ''
    }
  }

  function onPointerDown(e: PointerEvent): void {
    const isMiddle = e.button === 1
    const isSpacePrimary = e.button === 0 && spaceHeld
    if (!isMiddle && !isSpacePrimary) {
      return
    }
    e.preventDefault()
    if (isMiddle) {
      panPointerId = e.pointerId
      panAccumSq = 0
      lastPanClientX = e.clientX
      lastPanClientY = e.clientY
      canvas.setPointerCapture(e.pointerId)
      updatePanCursor()
      return
    }
    pendingSpacePan = {
      pointerId: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
    }
    updatePanCursor()
  }

  function onPointerMove(e: PointerEvent): void {
    if (
      pendingSpacePan != null &&
      e.pointerId === pendingSpacePan.pointerId
    ) {
      const dx = e.clientX - pendingSpacePan.sx
      const dy = e.clientY - pendingSpacePan.sy
      const startDistSq = dx * dx + dy * dy
      if (startDistSq >= SPACE_PAN_START_PX ** 2) {
        pendingSpacePan = null
        panPointerId = e.pointerId
        canvas.setPointerCapture(e.pointerId)
        offsetX += dx
        offsetY += dy
        lastPanClientX = e.clientX
        lastPanClientY = e.clientY
        panAccumSq = startDistSq
        draw()
        updatePanCursor()
      }
      return
    }

    if (panPointerId !== e.pointerId) {
      return
    }
    const dx = e.clientX - lastPanClientX
    const dy = e.clientY - lastPanClientY
    lastPanClientX = e.clientX
    lastPanClientY = e.clientY
    panAccumSq += dx * dx + dy * dy
    offsetX += dx
    offsetY += dy
    draw()
  }

  function endPan(e: PointerEvent): void {
    if (panPointerId !== e.pointerId) {
      return
    }
    canvas.releasePointerCapture(e.pointerId)
    panPointerId = null
    if (e.button === 0 && panAccumSq >= PAN_CLICK_SUPPRESS_PX ** 2) {
      suppressNextClick = true
    }
    updatePanCursor()
  }

  function onPointerUp(e: PointerEvent): void {
    if (
      pendingSpacePan != null &&
      e.pointerId === pendingSpacePan.pointerId
    ) {
      pendingSpacePan = null
      updatePanCursor()
      return
    }
    if (panPointerId === e.pointerId) {
      endPan(e)
    }
  }

  function onPointerCancel(e: PointerEvent): void {
    if (
      pendingSpacePan != null &&
      e.pointerId === pendingSpacePan.pointerId
    ) {
      pendingSpacePan = null
      updatePanCursor()
      return
    }
    if (panPointerId === e.pointerId) {
      canvas.releasePointerCapture(e.pointerId)
      panPointerId = null
      updatePanCursor()
    }
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.code !== 'Space' || e.repeat) {
      return
    }
    const t = e.target as Node | null
    if (t != null && (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement || t instanceof HTMLButtonElement)) {
      return
    }
    e.preventDefault()
    spaceHeld = true
    updatePanCursor()
  }

  function onKeyUp(e: KeyboardEvent): void {
    if (e.code !== 'Space') {
      return
    }
    spaceHeld = false
    pendingSpacePan = null
    updatePanCursor()
  }

  function onWindowBlur(): void {
    spaceHeld = false
    pendingSpacePan = null
    updatePanCursor()
  }

  function onSuppressClick(e: MouseEvent): void {
    if (!suppressNextClick) {
      return
    }
    suppressNextClick = false
    e.preventDefault()
    e.stopImmediatePropagation()
  }

  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerCancel)
  canvas.addEventListener('click', onSuppressClick, true)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onWindowBlur)

  const ro = new ResizeObserver(() => {
    layout()
  })
  ro.observe(container)
  layout()

  function unmount(): void {
    ro.disconnect()
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerCancel)
    canvas.removeEventListener('click', onSuppressClick, true)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onWindowBlur)
    canvas.remove()
  }

  return {
    redraw: draw,
    canvas,
    screenToWorld,
    unmount,
  }
}
