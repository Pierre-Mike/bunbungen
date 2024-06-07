import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";
import * as fs from "fs/promises";

const writeTsFileParamsSchema = z.object({
    filePath: z.string({
        description: "The path of the TypeScript file to write",
    }),
    content: z.string({
        description: "The content to write to the TypeScript file",
    }),
});

export async function writeTsFileFn(params: z.infer<typeof writeTsFileParamsSchema>) {
    await fs.writeFile(params.filePath, params.content, "utf8");
    console.log(`writeTsFileFn: Wrote to ${params.filePath}`);
    return `File written to ${params.filePath}`;
}

export default zodFunction<any>({
    function: writeTsFileFn,
    schema: writeTsFileParamsSchema,
    description: "Writes content to a TypeScript file",
});

