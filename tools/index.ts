import { calculator } from './calculator/calculator.ts';
import { promptUser } from './prompt-user/prompt-user.ts';
import type { RunnableToolFunctionWithParse } from 'openai/lib/RunnableFunction.mjs';

const tools = new Map<string | undefined, (...args: any[]) => any>();

const registerTool = (tool: RunnableToolFunctionWithParse<any>): void => {
    tools.set(tool.function.name, tool.function.function);
};

registerTool(calculator);
registerTool(promptUser);

export default tools;
