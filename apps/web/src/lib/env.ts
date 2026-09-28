/** Browser-visible configuration. See .env.example. */
export const env = {
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:1234",
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, ""),
  authToken: process.env.NEXT_PUBLIC_AUTH_TOKEN || undefined,
} as const;
