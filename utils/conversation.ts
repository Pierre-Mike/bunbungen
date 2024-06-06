import {openai} from "../index.ts";
import type {AssistantStream} from "openai/lib/AssistantStream";
import {waitUntil} from "./utils.ts";
import tools from "../tools";
import type {Message} from "openai/resources/beta/threads/messages";
import prompts from "prompts";
import OpenAI from "openai";
const openai = new OpenAI()


export async function createAndRunAssistantStream(assistantId: string, userMessage: string, threadId?: string): Promise<void> {
    let assistantStream: AssistantStream | undefined = undefined


    if (threadId) {
        // add message from user to thread
        await openai.beta.threads.messages.create(threadId, {'role': 'user', content: userMessage})
        assistantStream = openai.beta.threads.runs.stream(threadId, {
            stream: true,
            assistant_id: assistantId
        })
    } else {
        assistantStream = openai.beta.threads.createAndRunStream({
            assistant_id: assistantId,
            thread: {messages: [{'role': 'user', content: userMessage}]},
            stream: true,
        });
    }

    assistantStream
        .on('toolCallDone', () => handleToolCallDone(assistantStream))
        .on('event', handleEvent)
        .on('end', async () => await handleEnd(assistantStream));
}

async function handleToolCallDone(assistantStream: AssistantStream): Promise<void> {
    console.log('toolCallDone');
    let run = await waitUntil(['requires_action'], assistantStream.currentRun());

    const functionCalled = run?.required_action?.submit_tool_outputs.tool_calls
        .filter(e => e.type === 'function')
        .map(e => ({name: e.function.name, arguments: e.function.arguments, toolId: e.id}));


    if (!functionCalled) {
        console.error('#ERROR_MISSING_FUNCTION_CALL : ', functionCalled);
        console.error('#ERROR_MISSING_FUNCTION_CALL + : ', run);
        return;
    }


    const allResult = await Promise.all(functionCalled.map(async (e) => {
        console.log(functionCalled)

        const functionDefinition = tools.get(e.name)
        let output;
        if (!functionDefinition) {
            console.error('Function not found : ', e.name)
            output = `Function "${e.name}" not found. Try again.`;
        } else {
            console.log('calling function : ', functionDefinition.function?.function.name, ' with params : ', e.arguments);
            // vaidatate params
            const params = functionDefinition.function.parse(e.arguments);
            try {
                // @ts-ignore
                output = JSON.stringify(await functionDefinition.function.function(params))

            } catch (err: any) {
                console.error(err);
                output = `Error calling function "${e.name}": ${err.message}`;
            }
        }
        return {
            output,
            tool_call_id: e.toolId
        };
    }));
    await openai.beta.threads.runs.submitToolOutputsAndPoll(run.thread_id, run.id, {
        tool_outputs: allResult
    });
}

function handleEvent({event, data}: { event: any; data: any }): void {
    console.log('event:', JSON.stringify(event));
}

async function handleEnd(assistantStream: AssistantStream): Promise<void> {
    console.log('end');
    let run = await waitUntil(['completed'], assistantStream.currentRun());
    const messages: { data: Message[] } = await openai.beta.threads.messages.list(run.thread_id);
    const lastMessage = messages.data[0];
    console.log('lastMessage:', lastMessage.content.map(e => {
        if (e.type === 'text') return e.text.value;
        if (e.type === 'image_file') return e.image_file.file_id;
    }).join(' '));

    const response: { userMessage: string } = await prompts({
        type: 'text',
        name: 'userMessage',
        message: 'Enter your response:',
    });

    if (response.userMessage) {
        await createAndRunAssistantStream(run.assistant_id, response.userMessage, run.thread_id);
    }
}
