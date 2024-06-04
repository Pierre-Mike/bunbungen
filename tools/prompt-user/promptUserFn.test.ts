import { promptUserFn } from './prompt-user';
import { z } from 'zod';

describe('promptUserFn', () => {
    it('should prompt the user with a text message', async () => {
        const params = {
            message: 'What is your name?',
            type: 'text'
        };

        const response = await promptUserFn(params);
        expect(response).toBeDefined();
    });

    it('should prompt the user with a select message', async () => {
        const params = {
            message: 'Choose your favorite color',
            type: 'select',
            choices: ['Red', 'Green', 'Blue']
        };

        const response = await promptUserFn(params);
        expect(response).toBeDefined();
        expect(['Red', 'Green', 'Blue']).toContain(response);
    });
});
