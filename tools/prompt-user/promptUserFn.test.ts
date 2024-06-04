import {promptUserFn} from './prompt-user';
import {expect, describe, it, mock, jest} from "bun:test";

const mockFn = jest
    .fn()
    .mockReturnValueOnce({response: 'Jonn'})
    .mockReturnValueOnce({response: 'Red'})

mock.module('prompts', () => {
    return {
        __esModule: true,
        default: mockFn
    }
});

describe('promptUserFn', () => {
    it('should prompt the user with a text message', async () => {

        const response = await promptUserFn({
            message: 'What is your name?',
            type: 'text'
        });
        expect(response).toBeDefined();
    });

    it('should prompt the user with a select message', async () => {

        const response = await promptUserFn({
            message: 'Choose your favorite color',
            type: 'select',
            choices: ['Red', 'Green', 'Blue']
        });
        expect(response).toBeDefined();
        expect(['Red', 'Green', 'Blue']).toContain(response);
    });
});
