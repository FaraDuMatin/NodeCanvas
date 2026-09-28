import { env } from "@/lib/env";

/** Uploads an image file to the server. Returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${env.apiUrl}/upload`, {
    method: "POST",
    body,
    headers: env.authToken ? { Authorization: `Bearer ${env.authToken}` } : undefined,
  });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const { url } = (await res.json()) as { url: string };
  return url;
}

export const isImageFile = (file: File) => file.type.startsWith("image/");
