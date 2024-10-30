import OpenAI from "openai";
import type { AssistantCreateParams } from "openai/resources/beta/assistants";
import toolUser from "../prompts-fn/tool-user.ts";
import * as tools from "../tools";
import { createAndRunAssistantStream } from "../utils/conversation.ts";
import { transformToFunctionTool } from "../utils/utils.ts";

const openai = new OpenAI()

export const assistantParams: AssistantCreateParams = {
    name: 'dalles-edit-image ',
    model: 'gpt-4o-mini',
    instructions: toolUser(),
    description: '',
    tools: [transformToFunctionTool(tools.dalleEdit)],
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id, userMessage: 'use dalleEdit tool', });
