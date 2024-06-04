import { createToolFn } from '../tools/create-tool/create-tool';
import prompts from 'prompts';

async function createToolAgent() {
    const response = await prompts([
        {
            type: 'text',
            name: 'toolName',
            message: 'What is the name of the tool?'
        },
        {
            type: 'text',
            name: 'content',
            message: 'Provide the content of the tool:'
        }
    ]);

    const params = {
        toolName: response.toolName,
        content: response.content
    };

    const result = await createToolFn(params);
    console.log(result);
}

createToolAgent();
