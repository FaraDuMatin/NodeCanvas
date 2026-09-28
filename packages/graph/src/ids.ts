import { customAlphabet } from "nanoid";

/** Short, URL-safe ids. Easy for humans and AI clients to copy. */
export const newId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);
