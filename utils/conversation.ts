import type {AssistantStream} from "openai/lib/AssistantStream";
import {waitUntil} from "./utils.ts";
import type {Message} from "openai/resources/beta/threads/messages";
import prompts from "prompts";
import OpenAI from "openai";
import {mapTools} from "./mapTools.ts";
import fs from "fs";
import player from "play-sound";

const openai = new OpenAI()

export type AssistantParams = { assistantId: string, userMessage: string, threadId?: string, audio?: boolean }

export async function createAndRunAssistantStream({
                                                      assistantId, userMessage, threadId, audio = false
                                                  }: AssistantParams): Promise<void> {
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
        .on('end', async () => await handleEnd(assistantStream, audio));
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

        const functionDefinition = mapTools.get(e.name);
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


async function handleEnd(assistantStream: AssistantStream, audio: boolean): Promise<void> {
    console.log('end');
    let run = await waitUntil(['completed'], assistantStream.currentRun());
    const messages: { data: Message[] } = await openai.beta.threads.messages.list(run.thread_id);
    const lastMessages = messages.data[0];
    const lastMessage = lastMessages.content.map(e => {
        if (e.type === 'text') return e.text.value;
    }).join(' ')


    if (audio) {
        const speech = await openai.audio.speech.create({
            voice: 'echo',
            model: 'tts-1',
            input: lastMessage
        });
        const buffer = await speech.arrayBuffer();
        const audioPlayer = player();
        const audioFilePath = '.response.mp3';
        await fs.promises.writeFile(audioFilePath, Buffer.from(buffer));
        audioPlayer.play(audioFilePath, (err: any) => {
            if (err) console.error('Error playing audio:', err);
        });
    }


    console.log('lastMessage:', lastMessage);


    let userMessage = '';


    const response: { userMessage: string } = await prompts({
        type: 'text',
        name: 'userMessage',
        message: 'Enter your response:',
    });
    userMessage = response.userMessage;


    if (userMessage) {
        await createAndRunAssistantStream({
            assistantId: run.assistant_id,
            userMessage: userMessage,
            threadId: run.thread_id,
            audio
        });
    }
}
