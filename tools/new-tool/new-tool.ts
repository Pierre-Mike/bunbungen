import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";

const newToolParamsSchema = z.object({
    input: z.string({
        description: "the input for the new tool",
    }),
});

export async function newToolFn(params: z.infer<typeof newToolParamsSchema>) {
    const result = `Processed: ${params.input}`;
    console.log('newToolFn input: ', params.input);
    console.log('newToolFn result: ', result);
    return result;
}

export const newTool = zodFunction<any>({
    function: newToolFn,
    schema: newToolParamsSchema,
    description: "the input for the new tool",
});
