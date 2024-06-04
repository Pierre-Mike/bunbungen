import prompts from 'prompts'
import {z} from "zod";
import {zodFunction} from "../../utils/utils.ts";

const paramsSchema = z.object({
    message: z.string({
        description: "The question to the user",
    }),
});

export async function promptUserFn(param: z.infer<typeof paramsSchema>) {
    return await prompts({
        type: 'text',
        name: 'message',
        message: param.message,
    })
}

export const promptUser  = zodFunction<any>({
    function: promptUserFn,
    schema: paramsSchema,
    description: "ask the user any question to help you be accurate"
})
