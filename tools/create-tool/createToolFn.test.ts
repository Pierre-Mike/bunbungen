import { createToolFn } from './create-tool';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn(),
        writeFile: jest.fn(),
    },
}));

describe('createToolFn', () => {
    it('should create a new tool with the given name and content', async () => {
        const params = {
            toolName: 'new-tool',
            content: 'export function newTool() { console.log("New Tool"); }',
        };

        const result = await createToolFn(params);
        expect(result).toBe('Tool created at tools/new-tool/new-tool.ts');
        expect(fs.mkdir).toHaveBeenCalledWith('tools/new-tool', { recursive: true });
        expect(fs.writeFile).toHaveBeenCalledWith('tools/new-tool/new-tool.ts', params.content, 'utf8');
    });
});
import { createToolFn } from './create-tool';
import { z } from 'zod';
import fs from 'fs/promises';

const createToolParamsSchema = z.object({
    toolName: z.string(),
    content: z.string()
});

describe('createToolFn', () => {
    it('should create a new tool file with the specified content', async () => {
        const params = {
            toolName: 'test-tool',
            content: 'export const testTool = () => "Hello, World!";'
        };

        const result = await createToolFn(params);
        const filePath = `tools/${params.toolName}/${params.toolName}.ts`;

        expect(result).toBe(`Tool created at ${filePath}`);

        const fileContent = await fs.readFile(filePath, 'utf8');
        expect(fileContent).toBe(params.content);

        // Clean up
        await fs.rm(`tools/${params.toolName}`, { recursive: true, force: true });
    });
});
