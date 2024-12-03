
import {createAndRunAssistantStream} from "../core/conversation.ts";
import * as tools from '../tools'

await createAndRunAssistantStream({
    assistant: {
        name: 'calculator',
        description: 'This assistant helps you use the calculator tool.',
        instructions: 'You are here to just provide help yo use the mapTools you have communicate to the user for feedback and clarification after every major step to ensure alignment.',
        customTools: [tools.calculator],
    },
    audio: true,
});
