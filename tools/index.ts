import {calculator} from './calculator/calculator.ts'
import {promptUser} from './prompt-user/prompt-user.ts'
import type {RunnableToolFunctionWithParse} from "openai/lib/RunnableFunction.mjs";

const tools = new Map<string|undefined, (...arg: any[]) => any>();

const addToTools = (tool :  RunnableToolFunctionWithParse<any>) => {
    tools.set(tool.function.name, tool.function.function)

}
addToTools(calculator)
addToTools(promptUser)

export default tools