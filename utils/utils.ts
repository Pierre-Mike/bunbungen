import type { JSONSchema } from "openai/lib/jsonschema.mjs";
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import type { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type { Run, RunStatus } from "openai/resources/beta/threads/runs/runs";
import { openai } from "../index.ts";
import type {FunctionTool} from "openai/resources/beta/assistants";
export function zodFunction<T extends object>({
  function: fn,
  schema,
  description = "",
}: {
  function: (args: T) => Promise<any>;
  schema: ZodSchema<T>;
  description?: string;
}): FunctionTool | RunnableToolFunctionWithParse<T> {
  return {
    type: "function",
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

export const waitUntil = async (status: RunStatus[], run: Run | undefined) => {
  if (!run) throw new Error("run not found");
  while (!status.includes(run.status)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
  }
  return run;
};
