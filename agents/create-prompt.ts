import tools from "../tools";
import {openai} from "../index.ts";
import {waitUntil} from "../utils/utils.ts";
import prompts from 'prompts';
import type {AssistantStream} from "openai/lib/AssistantStream";
import type {Message} from "openai/resources/beta/threads/messages";
// @ts-ignore
import text from '../prompts/create-prompt.txt' with {type: "text"};
import {calculator} from "../tools/calculator/calculator.ts";
import {promptUser} from "../tools/prompt-user/prompt-user.ts";
import { zodFunction } from '../utils/utils';

export const assistantParams = {
    name: 'instructionMaker ',
    model: 'gpt-3.5-turbo',
    instructions: text,
    tools: [promptUser],
}

const assistant = await openai.beta.assistants.create(assistantParams as any);


async function createAndRunAssistantStream(assistant_id: string, userMessage: string): Promise<void> {


    let assistantStream = openai.beta.threads.createAndRunStream({
        assistant_id,
        thread: {messages: [{'role': 'user', content: userMessage}]},
        stream: true,
    });
    assistantStream
        .on('toolCallDone', () => handleToolCallDone(assistantStream))
        .on('event', handleEvent)
        .on('end', async () => await handleEnd(assistant_id, assistantStream));
}

async function handleToolCallDone(assistantStream: AssistantStream): Promise<void> {
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
        const functionDefinition = tools.get(e.name)
        let output;
        if (!functionDefinition) {
            output = `Function "${e.name}" not found. Try again.`;
        } else {
            console.log('calling function : ', functionDefinition.function.function.name, ' with params : ', e.arguments);
            // vaidatate params 
            const params = functionDefinition.function.parse(e.arguments);
            try{
                output = await functionDefinition.function.function(params)

            } catch(err:any){
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

async function handleEnd(assistant_id: string, assistantStream: AssistantStream): Promise<void> {
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
        await createAndRunAssistantStream(assistant_id, response.userMessage);
    }
}

await createAndRunAssistantStream(assistant.id, 'start discusion');
