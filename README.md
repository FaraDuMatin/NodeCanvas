# Node Canvas

Infinite canvas for linked nodes (stories, systems, …). Figma-like editing in the browser, and an MCP server so an AI can edit the same canvas live.

## Run

```bash
npm install
npm run dev
```

- Web: http://localhost:3000
- Yjs sync: ws://localhost:1234
- MCP: http://localhost:3001/mcp
- Uploads: http://localhost:3001/upload

Copy `.env.example` to `.env` to change ports or enable auth. Data is stored in `data/` (SQLite + uploaded images).

## Connect Claude (MCP)

```bash
claude mcp add --transport http node-canvas http://localhost:3001/mcp
```

With `AUTH_TOKEN` set, add `--header "Authorization: Bearer <token>"`.

Tools: `list_boards`, `create_board`, `list_graph`, `create_node`, `update_node`, `delete_node`, `link_nodes`, `unlink`, `add_image`, `auto_layout`, `add_graph` (bulk create), `group_nodes`.

## Shortcuts

| Key | Action |
|---|---|
| V / H | Select / hand tool |
| N | New text node |
| Space + drag | Pan |
| Ctrl/⌘ + Z, Ctrl/⌘ + Shift + Z | Undo / redo |
| Ctrl/⌘ + C / X / V | Copy / cut / paste (nodes, images, text) |
| Ctrl/⌘ + D | Duplicate |
| Ctrl/⌘ + G, Ctrl/⌘ + Shift + G | Group / ungroup |
| Ctrl/⌘ + A | Select all |
| Delete / Backspace | Delete selection |
| Double-click | Edit text |

Drag from a node's handle to empty canvas to create a linked node. Drop or paste images onto the canvas.

## Tests

With `npm run dev` running and Chrome installed:

```bash
npm run e2e:smoke
npm run e2e:ux
```
