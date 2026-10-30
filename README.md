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

## Precision drawing and double walls

Open **Architecture studio → Draw**, or choose the **Wall** tool and its **Precision** button.

- Choose drag input or click two points. Connected walls continue from the last endpoint; press Escape to finish.
- Snap to existing endpoints and a configurable grid. Choose free, 15°, 45°, or 90° angle increments; Shift temporarily locks 90°.
- Enter an exact length and/or angle before drawing. Angles use 0° to the right and 90° upward. Exact constraints take precedence over grid and endpoint snaps.
- Select a segment to drag either endpoint, or edit its length, angle, and endpoint coordinates in **Object**.
- Choose single-line or double-line walls. The three physical wall widths are 4″, 6″, and 8″. Matching double-wall corners receive mitered joins; branched junctions retain independent faces.
- Wall outline weight is separate from physical width. New drawing strokes default to 2 px. Presets of 1, 1.5, and 2 px keep outlines light.
- Print-scale lineweights use ½″ = 1′ → 2 px. Smaller print scales use thinner strokes. **Apply thin weights to drawing** updates existing editable drawing strokes and supports Undo.

Calibrate pixels to a known real-world distance in **Trace** before relying on dimensions or wall widths. A print-scale annotation alone does not establish an uploaded image's pixel scale. Stroke weights are expressed at 100% board zoom and are retained in SVG exports.

## Persistence and limits

Boards are stored under `trace-workspace-v2` in the browser's localStorage. An existing `trace-v1` drawing is preserved as a separate board during migration. Trace project exports provide a portable backup. Images may exceed browser storage limits; the save status reports this and a project can still be exported.

There is no live multiuser editing, cloud sync, automatic image recognition, PDF/DWG import, or building-code validation. Cleanup simplifies and snaps hand-drawn marks into connected vector segments; it does not infer geometry from the image. Dimensions and areas depend on the user's configured scale.

## Checks

Run `node --check dist/app.js`, `node --check dist/core.js`, `node tests/geometry.cjs`, and `node tests/precision.cjs`.
The checks cover connected sketch cleanup, mixed-selection resize, exact constraints, angle locks, endpoint magnets, parallel wall faces, mitered corners, scale conversion, and thin weights.
