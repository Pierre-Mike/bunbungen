import OpenAI from "openai";
import type { AssistantCreateParams } from "openai/resources/beta/assistants";
import toolUser from "../prompts-fn/tool-user.ts";
import * as tools from "../tools";
import { createAndRunAssistantStream } from "../utils/conversation.ts";
import { transformAll } from "../utils/utils.ts";

const openai = new OpenAI()

export const assistantParams: AssistantCreateParams = {
    name: 'dalles-create',
    model: 'gpt-4o-mini',
    instructions: `${toolUser()} Strive to enhance the user\'s prompt as much as possible.`,
    description: '',
    tools: transformAll([tools.dalleCreate])
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id, userMessage: 'start'});
