import {writeTsFileFn} from "./write-ts-file";
import * as fs from "fs/promises";
import {expect, describe, it, spyOn,jest} from "bun:test";

spyOn(fs, "writeFile");

describe("writeTsFileFn", () => {
    it("should write content to a TypeScript file", async () => {
        const filePath = "test-file.ts";
        const content = "console.log('Hello, world!');";

        await writeTsFileFn({filePath, content});

        expect(fs.writeFile).toHaveBeenCalledWith(filePath, content, "utf8");
    });
});
import { writeTsFileFn } from './write-ts-file';
import { z } from 'zod';
import fs from 'fs/promises';

const writeTsFileParamsSchema = z.object({
    filePath: z.string(),
    content: z.string()
});

describe('writeTsFileFn', () => {
    it('should write content to a TypeScript file', async () => {
        const params = {
            filePath: 'tools/test-file.ts',
            content: 'export const test = () => "Hello, World!";'
        };

        const result = await writeTsFileFn(params);

        expect(result).toBe(`File written to ${params.filePath}`);

        const fileContent = await fs.readFile(params.filePath, 'utf8');
        expect(fileContent).toBe(params.content);

        // Clean up
        await fs.rm(params.filePath);
    });
});
