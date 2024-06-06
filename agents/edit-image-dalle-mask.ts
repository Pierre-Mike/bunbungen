import {openai} from "../index.ts";
import type {AssistantCreateParams} from "openai/resources/beta/assistants";

// @ts-ignore
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {dalleEdit} from "../tools/dalle-edit/dalle-edit.ts";
import type {AssistantTool} from "openai/resources/beta/assistants";
import {transformTOFunctionTool} from "../utils/utils.ts";

export const assistantParams = {
    name: 'dalles-edit-image ',
    model: 'gpt-4o-2024-05-13',
    instructions: 'You are here to just provide help yo use the tools you have communicate to the user for feedback and clarification after every major step to ensure alignment.',
    tools: [transformTOFunctionTool(dalleEdit)],

} as AssistantCreateParams

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream(assistant.id, 'use dalleEdit tool ');
