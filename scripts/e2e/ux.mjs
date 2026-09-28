// Canvas UX: shortcuts, clipboard, grouping, context menu, connect-to-create, resize, images.
// Usage: npm run e2e:ux
import path from "node:path";
import { OUT, WEB, assert, mcp, step, until, withBrowser } from "./lib.mjs";

const PNG_1PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const board = await mcp("create_board", { name: `UX ${Date.now()}` });
const boardId = board.id;
const graph = () => mcp("list_graph", { boardId });
const count = async () => (await graph()).nodes.length;

const a = await mcp("create_node", { boardId, type: "text", label: "A", position: { x: 0, y: 0 } });
const b = await mcp("create_node", { boardId, type: "text", label: "B", position: { x: 480, y: 0 } });

await withBrowser(async (page) => {
  const pane = page.locator(".react-flow__pane");
  const nodeEl = (id) => page.locator(`.react-flow__node[data-id="${id}"]`);
  const clickEmpty = () => pane.click({ position: { x: 20, y: 200 } });

  await page.goto(`${WEB}/board/${boardId}`);
  await nodeEl(a.id).waitFor();

  step("select + Ctrl+D duplicates");
  await nodeEl(a.id).click();
  await page.keyboard.press("Control+d");
  await until(async () => (await count()) === 3, "duplicate");

  step("Ctrl+C / Ctrl+V pastes a copy");
  await nodeEl(b.id).click();
  await page.keyboard.press("Control+c");
  await page.keyboard.press("Control+v");
  await until(async () => (await count()) === 4, "paste");

  step("Delete removes, Ctrl+Z restores, Ctrl+Shift+Z redoes");
  await page.keyboard.press("Delete");
  await until(async () => (await count()) === 3, "delete");
  await clickEmpty();
  await page.keyboard.press("Control+z");
  await until(async () => (await count()) === 4, "undo");
  await page.keyboard.press("Control+Shift+z");
  await until(async () => (await count()) === 3, "redo");

  step("Ctrl+A, Ctrl+G groups; Ctrl+Shift+G ungroups");
  await clickEmpty();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Control+g");
  const grouped = await until(async () => {
    const { nodes } = await graph();
    const group = nodes.find((n) => n.type === "group");
    return group && nodes.filter((n) => n.parentId === group.id).length === 3 ? group : undefined;
  }, "group");
  await page.keyboard.press("Control+Shift+g");
  await until(async () => {
    const { nodes } = await graph();
    return !nodes.some((n) => n.id === grouped.id) && nodes.every((n) => !n.parentId);
  }, "ungroup");

  step("V / H switch tools");
  await page.keyboard.press("h");
  await page.getByRole("button", { name: "Hand", pressed: true }).waitFor();
  await page.keyboard.press("v");
  await page.getByRole("button", { name: "Select", pressed: true }).waitFor();

  step("context menu on pane adds a node");
  await pane.click({ button: "right", position: { x: 1100, y: 700 } });
  await page.getByRole("menuitem", { name: /Add text node/ }).click();
  await page.keyboard.press("Escape");
  await until(async () => (await count()) === 4, "context menu add");

  step("context menu on node deletes it");
  await nodeEl(b.id).click({ button: "right" });
  await page.getByRole("menuitem", { name: /^Delete/ }).click();
  await until(async () => !(await graph()).nodes.some((n) => n.id === b.id), "context delete");

  step("context menu color swatch colors the node");
  await nodeEl(a.id).click({ button: "right", position: { x: 8, y: 8 } });
  await page.getByRole("menuitem", { name: "Color #22c55e" }).click();
  await until(async () => (await graph()).nodes.find((n) => n.id === a.id).data.color === "#22c55e", "color");

  step("double-click on empty canvas creates a node");
  const beforeDbl = await count();
  await pane.dblclick({ position: { x: 1200, y: 150 } });
  await page.keyboard.type("Dbl");
  await page.keyboard.press("Enter");
  await until(async () => (await count()) === beforeDbl + 1, "double-click create");

  // Copies of A overlap it; clear them so pointer tests hit A.
  for (const node of (await graph()).nodes) {
    if (node.id !== a.id) await mcp("delete_node", { boardId, id: node.id });
  }

  step("drag from handle to empty canvas creates a linked node");
  await nodeEl(a.id).click();
  const handle = nodeEl(a.id).locator(".react-flow__handle-bottom");
  const hb = await handle.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + 40, hb.y + 250, { steps: 10 });
  await page.mouse.up();
  await page.keyboard.type("Linked");
  await page.keyboard.press("Enter");
  await until(async () => {
    const { nodes, edges } = await graph();
    const linked = nodes.find((n) => n.data.label === "Linked");
    return linked && edges.some((e) => e.source === a.id && e.target === linked.id);
  }, "connect-to-create");

  step("resize handle changes width");
  await nodeEl(a.id).click();
  const before = (await graph()).nodes.find((n) => n.id === a.id).width;
  const corner = nodeEl(a.id).locator(".react-flow__resize-control.bottom.right");
  const cb = await corner.boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.mouse.down();
  await page.mouse.move(cb.x + 80, cb.y + 40, { steps: 8 });
  await page.mouse.up();
  await until(async () => (await graph()).nodes.find((n) => n.id === a.id).width > before, "resize");

  step("drag moves node");
  const startPos = (await graph()).nodes.find((n) => n.id === a.id).position;
  const box = await nodeEl(a.id).boundingBox();
  await page.mouse.move(box.x + 30, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 130, box.y + 110, { steps: 10 });
  await page.mouse.up();
  await until(async () => (await graph()).nodes.find((n) => n.id === a.id).position.x !== startPos.x, "drag");

  step("drop an image file uploads it and creates an image node");
  await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const file = new File([bytes], "pixel.png", { type: "image/png" });
    const dt = new DataTransfer();
    dt.items.add(file);
    const target = document.querySelector(".react-flow__pane");
    const opts = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: 900, clientY: 300 };
    target.dispatchEvent(new DragEvent("dragover", opts));
    target.dispatchEvent(new DragEvent("drop", opts));
  }, PNG_1PX);
  const image = await until(async () => (await graph()).nodes.find((n) => n.type === "image"), "image drop");
  assert(image.data.url?.includes("/uploads/"), "image url points to uploads");
  const res = await fetch(image.data.url);
  assert(res.ok, "uploaded image is served");

  step("toolbar image button opens a file chooser");
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: "Image" }).click(),
  ]);
  await chooser.setFiles({ name: "pixel2.png", mimeType: "image/png", buffer: Buffer.from(PNG_1PX, "base64") });
  await until(async () => (await graph()).nodes.filter((n) => n.type === "image").length === 2, "image picker");

  await page.screenshot({ path: path.join(OUT, "ux.png") });
  console.log("\nAll UX checks passed.");
});

// KEEP=1 keeps the test board for inspection.
if (!process.env.KEEP) await mcp("delete_board", { boardId });
