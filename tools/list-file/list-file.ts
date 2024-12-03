import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const listFilesParamsSchema = z.object({});
type ListFilesParams = z.infer<typeof listFilesParamsSchema>;

export async function listFileFn(_:ListFilesParams) {
    const {stdout, stderr}  = await exec("git ls-files")
    console.log(stdout)
    console.error(stderr)
    return JSON.stringify({stdout, stderr })
}
export const listFile = zodFunction<ListFilesParams>({
    function: listFileFn,
    schema: listFilesParamsSchema,
    description: "list all files in the current git repository",
});
