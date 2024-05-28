import OpenAI from "openai";
import {calculator, calculatorFn} from "../tools/calculator/calculator.ts";
import type {Run} from "openai/resources/beta/threads/runs/runs";

const openai = new OpenAI()
export const assistantParams = {
    name: 'instructionMaker ',
    model: 'gpt-3.5-turbo',
    instructions: 'just calculate 9*100',
    tools: [calculator, {type: "code_interpreter"}],
}

const assistant = await openai.beta.assistants.create(assistantParams as any)

let assistantStream = openai.beta.threads.createAndRunStream({
    thread: {messages: [{'role': 'user', content: 'calculate 8*8'}]},
    assistant_id: assistant.id,
    stream: true,
})

let FUNCTIONS_MAP = new Map<string, { 'fn': (args: any) => any }>()
FUNCTIONS_MAP.set(calculatorFn.name, {"fn": calculatorFn})


assistantStream.on('textCreated', (text) => process.stdout.write(`\nassistant text> ${text}\n\n`))
    .on('textDelta', (textDelta, snapshot) => process.stdout.write(`\nassistant textDelta> ${JSON.stringify(textDelta)}\n\n`)
    )
    .on('toolCallCreated', async (toolCall) => {
        process.stdout.write(`\nassistant toolCall> ${JSON.stringify(toolCall)}\n\n`)
        let runThread = assistantStream.currentRun()
        if (!runThread) return
        runThread = await openai.beta.threads.runs.retrieve(runThread.thread_id, runThread.id)
        while (runThread.status in ['queued', 'in_progress']) {
            runThread = await openai.beta.threads.runs.retrieve(runThread.thread_id, runThread.id)
        }
    })
    .on('toolCallDone', async (toolCallDone) => {
        let runThread = assistantStream.currentRun()
        process.stdout.write(`\nassistant toolCallDone> ${JSON.stringify(toolCallDone)} ${runThread?.status}\n\n`)
        if (!runThread) return
        runThread = await openai.beta.threads.runs.retrieve(runThread.thread_id, runThread.id)
        if (runThread.status === 'requires_action') {
            console.log('requires_action')
            console.log("functionCalled : ", runThread?.required_action?.submit_tool_outputs.tool_calls)
            console.log("test : ", JSON.stringify(runThread?.required_action?.submit_tool_outputs.tool_calls))

            const functionCalled = runThread?.required_action?.submit_tool_outputs.tool_calls
                .filter(e => e.type === 'function')
                .map(e => ({name: e.function.name, arguments: JSON.parse(e.function.arguments), toolId: e.id}))

            if (!functionCalled) {
                console.error('#ERROR_MISSING_FUNCTION_CALL : ', functionCalled)
                console.error('#ERROR_MISSING_FUNCTION_CALL + : ', runThread)
                return
            }

            const allResult: Awaited<{
                output: string;
                tool_call_id: string
            }>[] = await Promise.all(functionCalled.map(async e => {
                const functionDefinition = FUNCTIONS_MAP.get(e.name)?.fn
                console.log('finding function : ', functionDefinition)
                if (!functionDefinition) {
                    return {
                        output: `Function "${e.name}" not found. Try again.`,
                        tool_call_id: e.toolId
                    }
                }
                console.log('calling function : ', functionDefinition, ' with params : ', e.arguments)
                const test = await functionDefinition(e.arguments)
                return {
                    output: test,
                    tool_call_id: e.toolId
                }
            }))
            await openai.beta.threads.runs.submitToolOutputs(runThread.thread_id, runThread.id, {
                tool_outputs: allResult
            })
        }
    })
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
        process.stdout.write(`\nassistant toolCallDelta > ${JSON.stringify(toolCallDelta)}\n\n`)
    }).on('error', (error) => {
     console.error(error)
})
    .on('end', () => {
        console.log('end')
    })
    .on('messageDone', (messageDone) => {
        console.log('messageDone:', JSON.stringify(messageDone))
    })
    .on('messageCreated', (messageCreated) => {
        console.log('messageCreated:', JSON.stringify(messageCreated))
    }).on('messageDelta', (messageDelta) => {
      console.log('messageDelta:', JSON.stringify(messageDelta))

    })