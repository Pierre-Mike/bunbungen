import OpenAI from "openai";
import content from '../promtps/create-prompt_v2.txt'
import {promptUser} from "../tools/prompt-user/prompt-user.ts";
import type {ChatCompletionToolRunnerParams} from "openai/lib/ChatCompletionRunner";
import type {BaseFunctionsArgs} from "openai/lib/RunnableFunction.mjs";


const client = new OpenAI();

const body = {
    messages: [
        {role: "system", content},
        {role: "user", content: "can you help me"}],
    model: "gpt-3.5-turbo",
    stream: true,
    stop:["TERMINATE"],
    tools: [promptUser],
} as ChatCompletionToolRunnerParams<BaseFunctionsArgs>

async function main() {
    const runner = client.beta.chat.completions.runTools(body as any)
        .on("message", (message) => console.log(message))
        .on("functionCall", (functionCall) => console.log("functionCall", functionCall))
        .on("functionCallResult", (functionCallResult) =>
            console.log("functionCallResult", functionCallResult))
        .on("content", (diff) => process.stdout.write(diff))

    const finalContent = await runner.finalContent();
    console.log("Final content:", finalContent);
    return finalContent
}

main();
