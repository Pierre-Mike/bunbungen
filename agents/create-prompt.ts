import content from '../promtps/create-prompt_v2.txt'
import OpenAI from "openai";
import {calculator, calculatorFn} from "../tools/calculator/calculator.ts";

const openai = new OpenAI()
export const assistantParams = {
    name: 'instructionMaker ',
    model: 'gpt-3.5-turbo',
    instructions: content,
    tools: [calculator, {type: "code_interpreter"}],
}

const assistant = await openai.beta.assistants.create(assistantParams as any)

let runThread2 = await openai.beta.threads.createAndRunStream({
    thread: {messages: [{'role': 'user', content: 'calculate 8*8'}]},
    assistant_id: assistant.id,
    stream: true,
})


runThread2.on('textCreated', (text) => process.stdout.write('\nassistant > '))
    .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
    .on('toolCallCreated', (toolCall) => {
        process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
        if (toolCall.type==='function'){
            return calculatorFn({expression: toolCall.function.arguments})
        }
    })
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
        if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
                process.stdout.write(toolCallDelta.code_interpreter.input);
            }
            if (toolCallDelta.code_interpreter.outputs) {
                process.stdout.write('\noutput >\n');
                toolCallDelta.code_interpreter.outputs.forEach((output) => {
                    if (output.type === 'logs') {
                        process.stdout.write(`\n${output.logs}\n`);
                    }
                });
            }
        }
    });



