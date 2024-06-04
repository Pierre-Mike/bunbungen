import { createToolFn } from './create-tool';
import fs from 'fs/promises';
import {describe, expect, it, jest} from "bun:test";

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
