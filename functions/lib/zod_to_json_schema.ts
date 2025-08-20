import { ZodType, toJSONSchema } from 'zod';

export function zodToJsonSchema<T extends ZodType>(
  schema: T
) {
  return toJSONSchema(schema,{
    target: "draft-7"
  });
}