
import tools from "../tools";
import {calculator} from "../tools/calculator/calculator.ts";
import {openai} from "../index.ts";
import {waitUntil, waitWhileIn} from "../utils/utils.ts";

export const assistantParams = {
    name: 'instructionMaker ',
    model: 'gpt-3.5-turbo',
    instructions: 'just calculate 9*100',
    tools: [calculator, {type: "code_interpreter"}],
}

const assistant = await openai.beta.assistants.create(assistantParams as any)

let assistantStream = openai.beta.threads.createAndRunStream({
    thread: {messages: [{'role': 'user', content: 'calculate 19*56*1000*2*5000*45/45*0.78'}]},
    assistant_id: assistant.id,
    stream: true,
})



assistantStream
    .on('toolCallDone', async () => {
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
            const functionDefinition = tools.get(e.name)
            if (!functionDefinition) return {
                output: `Function "${e.name}" not found. Try again.`,
                tool_call_id: e.toolId
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
        let run = await waitWhileIn(['requires_action'], assistantStream.currentRun())
         run = await waitUntil(['completed'], run)
        const messages = await openai.beta.threads.messages.list(run.thread_id)
        const lastMessage = messages.data[0]
        console.log('lastMessage:', lastMessage.content.map(e => {
            if (e.type === 'text') return e.text.value
            if (e.type === 'image_file') return e.image_file.file_id
        }).join(' '))
    })
