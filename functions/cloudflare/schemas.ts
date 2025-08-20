import { z } from 'zod';
import { zodToJsonSchema } from '../lib/zod_to_json_schema.ts';

export const requestSchema = z.object({
  token: z.string(),
});
export const responseSchema = z.object({
  token: z.string(),
});

export type Request = z.infer<typeof requestSchema>;
export type Response = z.infer<typeof responseSchema>;
export const requestJsonSchema = zodToJsonSchema(requestSchema);
export const responseJsonSchema = zodToJsonSchema(responseSchema);


