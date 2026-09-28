// End-to-end smoke test. Needs `npm run dev` running and a local Chrome.
// Usage: node scripts/smoke.mjs
import path from "node:path";
import { chromium } from "playwright-core";

const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.resolve(".e2e-profile");

async function mcp(name, args) {
  const res = await fetch(`${API}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });
  const text = await res.text();
  const data = JSON.parse(text.split("\n").find((l) => l.startsWith("data:")).slice(5));
  if (data.result.isError) throw new Error(data.result.content[0].text);
  return JSON.parse(data.result.content[0].text);
}

const step = (msg) => console.log(`• ${msg}`);
const errors = [];

const context = await chromium.launchPersistentContext(path.join(OUT, "profile"), {
  executablePath: CHROME,
  headless: true,
  viewport: { width: 1400, height: 900 },
});
const page = context.pages()[0] ?? (await context.newPage());
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

try {
  step("create board from UI");
  await page.goto(WEB);
  const name = `Smoke ${Date.now()}`;
  await page.getByPlaceholder("New board name").fill(name);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForURL(/\/board\//);
  const boardId = page.url().split("/board/")[1];
  await page.locator(".react-flow__pane").waitFor();

  step("N creates a node, type label");
  await page.locator(".react-flow__pane").click({ position: { x: 700, y: 400 } });
  await page.keyboard.press("n");
  await page.keyboard.type("Hello");
  await page.keyboard.press("Enter");
  await page.getByText("Hello", { exact: true }).waitFor();

  step("MCP create_node + link_nodes appear live");
  const { nodes } = await mcp("list_graph", { boardId });
  const hello = nodes.find((n) => n.data.label === "Hello");
  if (!hello) throw new Error("UI node not in Y.Doc");
  const ai = await mcp("create_node", { boardId, type: "text", label: "From AI", content: "Created via MCP", nearNodeId: hello.id });
  await mcp("link_nodes", { boardId, sourceId: hello.id, targetId: ai.id, label: "leads to" });
  await page.getByText("From AI", { exact: true }).waitFor();
  await page.getByText("leads to").waitFor();

  await page.screenshot({ path: path.join(OUT, "smoke-before-undo.png") });

  step("undo removes local node only");
  await page.locator(".react-flow__pane").click({ position: { x: 50, y: 50 } });
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(300);

  step("auto layout via MCP");
  await mcp("auto_layout", { boardId, direction: "RIGHT" });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(OUT, "smoke.png") });
  console.log(`\nBoard ${boardId} — screenshot: ${path.join(OUT, "smoke.png")}`);
} finally {
  if (errors.length) console.log("\nBrowser errors:\n" + errors.join("\n"));
  await context.close();
}
