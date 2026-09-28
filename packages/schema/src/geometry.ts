import { z } from "zod";

export const PositionSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});
export type Position = z.infer<typeof PositionSchema>;

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});
export type Size = z.infer<typeof SizeSchema>;
