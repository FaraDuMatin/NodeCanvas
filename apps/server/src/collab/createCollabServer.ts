import { Server } from "@hocuspocus/server";
import { SQLite } from "@hocuspocus/extension-sqlite";
import { config } from "../config";

export function createCollabServer() {
  return new Server({
    port: config.wsPort,
    address: config.host,
    quiet: true,
    extensions: [new SQLite({ database: config.databaseFile })],
    ...(config.authToken
      ? {
          async onAuthenticate({ token }: { token: string }) {
            if (token !== config.authToken) throw new Error("Not authorized");
          },
        }
      : {}),
  });
}

export type CollabServer = ReturnType<typeof createCollabServer>;
