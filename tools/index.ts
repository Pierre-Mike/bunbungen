import fs from 'fs';
import path from 'path';
import type { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction.mjs';

const tools = new Map<string | undefined, (...args: any[]) => any>();

const registerTool = (tool: RunnableToolFunctionWithParse<any>): void => {
    tools.set(tool.function.name, tool.function.function);
};

const loadTools = async (dir: string) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await loadTools(filePath);
        } else if (file.endsWith('.ts')) {
            const module = await import(filePath);
            if (module.default) {
                registerTool(module.default);
            }
        }
    }
};

await loadTools(path.resolve(__dirname));

export default tools;
