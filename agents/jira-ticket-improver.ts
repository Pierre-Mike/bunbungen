import type {AssistantCreateParams} from "openai/resources/beta/assistants";

const openai = new OpenAI()
import {createAndRunAssistantStream} from "../utils/conversation.ts";
import {transformAll} from "../utils/utils.ts";
import OpenAI from "openai";
import * as tools from '../tools'

export const assistantParams: AssistantCreateParams = {
    name: 'jira ticket improver',
    model: 'gpt-4o',
    instructions: `you are here to help the user re-formulate the jira ticket description using the tools at you disposition, to start improving it.
     communicate to the user for feedback and clarification after every major step to ensure alignment. Use only the ticket description not any subtask or parent task.`,
    description: 'jira ticket improver',
    tools : transformAll([tools.jiraUpdate,tools.jiraRead])
}

const assistant = await openai.beta.assistants.create(assistantParams as any);

await createAndRunAssistantStream({assistantId: assistant.id});