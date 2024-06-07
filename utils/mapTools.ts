import * as tools from '../tools'
import type {RunnableToolFunctionWithParse} from "openai/lib/RunnableFunction.mjs";

export const mapTools = new Map<string | undefined, RunnableToolFunctionWithParse<any>>();

export const registerTool = (tool: RunnableToolFunctionWithParse<any>): void => {
    mapTools.set(tool.function.name, tool);
};

Object.values(tools).forEach((tool) => {
    // @ts-ignore
    if (tool?.type === "function") {
        // @ts-ignore
        registerTool(tool);
    }
});