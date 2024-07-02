import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";

const paramsSchema = z.object({
    projectKey: z.string({
        description: "The key of the Jira project",
    }),
    summary: z.string({
        description: "The summary of the Jira ticket",
    }),
    description: z.string({
        description: "The description of the Jira ticket",
    }),
    issueType: z.string({
        description: "The type of the Jira issue",
    }),
});

export async function jiraCreateFn(params: z.infer<typeof paramsSchema>) {
    const { projectKey, summary, description, issueType } = params;
    const jiraToken = process.env.JIRA_API_TOKEN;
    const url = `https://jirapge.atlassian.net/rest/api/2/issue`;
    const headers = {
        "Authorization": `Basic ${Buffer.from(`p2ll@pge.com:${jiraToken}`).toString("base64")}`,
        "Content-Type": "application/json",
    };

    const body = JSON.stringify({
        fields: {
            project: {
                key: projectKey,
            },
            summary: summary,
            description: description,
            issuetype: {
                name: issueType,
            },
        },
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            throw new Error(`Failed to create Jira ticket: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('jiraCreateFn : ', responseData);
        return responseData;
    } catch (error: any) {
        console.error('jiraCreateFn error: ', error);
        throw new Error(`Failed to create Jira ticket: ${error.message}`);
    }
}

export const jiraCreate = zodFunction<any>({
    function: jiraCreateFn,
    schema: paramsSchema,
    description: "Create a Jira ticket using the Jira API and a Jira token",
});
