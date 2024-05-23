import type { JSONSchema } from "openai/lib/jsonschema.mjs";
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import type { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
export function zodFunction<T extends object>({
                                         function: fn,
                                         schema,
                                         description = '',
                                       }: {
  function: (args: T) => Promise<object>;
  schema: ZodSchema<T>;
  description?: string;
}): RunnableToolFunctionWithParse<T> {
  return {
    type: 'function',
    function: {
      function: fn,
      name: fn.name,
      description: description,
      parameters: zodToJsonSchema(schema) as JSONSchema,
      parse(input: string): T {
        const obj = JSON.parse(input);
        return schema.parse(obj);
      },
    },
  };
}
