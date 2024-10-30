import type {AssistantCreateParams} from "openai/resources/beta/assistants";

const openai = new OpenAI()
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import OpenAI from "openai";

export const assistantParams: AssistantCreateParams = {
    name: 'smartChats',
    model: 'gpt-4o-mini',
    instructions: `
    Communicate with a friendly tone about science, ask questions to engage the user, and improve their reasoning.
     Keep interactions short and seek feedback and clarification after every major step to ensure alignment.
     - do not use emojy
     `,
    description: 'talk with the user trying to help him',
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id, audio:true});