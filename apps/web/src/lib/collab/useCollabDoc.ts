"use client";

import { useEffect, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { env } from "@/lib/env";

export type CollabStatus = "connecting" | "connected" | "disconnected" | "unauthorized";

export interface CollabDoc {
  doc: Y.Doc;
  provider: HocuspocusProvider;
}

/** Connects a fresh Y.Doc to the sync server. Returns null until the first sync. */
export function useCollabDoc(name: string) {
  const [collab, setCollab] = useState<CollabDoc | null>(null);
  const [status, setStatus] = useState<CollabStatus>("connecting");

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: env.wsUrl,
      name,
      document: doc,
      token: env.authToken ?? "",
      onStatus: ({ status }) => setStatus(status as CollabStatus),
      onAuthenticationFailed: () => setStatus("unauthorized"),
      onSynced: ({ state }) => {
        if (state) setCollab({ doc, provider });
      },
    });

    return () => {
      provider.destroy();
      doc.destroy();
      setCollab(null);
    };
  }, [name]);

  return { collab, status };
}
