import { createAndRunAssistantStream } from "../core/conversation.ts";
import * as tools from "../tools";

await createAndRunAssistantStream({
    assistant: {
        name: "jira ticket improver",
        instructions:
            `you are here to help the user re-formulate the jira ticket description using the tools at you disposition, to start improving it.
         communicate to the user for feedback and clarification after every major step to ensure alignment. Use only the ticket description not any subtask or parent task.`,
        description: "jira ticket improver",
        customTools: [tools.jiraUpdate, tools.jiraRead],
    },
    audio: true,
});
