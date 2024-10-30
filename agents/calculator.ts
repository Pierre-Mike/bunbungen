import type {AssistantCreateParams} from "openai/resources/beta/assistants";

const openai = new OpenAI()
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {transformAll} from "../utils/utils.ts";
import OpenAI from "openai";
import * as tools from '../tools'

export const assistantParams: AssistantCreateParams = {
    name: 'calculator',
    model: 'gpt-4o-mini',
    instructions: 'You are here to just provide help yo use the mapTools you have communicate to the user for feedback and clarification after every major step to ensure alignment.',
    description: 'This assistant helps you use the calculator tool.',
    tools: transformAll([tools.calculator]),
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id, userMessage: 'use the calculator', audio:true});