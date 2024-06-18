import { describe, it, expect, mock } from "bun:test";
import { jiraReadFn } from "./jira-read";

export const mockFetch = mock()
global.fetch = mockFetch
mock.module("node-fetch", () => mockFetch)

describe("jiraReadFn", () => {
    it("should read a Jira ticket successfully", async () => {
        const mockResponse = {
            key: "TEST-123",
            fields: {
                summary: "Test ticket",
                description: "This is a test ticket",
            },
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const params = { ticketId: "TEST-123" };
        const result = await jiraReadFn(params);

        expect(result).toEqual(mockResponse);
    });

    it("should throw an error if the Jira ticket cannot be read", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            statusText: "Not Found",
        });

        const params = { ticketId: "INVALID-123" };

        await expect(jiraReadFn(params)).rejects.toThrow("Failed to read Jira ticket: Not Found");
    });

    it("should throw an error if there is a network issue", async () => {
        mockFetch.mockRejectedValue(new Error("Network Error"));

        const params = { ticketId: "TEST-123" };

        await expect(jiraReadFn(params)).rejects.toThrow("Failed to read Jira ticket: Network Error");
    });
});
