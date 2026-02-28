# whitebroawd

A visual workspace for organizing browser tabs, bookmarks, and notes on an infinite canvas — powered by a Chrome extension that captures your browsing directly into the board.

---

## What it is

**whitebroawd** is a local-first, visual tab manager. Instead of piling up bookmarks or browser tabs, you drop them onto a canvas, organize them into rooms, connect them, and annotate them with sticky notes.

- **Canvas** — infinite, zoomable workspace built with ReactFlow
- **Rooms** — 4 separate spaces (Living Room, Kitchen, Bedroom, Toilet) to separate contexts
- **Bookmarks** — captured from your browser via the Chrome extension, with screenshots and metadata
- **Notes** — sticky notes you can paste or create freely
- **Groups** — container frames to cluster related items
- **Tags** — label captures for quick filtering

---

## Structure

```
whitebroawd/
├── packages/
│   ├── web/          # Next.js 14 app (the canvas)
│   ├── extension/    # Chrome extension (tab capture)
│   └── shared/       # Shared TypeScript types
```

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- Google Chrome

### 1. Install dependencies

```bash
npm install
```

### 2. Run the web app

```bash
npm run web:dev
```

Opens at `http://localhost:3000`

### 3. Load the Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `packages/extension/dist` folder
5. Pin **Whitebroawd Capture** to your toolbar

---

## Using the extension

Once installed, the extension popup appears when you click the icon in your Chrome toolbar.

| Action | What it does |
|---|---|
| **Capture tab** | Saves the current tab (screenshot + metadata) to the canvas |
| **Capture All** | Saves all open tabs in the current window |
| **Open App** | Opens the whitebroawd canvas |

Captured tabs appear on the canvas automatically within a few seconds.

---

## Using the canvas

| Interaction | Action |
|---|---|
| Drag | Pan the canvas |
| Scroll | Zoom in/out |
| Paste a URL | Creates a bookmark node |
| Paste text | Creates a sticky note |
| Drag node into group | Attaches it to the group |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |

Use the **toolbar** at the bottom to switch rooms, add notes, auto-arrange nodes, and more.

---

## Tech stack

| Layer | Tech |
|---|---|
| Web app | Next.js 14, React 18, TypeScript |
| Canvas | ReactFlow 11 |
| State | Zustand (persisted to localStorage) |
| Styling | Tailwind CSS, Outfit font |
| Extension | Webpack 5, React 18, Chrome Manifest v3 |

---

## Build

```bash
# Build the web app
npm run web:build

# Build the extension
npm run extension:build
```

After building the extension, reload it in `chrome://extensions`.

---

## Development notes

- All data is stored locally in `localStorage` — no backend, no account needed
- The extension communicates with the web app via custom DOM events (`WHITEBOARD_SYNC_REQUEST` / `WHITEBOARD_SYNC_RESPONSE`)
- Extension detection works by the content script setting `data-whiteboard-ext="true"` on the `<html>` element — the web app reads this on first load to show install status in the intro screen
- The intro screen only appears once per browser (tracked via `hasSeenIntro` in localStorage)

---

## Reset

To reset all data and see the intro again, run in the browser console:

```js
localStorage.removeItem('whitebroawd-storage')
location.reload()
```
