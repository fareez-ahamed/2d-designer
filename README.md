# 2D Designer

A small **React** + **TypeScript** canvas workspace for placing and selecting simple 2D shapes. The drawing surface uses the **Canvas 2D API** (not WebGL): a grid, zoom, pan, and stacked rectangles with hit-testing and selection.

## Features

- **Rectangles** — Add shapes from the sidebar; each new rectangle is offset so they do not stack exactly on top of each other.
- **Selection** — Click a rectangle to select it (top-most wins). The selection is drawn with an amber outline.
- **Clear** — Remove all shapes from the scene from the header.
- **Zoom** — Scroll the mouse wheel over the canvas; zoom is anchored to the cursor.
- **Pan** — Drag with the **middle mouse button**, or hold **Space** and drag with the **primary button** (small movement before drag starts avoids stealing clicks).
- **Grid** — World-space grid for spatial reference while navigating.

## Requirements

- [Node.js](https://nodejs.org/) (current LTS is recommended)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Start the dev server with HMR        |
| `npm run build`| Typecheck (`tsc`) and production build |
| `npm run preview` | Serve the production build locally |

## Project layout

| Path               | Role |
| ------------------ | ---- |
| `src/App.tsx`      | React layout, toolbar, scene ref, click → selection |
| `src/scene.ts`     | Scene model: shapes, `addRectangle`, `clearScene`, `hitTest` |
| `src/canvasView.ts`| Mounts the canvas, transform (pan/zoom), grid, redraw |
| `src/style.css`    | App chrome and controls              |
| `src/main.tsx`     | React entry                          |

The canvas layer is **imperative** (`mountCanvasView`); React owns the shell and passes a `getScene` callback so the view always reads the latest scene without forcing React to drive every frame.

## License

Private project (`"private": true` in `package.json`). Adjust as needed if you publish the repo.
