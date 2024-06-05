import { calculator } from "./calculator/calculator.ts";
import { promptUser } from "./prompt-user/prompt-user.ts";
import { writeTsFile } from "./write-ts-file/write-ts-file.ts";
import { createToolFn } from "./create-tool/create-tool.ts";
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";

const tools = new Map<string | undefined, RunnableToolFunctionWithParse<any>>();

const registerTool = (tool: RunnableToolFunctionWithParse<any>): void => {
  tools.set(tool.function.name, tool);
};

registerTool(calculator);
registerTool(promptUser);
registerTool(writeTsFile);

export default tools;
