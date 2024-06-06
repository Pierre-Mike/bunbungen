import {openai} from "../index.ts";
import type {AssistantCreateParams} from "openai/resources/beta/assistants";

// @ts-ignore
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {dalleEdit} from "../tools/dalle-edit/dalle-edit.ts";
import {calculator} from "../tools/calculator/calculator.ts";

export const assistantParams = {
    name: 'calculator',
    model: 'gpt-4o-2024-05-13',
    instructions: 'just here to calculate 4/56/78/34/989*56',
    tools: [calculator],
} as AssistantCreateParams

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream(assistant.id, 'give me the answer ');
