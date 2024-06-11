import type {AssistantCreateParams} from "openai/resources/beta/assistants";

const openai = new OpenAI()
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {transformAll} from "../utils/utils.ts";
import OpenAI from "openai";
import * as tools from '../tools'

export const assistantParams: AssistantCreateParams = {
    name: 'talking',
    model: 'gpt-4o',
    instructions: 'you are here to help the user be smarter over time, answer question and bringing the conversation to an hight level. keep in mind english isn\' the first language of the user you have communicate to the user for feedback and clarification after every major step to ensure alignment.',
    description: 'This assistant helps you use the calculator tool.',
    // tools: ),
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id, userMessage: 'use the calculator'});