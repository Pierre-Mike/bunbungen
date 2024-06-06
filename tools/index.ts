import type {RunnableToolFunctionWithParse} from "openai/lib/RunnableFunction.mjs";
import Calculator from './calculator/calculator';
import DalleEdit from './dalle-edit/dalle-edit';
import promptUser from './prompt-user/prompt-user';
import writeTsFile from './write-ts-file/write-ts-file';

export const tools = {Calculator, DalleEdit, promptUser, writeTsFile};

export const mapTools = new Map<string | undefined, RunnableToolFunctionWithParse<any>>();

export const registerTool = (tool: RunnableToolFunctionWithParse<any>): void => {
    mapTools.set(tool.function.name, tool);
};

Object.values(tools).forEach(registerTool);

