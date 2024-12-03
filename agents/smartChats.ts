import { smartChat } from "../prompts-fn/smart-chat.ts";
import { createAndRunAssistantStream } from "../core/conversation.ts";
import * as tools from "../tools";

await createAndRunAssistantStream({
    assistant: {
        instructions: smartChat(),
        description: "talk with the user trying to help him",
        customTools: [tools.listFile],
    },
    audio:  true,
});                              
