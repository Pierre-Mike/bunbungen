import OpenAI from "openai";
import type { AssistantCreateParams } from "openai/resources/beta/assistants";
import { createAndRunAssistantStream } from "../utils/conversation.ts";

const openai = new OpenAI();

export const assistantParams: AssistantCreateParams = {
  name: "talking-agent",
  model: "gpt-4o",
  instructions:
    "You are here to help the user become smarter over time. Answer questions and elevate the conversation to a higher level. Keep your answers short and concise. Keep in mind that English isn't the user's first language. Communicate with the user for feedback and clarification after every major step to ensure alignment.",
  description: "Talking about anything.",
};

try {
  const assistant = await openai.beta.assistants.create(assistantParams as any);
  await createAndRunAssistantStream({ assistantId: assistant.id, audio: true });
} catch (error) {
  console.error("Error creating or running the assistant:", error);
}
