import type {AssistantCreateParams} from "openai/resources/beta/assistants";

const openai = new OpenAI()
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {transformToFunctionTool} from "../utils/utils.ts";
import OpenAI from "openai";
import * as tools from "../tools";

export const assistantParams: AssistantCreateParams = {
    name: 'dalles-edit-image ',
    model: 'gpt-3.5-turbo',
    instructions: 'You are here to just provide help yo use the mapTools you have communicate to the user for feedback and clarification after every major step to ensure alignment.',
    description: '',
    tools: [transformToFunctionTool(tools.dalleEdit)],
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id, userMessage: 'use dalleEdit tool '});
