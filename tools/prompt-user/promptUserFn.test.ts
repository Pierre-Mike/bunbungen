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
import { promptUserFn } from './prompt-user';
import { z } from 'zod';
import prompts from 'prompts';

const paramsSchema = z.object({
    type: z.enum(['text', 'select']),
    message: z.string(),
    choices: z.array(z.string()).optional()
});

describe('promptUserFn', () => {
    it('should prompt the user with a text message', async () => {
        const params = {
            type: 'text',
            message: 'What is your name?'
        };

        prompts.inject(['John Doe']);
        const response = await promptUserFn(params);

        expect(response).toBe('John Doe');
    });

    it('should prompt the user with a select message', async () => {
        const params = {
            type: 'select',
            message: 'Choose a color',
            choices: ['Red', 'Green', 'Blue']
        };

        prompts.inject(['Green']);
        const response = await promptUserFn(params);

        expect(response).toBe('Green');
    });
});
