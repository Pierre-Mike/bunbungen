import type {JSONSchema} from "openai/lib/jsonschema.mjs";
import type {RunnableToolFunctionWithParse} from "openai/lib/RunnableFunction.mjs";
import type {ZodSchema} from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type {Run, RunStatus} from "openai/resources/beta/threads/runs/runs";
import type {FunctionTool} from "openai/resources/beta/assistants";
import type {FunctionParameters} from "openai/resources/shared.mjs";
import OpenAI from "openai";

export const openai = new OpenAI()


export function zodFunction<T extends object>({
                                                  function: fn,
                                                  schema,
                                                  description = "",
                                              }: {
    function: (args: T) => Promise<any>;
    schema: ZodSchema<T>;
    description?: string;
}): RunnableToolFunctionWithParse<T> {
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

export const transformTOFunctionTool = (params: RunnableToolFunctionWithParse<object>): FunctionTool => {
    return {
        type: "function",
        function: {
            name: params.function.name || params.function.function.name,
            description: params.function.description,
            parameters: params.function.parameters as FunctionParameters,
        },
    };

}

export const waitUntil = async (status: RunStatus[], run: Run | undefined) => {
    if (!run) throw new Error("run not found");
    while (!status.includes(run.status)) {
        // add small dot while waiting
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
    }
    return run;
};
