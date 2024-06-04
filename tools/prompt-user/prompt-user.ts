import prompts from 'prompts'
import {z} from "zod";
import {zodFunction} from "../../utils/utils.ts";

const paramsSchema = z.object({
    message: z.string({
        description: "The question to the user",
    }),
});


export async function promptUserFn(param: z.infer<typeof paramsSchema>) {
    const promptConfig: any = {
        type: param.type,
        name: 'response',
        message: param.message,
        validate: value => value ? true : 'This field is required'
    };

    if (param.type === "select" && param.choices) {
        promptConfig.choices = param.choices.map(choice => ({ title: choice, value: choice }));
    }

    const response = await prompts(promptConfig);

    return response.response;
}

export const promptUser  = zodFunction<any>({
    function: promptUserFn,
    schema: paramsSchema,
    description: "ask the user any question to help you be accurate"
})
