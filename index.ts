import OpenAI from "openai";
import {calculator, calculatorFn} from "./tools/calculator/calculator";
import content from './promtps/mental-health/mental-health.txt'
import {promptUser} from "./tools/prompt-user/prompt-user.ts";
import type {ChatCompletionToolRunnerParams} from "openai/lib/ChatCompletionRunner";
import type {BaseFunctionsArgs, RunnableToolFunctionWithParse, RunnableTools} from "openai/lib/RunnableFunction.mjs";

const client = new OpenAI();

const body = {
    messages: [
        {role: "system", content},
        {role: "user", content: "can you help me "}],
    model: "gpt-3.5-turbo",
    stream: true,
    tools: [calculator, promptUser],
} as ChatCompletionToolRunnerParams<BaseFunctionsArgs>

async function main() {
    const runner = client.beta.chat.completions.runTools(body)
        .on("message", (message) => console.log(message))
        .on("functionCall", (functionCall) =>
            console.log("functionCall", functionCall)
        )
        .on("functionCallResult", (functionCallResult) =>
            console.log("functionCallResult", functionCallResult)
        )
        .on("content", (diff) => process.stdout.write(diff))

    const finalContent = await runner.finalContent();
    console.log("Final content:", finalContent);
    return finalContent
}

async function getCurrentLocation() {
    return "Boston"; // Simulate lookup
}

async function getWeather(args: { location: string }) {
    const {location} = args;
    // … do lookup …
    return {temperature: 65, precipitation: "light rain"};
}

main();
