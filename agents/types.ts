export interface AssistantParams {
    name: string;
    model: string;
    instructions: string;
    tools: Array<any>;
}

export interface AssistantStream {
    on(event: string, callback: Function): this;
    currentRun(): Run;
}

export interface Run {
    thread_id: string;
    id: string;
    status: string;
    required_action?: {
        submit_tool_outputs: {
            tool_calls: ToolCall[];
        };
    };
}

export interface Message {
    content: Array<{ type: string; text?: { value: string }; image_file?: { file_id: string } }>;
}

export interface ToolCall {
    type: string;
    function: {
        name: string;
        arguments: string;
    };
    id: string;
}
