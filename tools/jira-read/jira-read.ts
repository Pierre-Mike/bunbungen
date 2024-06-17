import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";

const paramsSchema = z.object({
    ticketId: z.string({
        description: "The ID of the Jira ticket to read",
    })
});

export async function jiraReadFn(params: z.infer<typeof paramsSchema>) {
    const { ticketId } = params;
    const jiraToken = process.env.JIRA_API_TOKEN;
    const url = `https://jirapge.atlassian.net/rest/api/2/issue/${ticketId}`;
    const headers = {
        "Authorization": `Basic ${Buffer.from(`:${jiraToken}`).toString("base64")}`,
        "Content-Type": "application/json",
    };

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to read Jira ticket: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('jiraReadFn : ', responseData);
        return responseData;
    } catch (error: any) {
        console.error('jiraReadFn error: ', error);
        throw new Error(`Failed to read Jira ticket: ${error.message}`);
    }
}

export const jiraRead = zodFunction<any>({
    function: jiraReadFn,
    schema: paramsSchema,
    description: "Read a Jira ticket using the Jira API and a Jira token",
});
