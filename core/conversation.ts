import type { AssistantStream } from "openai/lib/AssistantStream";
import { transformAll, waitUntil } from "../utils/utils.ts";
import type { Message } from "openai/resources/beta/threads/messages";
import prompts from "prompts";
import OpenAI from "openai";
import { mapTools } from "../utils/mapTools.ts";
import type { AssistantCreateParams } from "openai/resources/beta/assistants.mjs";
import toolUser from "../prompts-fn/tool-user.ts";
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
const { exec } = require("child_process");

const openai = new OpenAI();

export type AssistantCreateParamsDefault =
  & Omit<AssistantCreateParams, "model"|'tools'>
  & { model?: string } & { customTools?: RunnableToolFunctionWithParse<object>[] };

export type AssistantParams = {
  userMessage?: string;
  threadId?: string;
  audio?: boolean;
  assistant?: AssistantCreateParamsDefault;
  assistantId?: string;
  debug?: boolean;
};

export const createAssistant = (
  { model = "gpt-4o-mini", ...props }: AssistantCreateParamsDefault,
) => {
  const tools = transformAll(props.customTools || []);
  if (props.customTools && !props.instructions) props.instructions = toolUser();
  delete props.customTools;
  return openai.beta.assistants.create( 
    { ...props, model, tools },
  );
};

export async function createAndRunAssistantStream({
  userMessage,
  threadId,
  assistant = {},
  assistantId,
  audio = false,
  debug = false,
}: AssistantParams): Promise<void> {
  let assistantStream: AssistantStream | undefined = undefined;

  if (!assistantId) {
    const assistantResponse = await createAssistant(assistant);
    assistantId = assistantResponse.id;
  }

  if (threadId) {
    // add message from user to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage || "continue",
    });
    assistantStream = openai.beta.threads.runs.stream(threadId, {
      stream: true,
      assistant_id: assistantId,
    });
  } else {
    assistantStream = openai.beta.threads.createAndRunStream({
      assistant_id: assistantId,
      thread: { messages: [{ role: "user", content: userMessage || "hello" }] },
      stream: true,
    });
  }

  assistantStream
    .on("toolCallDone", () => handleToolCallDone(assistantStream))
    .on("event", handleEvent)
    .on("end", async () => await handleEnd(assistantStream, audio));
}

async function handleToolCallDone(
  assistantStream: AssistantStream,
): Promise<void> {
  console.log("toolCallDone");
  let run = await waitUntil(["requires_action"], assistantStream.currentRun());

  const functionCalled = run?.required_action?.submit_tool_outputs.tool_calls
    .filter((e) => e.type === "function")
    .map((e) => ({
      name: e.function.name,
      arguments: e.function.arguments,
      toolId: e.id,
    }));

  if (!functionCalled) {
    console.error("#ERROR_MISSING_FUNCTION_CALL : ", functionCalled);
    console.error("#ERROR_MISSING_FUNCTION_CALL + : ", run);
    return;
  }

  const allResult = await Promise.all(
    functionCalled.map(async (e) => {
      console.log(functionCalled);

      const functionDefinition = mapTools.get(e.name);
      let output;
      if (!functionDefinition) {
        console.error("Function not found : ", e.name);
        output = `Function "${e.name}" not found. Try again.`;
      } else {
        console.log(
          "calling function : ",
          functionDefinition.function?.function.name,
          " with params : ",
          e.arguments,
        );
        // vaidatate params
        const params = functionDefinition.function.parse(e.arguments);
        try {
          // @ts-ignore
          output = JSON.stringify(
            await functionDefinition.function.function(params),
          );
        } catch (err: any) {
          console.error(err);
          output = `Error calling function "${e.name}": ${err.message}`;
        }
      }
      return {
        output,
        tool_call_id: e.toolId,
      };
    }),
  );
  await openai.beta.threads.runs.submitToolOutputsAndPoll(
    run.thread_id,
    run.id,
    {
      tool_outputs: allResult,
    },
  );
}

function handleEvent({ event, data }: { event: any; data: any}): void {
  console.log("event:", JSON.stringify(event));
}

async function handleEnd(
  assistantStream: AssistantStream,
  audio: boolean,
): Promise<void> {
  console.log("end");
  let run = await waitUntil(["completed"], assistantStream.currentRun());
  const messages: { data: Message[] } = await openai.beta.threads.messages.list(
    run.thread_id,
  );

  const lastMessages = messages.data[0];
  const lastMessage = lastMessages.content
    .map((e) => {
      if (e.type === "text") return e.text.value;
    })
    .join(" ");

  if (audio) {
      const speechCommand = `piper --model en_US-lessac-medium.onnx --data-dir ./ --output-raw <<< "${lastMessage}" | ffmpeg -f s16le -ar 22050 -ac 1 -i pipe:0 -f wav pipe:1 | ffplay -autoexit -nodisp -vn -`;
    exec(speechCommand, (err: any) => {
      if (err) console.error("Error using macOS speech:", err);
    });
  }

  console.log("lastMessage:", lastMessage);

  let userMessage = "";

  const response: { userMessage: string } = await prompts({
    type: "text",
    name: "userMessage",
    message: "Enter your response:",
  });
  userMessage = response.userMessage;

  if (userMessage) {
    await createAndRunAssistantStream({
      assistantId: run.assistant_id,
      userMessage: userMessage,
      threadId: run.thread_id,
      audio,
    });
  }
}
