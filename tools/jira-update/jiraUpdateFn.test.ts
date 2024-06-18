import { describe, it, expect, mock } from "bun:test";
import { jiraUpdateFn } from "./jira-update";

export const mockFetch = mock()
global.fetch = mockFetch
mock.module("node-fetch", () => mockFetch)

describe("jiraUpdateFn", () => {
    it("should update a Jira ticket successfully", async () => {
        const mockResponse = {
            key: "TEST-123",
            fields: {
                description: "Updated description",
            },
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const params = { ticketId: "TEST-123", description: "Updated description" };
        const result = await jiraUpdateFn(params);

        expect(result).toEqual(mockResponse);
    });

    it("should throw an error if the Jira ticket cannot be updated", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            statusText: "Not Found",
        });

        const params = { ticketId: "INVALID-123", description: "Updated description" };

        await expect(jiraUpdateFn(params)).rejects.toThrow("Failed to update Jira ticket: Not Found");
    });

    it("should throw an error if there is a network issue", async () => {
        mockFetch.mockRejectedValue(new Error("Network Error"));

        const params = { ticketId: "TEST-123", description: "Updated description" };

        await expect(jiraUpdateFn(params)).rejects.toThrow("Failed to update Jira ticket: Network Error");
    });
});
