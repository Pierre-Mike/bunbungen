import { describe, it, expect, mock } from "bun:test";
import { jiraCreateFn } from "./jira-create";

export const mockFetch = mock()
global.fetch = mockFetch
mock.module("node-fetch", () => mockFetch)

describe("jiraCreateFn", () => {
    it("should create a Jira ticket successfully", async () => {
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

        const params = { projectKey: "TEST", summary: "Test ticket", description: "This is a test ticket", issueType: "Task" };
        const result = await jiraCreateFn(params);

        expect(result).toEqual(mockResponse);
    });

    it("should throw an error if the Jira ticket cannot be created", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            statusText: "Bad Request",
        });

        const params = { projectKey: "TEST", summary: "Test ticket", description: "This is a test ticket", issueType: "Task" };

        await expect(jiraCreateFn(params)).rejects.toThrow("Failed to create Jira ticket: Bad Request");
    });

    it("should throw an error if there is a network issue", async () => {
        mockFetch.mockRejectedValue(new Error("Network Error"));

        const params = { projectKey: "TEST", summary: "Test ticket", description: "This is a test ticket", issueType: "Task" };

        await expect(jiraCreateFn(params)).rejects.toThrow("Failed to create Jira ticket: Network Error");
    });
});
