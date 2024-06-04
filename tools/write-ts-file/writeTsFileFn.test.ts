import { writeTsFileFn } from "./write-ts-file";
import * as fs from "fs/promises";
import { jest } from "@jest/globals";

jest.mock("fs/promises");

describe("writeTsFileFn", () => {
    it("should write content to a TypeScript file", async () => {
        const filePath = "test-file.ts";
        const content = "console.log('Hello, world!');";

        await writeTsFileFn({ filePath, content });

        expect(fs.writeFile).toHaveBeenCalledWith(filePath, content, "utf8");
    });
});
