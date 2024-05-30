import OpenAI from "openai";
import {calculator, calculatorFn} from "../tools/calculator/calculator.ts";
import type {RunStatus} from "openai/resources/beta/threads/runs/runs";
import type {Run} from "openai/resources/beta/threads/runs/runs";
import type {Thread} from "openai/resources/beta/threads/threads";

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

const waitWhileIn = async (status: RunStatus[], run: Run) => {
    if (!run) throw new Error('run not found')
    while (status.includes(run.status)) {
        console.log('waiting for :', status)
        console.log('current for', run.status)
        run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id)
    }
    return run
}

const waitUntil = async (status: RunStatus[], run: Run | undefined) => {
    if (!run) throw new Error('run not found')
    while (!status.includes(run.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`waitUntil ${status} != ${run.status}`)
        run = await openai.beta.threads.runs.retrieve(run.thread_id, run.id)
    }
    return run
}

assistantStream
    .on('toolCallDone', async (toolCallDone) => {
        let run = await waitUntil(['requires_action'], assistantStream.currentRun())
        const functionCalled = run?.required_action?.submit_tool_outputs.tool_calls
            .filter(e => e.type === 'function')
            .map(e => ({name: e.function.name, arguments: JSON.parse(e.function.arguments), toolId: e.id}))

        if (!functionCalled) {
            console.error('#ERROR_MISSING_FUNCTION_CALL : ', functionCalled)
            console.error('#ERROR_MISSING_FUNCTION_CALL + : ', run)
            return
        }
        const allResult: Awaited<{
            output: string;
            tool_call_id: string
        }>[] = await Promise.all(functionCalled.map(async e => {
            const functionDefinition = FUNCTIONS_MAP.get(e.name)?.fn
            if (!functionDefinition) {
                return {
                    output: `Function "${e.name}" not found. Try again.`,
                    tool_call_id: e.toolId
                }
            }
            console.log('calling function : ', functionDefinition, ' with params : ', e.arguments)
            const output = JSON.stringify(await functionDefinition(e.arguments))
            return {
                output,
                tool_call_id: e.toolId
            }
        }))
        await openai.beta.threads.runs.submitToolOutputsAndPoll(run.thread_id, run.id, {
            tool_outputs: allResult
        })
    })
    .on('event', ({event, data}) => {
        console.log('event:', JSON.stringify(event))
        const run = assistantStream.currentRun()
        console.log('run status: ', run?.status)
    })
    .on('end', async () => {
        console.log('end')
        let run = await waitUntil(['completed'], assistantStream.currentRun())
        const messages = await openai.beta.threads.messages.list(run.thread_id)
        const lastMessage = messages.data[0]
        console.log('lastMessage:', lastMessage.content.map(e => {
            if (e.type === 'text') return e.text.value
            if (e.type === 'image_file') return e.image_file.file_id
        }).join(' '))
    })
