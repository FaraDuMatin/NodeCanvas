# CLAUDE.md — Node Canvas

## Communication style
- Be extremely concise. Answer only what was asked.
- Yes/no questions: answer yes or no, plus at most one short line if critical.
- No preamble, no recap, no summary of what you did unless asked.
- No fluff, no opinions, no filler, no subjective language.
- Max 1-2 short sentences per point. Few words per sentence.
- Don't add extra details (sizes, specs, caveats) unless they change the answer.
- After answering, stop and wait for feedback.
- The user should never need more than 30 seconds to read a response.

## Goal
Infinite-canvas app to create nodes and link them (stories, systems, etc.).
Figma-level UX. Images on canvas, resizable. Controllable by an AI through an MCP server.

## Stack
| Part | Choice |
|---|---|
| Frontend | NextJS + React + TypeScript |
| Canvas | React Flow (`@xyflow/react`) |
| UI | Tailwind + shadcn/ui, Framer Motion |
| Shared state | Yjs (single source of truth for nodes/edges) |
| Sync server | Hocuspocus (`@hocuspocus/server`) |
| MCP server | `@modelcontextprotocol/sdk`, same Node process as Hocuspocus |
| Auto-layout | ELK.js |
| Validation | Zod |

## Architecture
```
Browser (React Flow) <-- WebSocket (Yjs) --> Node server (Hocuspocus + Y.Doc)
                                                   ^
AI client (Claude) --- MCP (Streamable HTTP) ------+
```
- MCP tools edit the Y.Doc on the server. Changes appear live in the browser.
- Browser edits also go through the Y.Doc. No separate REST state.

## Repo layout
```
apps/web/        Next.js + React Flow app (features/boards, features/canvas)
apps/server/     Hocuspocus + MCP server + image uploads
packages/schema/ Zod types for Node, Edge, Board (shared)
packages/graph/  Y.Doc operations shared by web + MCP (create/link/group/layout)
scripts/         smoke.mjs: end-to-end test (Playwright + local Chrome)
```

## Canvas features (Figma-like UX)
- Infinite canvas: pan (space + drag, trackpad), zoom to cursor, minimap.
- Multi-select: drag box, shift+click.
- Snap to grid + alignment guides (helper lines) while dragging.
- Resize any node: `NodeResizer`; shift keeps aspect ratio.
- Undo/redo: `Y.UndoManager`.
- Copy/paste/duplicate, delete, group.
- Keyboard shortcuts: V select, H hand, N new node, Cmd+Z, Cmd+D, Cmd+G.
- Context menu on node, edge, canvas.
- Inline text editing on double-click.
- Connect by dragging from handle; drop on empty canvas creates a linked node.
- Auto-layout button (ELK.js).

## Images
- Add by drag-and-drop, paste from clipboard, or upload button.
- Upload to server (`POST /upload`), store file, node holds the URL.
- Image node = custom node + `NodeResizer` (aspect ratio locked by default).

## MCP tools
| Tool | Input |
|---|---|
| `list_boards` | none |
| `create_board` | name |
| `list_graph` | boardId |
| `create_node` | boardId, type, label, content?, color?, position?, size?, nearNodeId?, parentId? |
| `update_node` | boardId, id, fields |
| `delete_node` | boardId, id |
| `link_nodes` | boardId, sourceId, targetId, label? |
| `unlink` | boardId, edgeId |
| `add_image` | boardId, url, label?, position?, size?, nearNodeId? |
| `auto_layout` | boardId, direction? |
- Validate all inputs with Zod.
- Position optional: place near related node if omitted.

## Build order
1. Monorepo + Hocuspocus server + React Flow canvas synced via Yjs.
2. Custom nodes (text, image), edges, resize.
3. UX: selection, snapping, guides, shortcuts, undo/redo, context menu.
4. Image upload.
5. MCP server + tools. Test with MCP Inspector, then Claude.
6. Auto-layout, polish, animations.

## Boards, auth, ports
- Multiple boards. Registry in Y.Doc `__boards__`; each board in Y.Doc `board:<id>`. Persisted in SQLite (`data/`).
- Optional auth: set `AUTH_TOKEN` (+ `NEXT_PUBLIC_AUTH_TOKEN`). Unset = no auth.
- Ports: web 3000, Yjs WS 1234, MCP + uploads 3001 (`/mcp`, `/upload`).

## Rules
- Read CLAUDE.md first every session.
- Update "Progress log" at the end of every task: done, works, next.
- Stay inside this directory. Never touch files outside it.
- Git: never add "Co-Authored-By: Claude" (or any Claude attribution) to commits, PRs, or pushes.

## Progress log
- 2026-09-27 — Steps 1-2 done. Monorepo (npm workspaces), server (Hocuspocus v4 + SQLite, MCP stateless HTTP, uploads), Next 16 canvas synced via Yjs. Text/image/group nodes, floating labeled edges, resize. UX (step 3) code written: helper lines, shortcuts, undo, clipboard, context menu, grouping, connect-to-create. Works: smoke test passes (UI create, MCP create/link/layout live). Next: manually verify step 3 UX, then image upload.