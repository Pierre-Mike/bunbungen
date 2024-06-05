import { promises as fs } from 'fs';
import { z } from 'zod';

const createToolParamsSchema = z.object({
    toolName: z.string(),
    content: z.string(),
});

export async function createToolFn(params: z.infer<typeof createToolParamsSchema>) {
    const dirPath = `tools/${params.toolName}`;
    const filePath = `${dirPath}/${params.toolName}.ts`;
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, params.content, "utf8");
    console.log(`createToolFn: Created tool at ${filePath}`);
    return `Tool created at ${filePath}`;
}
