import { createToolFn } from '../tools/create-tool/create-tool';
import prompts from 'prompts';
import fs from 'fs/promises';

async function createToolAgent() {
    const promptContent = await fs.readFile('prompts/create-tool-prompt.txt', 'utf8');
    console.log(promptContent);

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
