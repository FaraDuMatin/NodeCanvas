// UI + MCP live sync. Usage: npm run e2e:smoke
import path from "node:path";
import { OUT, WEB, mcp, step, withBrowser } from "./lib.mjs";

await withBrowser(async (page) => {
  step("create board from UI");
  await page.goto(WEB);
  await page.getByPlaceholder("New board name").fill(`Smoke ${Date.now()}`);
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

  step("auto layout via MCP");
  await mcp("auto_layout", { boardId, direction: "RIGHT" });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(OUT, "smoke.png") });
  console.log(`\nBoard ${boardId} — screenshot in ${OUT}`);
});
