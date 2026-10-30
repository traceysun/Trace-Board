# Trace architecture workspace

A buildless, browser-local SVG whiteboard inspired by visual collaboration boards, with architecture drawing and reference tracing tools.

[Open the hosted workspace](https://trace-architecture-studio-tb.suntracey2002.chatgpt.site/).

## Run locally

No installation or build is required. From the repository root:

```sh
python3 -m http.server 8000 --directory dist
```

Open [localhost:8000](http://localhost:8000) in a browser. Node.js is only needed for the optional checks below.

The Sites project identity and static directory are stored in `.openai/hosting.json`.

## Included

- Zoomable canvas, dot grid, space-to-pan, minimap, frames, and frame presentation.
- Multiple named boards, stars, templates, search, and project import/export.
- Walls, freehand pen, room boxes with areas, dimensions, rectangles, ellipses, doors, windows, straight arrows, and elbow connectors.
- Furniture stamps: sofas, beds, tables, desks, plants, and trees.
- Move, resize, multiselect, duplicate, copy/paste, align, group, order, lock, undo, and redo.
- Sticky notes, editable text, personal pinned comments, replies, and resolution.
- Image reference import, opacity, fade while drawing, layer visibility, and geometric sketch cleanup.
- SVG and PNG export; JSON Trace projects preserve references, comments, and layers.

## Persistence and limits

Boards are stored under `trace-workspace-v2` in the browser's localStorage. An existing `trace-v1` drawing is preserved as a separate board during migration. Trace project exports provide a portable backup. Images may exceed browser storage limits; the save status reports this and a project can still be exported.

There is no live multiuser editing, cloud sync, automatic image recognition, PDF/DWG import, or building-code validation. Cleanup simplifies and snaps hand-drawn marks into connected vector segments; it does not infer geometry from the image. Dimensions and areas depend on the user's configured scale.

## Checks

Run `node --check dist/app.js`, `node --check dist/core.js`, and `node tests/geometry.cjs`.
The geometry checks cover connected sketch cleanup, resizing mixed selections, degenerate horizontal geometry, and marquee containment.
