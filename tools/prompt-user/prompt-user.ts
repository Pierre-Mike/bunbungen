import prompts from "prompts";
import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";

const paramsSchema = z.object({
  type: z
    .enum(["text", "select"], {
      description: "The type of prompt to display to the user",
    })
    .default("text"),
  choices: z
    .array(z.string(), { description: "The choices to select from" })
    .optional(),
  message: z.string({
    description: "The question to the user",
  }),
});

export async function promptUserFn(param: z.input<typeof paramsSchema>) {
  const promptConfig: any = {
    type: param.type,
    name: "response",
    message: param.message,
    validate: (value: any) => (value ? true : "This field is required"),
  };

  if (param.type === "select" && param.choices) {
    promptConfig.choices = param.choices.map((choice) => ({
      title: choice,
      value: choice,
    }));
  }

  const response = await prompts(promptConfig);

  return response.response;
}

export const promptUser = zodFunction<any>({
  function: promptUserFn,
  schema: paramsSchema,
  description: "ask the user any question to help you be accurate",
});
