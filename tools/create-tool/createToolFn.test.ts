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
