
import {createAndRunAssistantStream} from "../core/conversation.ts";
import { createPrompt } from "../prompts-fn/create-promt.ts";
await createAndRunAssistantStream({
    assistant: {
        name: 'perfect-prompt',
        description: 'create a perfect prompt',
        instructions: createPrompt(),
    },
});
