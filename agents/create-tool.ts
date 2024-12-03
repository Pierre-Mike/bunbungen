import {createTool} from "../prompts-fn/create-tool.ts";
import { createAndRunAssistantStream } from "../core/conversation.ts";

await createAndRunAssistantStream({
    assistant: {
        name: "dalles-create",
        instructions:createTool(),
    },
});
