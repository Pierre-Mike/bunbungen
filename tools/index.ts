import { calculator } from "./calculator/calculator.ts";
import { promptUser } from "./prompt-user/prompt-user.ts";
import { writeTsFile } from "./write-ts-file/write-ts-file.ts";
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import type {FunctionTool} from "openai/resources/beta/assistants";
import {dalleEdit} from "./dalle-edit/dalle-edit.ts";

const tools = new Map<string | undefined, RunnableToolFunctionWithParse<any>>();

const registerTool = (tool: RunnableToolFunctionWithParse<any> ): void => {
  tools.set(tool.function.name, tool);
};

registerTool(calculator);
registerTool(promptUser);
registerTool(writeTsFile);
registerTool(dalleEdit);

export default tools;
