import toolUser from "../prompts-fn/tool-user.ts";
import * as tools from "../tools";
import { createAndRunAssistantStream } from "../core/conversation.ts";

await createAndRunAssistantStream({
    assistant: {
        name: "dalles-create",
        instructions:
            `${toolUser()} Strive to enhance the user\'s prompt as much as possible.`,
        customTools: [tools.dalleCreate],
    },
    audio: true,
});
