// Shared helpers for the end-to-end scripts. Needs `npm run dev` and a local Chrome.
import path from "node:path";
import { chromium } from "playwright-core";

export const WEB = process.env.WEB_URL ?? "http://localhost:3000";
export const API = process.env.API_URL ?? "http://localhost:3001";
export const OUT = path.resolve(".e2e-profile");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** Calls an MCP tool and returns its parsed JSON result. */
export async function mcp(name, args = {}) {
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

export const step = (msg) => console.log(`• ${msg}`);

export function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

/** Polls `fn` until it returns truthy or times out. */
export async function until(fn, message, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await fn();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Timed out: ${message}`);
}

/** Launches Chrome, runs `fn(page)`, prints browser errors, always closes. */
export async function withBrowser(fn) {
  const context = await chromium.launchPersistentContext(path.join(OUT, "profile"), {
    executablePath: CHROME,
    headless: process.env.HEADED ? false : true,
    viewport: { width: 1400, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = context.pages()[0] ?? (await context.newPage());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
  try {
    await fn(page);
  } finally {
    await context.close();
    if (errors.length) {
      console.log("\nBrowser errors:\n" + errors.join("\n"));
      process.exitCode = 1;
    }
  }
}
