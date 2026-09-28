import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const ok = (value: unknown): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

export const fail = (message: string): CallToolResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});

/** Turns thrown errors into MCP tool errors instead of protocol errors. */
export function safely<A>(handler: (args: A) => Promise<CallToolResult>) {
  return async (args: A): Promise<CallToolResult> => {
    try {
      return await handler(args);
    } catch (error) {
      return fail(error instanceof Error ? error.message : String(error));
    }
  };
}
