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

  step("add_graph builds a subgraph linked to existing nodes, then lays out");
  const { ids } = await mcp("add_graph", {
    boardId,
    nodes: [
      { ref: "act1", type: "group", label: "Act I" },
      { ref: "call", label: "Call to adventure", content: "A letter arrives.", parent: "act1" },
      { ref: "refuse", label: "Refusal", parent: "act1" },
      { ref: "mentor", label: "Meeting the mentor", color: "#f59e0b" },
    ],
    edges: [
      { from: ai.id, to: "call", label: "then" },
      { from: "call", to: "refuse" },
      { from: "refuse", to: "mentor" },
    ],
    layout: "RIGHT",
  });
  await page.getByText("Meeting the mentor").waitFor();
  const graph = await mcp("list_graph", { boardId });
  if (graph.nodes.find((n) => n.id === ids.call)?.parentId !== ids.act1) throw new Error("parent not set");

  step("group_nodes via MCP");
  await mcp("group_nodes", { boardId, ids: [hello.id, ai.id], label: "Intro" });
  await page.getByText("Intro").waitFor();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(OUT, "smoke.png") });
  console.log(`\nScreenshot in ${OUT}`);
  // KEEP=1 keeps the test board for inspection.
  if (!process.env.KEEP) await mcp("delete_board", { boardId });
});
