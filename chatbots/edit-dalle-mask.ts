import OpenAI from "openai";

import {dalleEdit} from "../tools/dalle-edit/dalle-edit.ts";
import type {ChatCompletionToolRunnerParams} from "openai/lib/ChatCompletionRunner";


const client = new OpenAI();

const body = {
        messages: [
            {
                role: "system",
                content: 'You are here to just provide help yo use the tools you have communicate to the user for feedback and clarification after every major step to ensure alignment.'
            },
            {role: "user", content: "can you help me"}
        ],
        model: "gpt-3.5-turbo",
        stream: true,
        stop: ["TERMINATE"],
        tools: [dalleEdit],
    } as unknown as ChatCompletionToolRunnerParams<any>,

async function main() {
    const runner = client.beta.chat.completions.runTools(body)
    runner.on("message", (message) => console.log('message',message))
        .on("functionCall", (functionCall) => console.log("functionCall", functionCall))
        .on("functionCallResult", (functionCallResult) =>
            console.log("functionCallResult", functionCallResult))
        .on("content", (diff) => process.stdout.write(diff))
        .on('end', () => console.log('end'))
    const finalContent = await runner.finalContent();
    console.log("Final content:", finalContent);
    return finalContent
}

main();
