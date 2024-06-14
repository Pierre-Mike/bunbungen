import { z } from "zod";
import axios from "axios";
import { zodFunction } from "../../utils/utils.ts";

const paramsSchema = z.object({
    ticketId: z.string({
        description: "The ID of the Jira ticket to update",
    }),
    description: z.string({
        description: "The new description for the Jira ticket",
    }),
    jiraBaseUrl: z.string({
        description: "The base URL of the Jira instance",
    }),
});

export async function jiraUpdateFn(params: z.infer<typeof paramsSchema>) {
    const { ticketId, description, jiraBaseUrl } = params;
    const jiraToken = process.env.JIRA_API_TOKEN
    const url = `${jiraBaseUrl}/rest/api/2/issue/${ticketId}`;
    const config = {
        headers: {
            "Authorization": `Basic ${Buffer.from(`:${jiraToken}`).toString("base64")}`,
            "Content-Type": "application/json",
        },
    };
    const data = {
        fields: {
            description: description,
        },
    };

    try {
        const response = await axios.put(url, data, config);
        console.log('jiraUpdateFn : ', response.data);
        return response.data;
    } catch (error :any) {
        console.error('jiraUpdateFn error: ', error);
        throw new Error(`Failed to update Jira ticket: ${error.message}`);
    }
}

export const jiraUpdate = zodFunction<any>({
    function: jiraUpdateFn,
    schema: paramsSchema,
    description: "Update the description of a Jira ticket using the Jira API and a Jira token",
});
