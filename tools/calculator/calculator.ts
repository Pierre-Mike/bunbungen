import {z} from "zod";
import {Parser} from "expr-eval";
import {zodFunction} from "../../utils/utils.ts";

const paramsSchema = z.object({
    expression: z.string({
        description: "the expression that will be calculate",
    }),
});
export async function calculatorFn ({
                                       expression,
                                   }: z.infer<typeof paramsSchema>) {
    const parser = new Parser();
    const result = parser.parse(expression).evaluate();
    return { result }
};

export const calculator = zodFunction({
    function: calculatorFn,
    schema: paramsSchema,
    description:
        "Get returns a book's detailed information based on the id of the book. Note that this does not accept names, and only IDs, which you can get by using search.",
})
