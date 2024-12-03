import * as tools from '../tools';
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";

export const mapTools = new Map<string, RunnableToolFunctionWithParse<any>>();

export const registerTool = (tool: RunnableToolFunctionWithParse<object>): void => {
    mapTools.set(tool?.function?.name, tool);
};

Object.values(tools).forEach((tool: any) => {
    if (tool?.type === "function") {
        registerTool(tool as RunnableToolFunctionWithParse<any>);
    }
});
