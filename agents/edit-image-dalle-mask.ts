import * as tools from "../tools";
import { createAndRunAssistantStream } from "../core/conversation.ts";

await createAndRunAssistantStream({
    assistant: {
        name: 'dalles-edit-image ',
        customTools: [tools.dalleEdit],
    },
    audio: true,
});
