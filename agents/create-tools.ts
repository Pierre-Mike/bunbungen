import {openai} from "../index.ts";
import type {AssistantCreateParams} from "openai/resources/beta/assistants";

// @ts-ignore
import text from '../prompts/create-tool.txt' with {type: "text"};
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {writeTsFile} from "../tools/write-ts-file/write-ts-file.ts";

export const assistantParams = {
    name: 'toolCreator ',
    model: 'gpt-4o-2024-05-13',
    instructions: text,
    tools: [writeTsFile],
} as AssistantCreateParams

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream(assistant.id, 'start discussion');
