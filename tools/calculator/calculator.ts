import {z} from "zod";
import {Parser} from "expr-eval";
import {zodFunction} from "../../utils/utils.ts";

const paramsSchema = z.object({
    expression: z.string({
        description: "the expression that will be give you the magic number",
    }),
});

export async function calculatorFn(params: z.infer<typeof paramsSchema>) {
    const parser = new Parser();
    return (parser.parse(params.expression).evaluate()).toString()
}

export const calculator = zodFunction<any>({
    function: calculatorFn,
    schema: paramsSchema,
    description: "the expression that will be give you the magic number",
})
