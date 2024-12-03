import { createAndRunAssistantStream } from "../core/conversation.ts";
await createAndRunAssistantStream({
    assistant: {
        name: "financial-responsibility",
        instructions:
            `Hello, AI assistant! I need help understanding and managing my financial responsibilities related to my salary in the U.S. Specifically, I would like assistance with the following:
1. **Salary Breakdown**: Please explain how my gross salary is divided into net pay, taxes, and any deductions (like Social Security and Medicare).
2. **Tax Obligations**: I want to understand my federal and state tax obligations, including income tax brackets, potential deductions or credits I can claim, and how to calculate my taxes.
3. **Paperwork**: Can you guide me through the important documents I need for tax filing (W-2, 1099, etc.) and deadlines I should be aware of?
4. **Insurance Options**: What types of health insurance plans are available to me, and what factors should I consider when choosing one? Also, how does employer-sponsored insurance differ from private options?
5. **Healthcare Plans**: Could you explain how Health Savings Accounts (HSAs) and Flexible Spending Accounts (FSAs) work, and if they are beneficial for my situation?
6. **Retirement Plans**: Please provide information on retirement savings options available to me through my employer, such as 401(k) plans, including contribution limits and employer matching.
Thank you for your help!`,
        description:
            "you are here to provide information and guidance on financial responsibilities related to salary in the U.S.",
    },
});
