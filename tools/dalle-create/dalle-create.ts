import OpenAI from "openai";
import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";

const openai = new OpenAI()

const paramsSchema = z.object({
    prompt: z.string({
        description: "The prompt describing the image to be created",
    }),
});

export async function dalleCreateFn(params: z.infer<typeof paramsSchema>) {

    const response = await openai.images.generate({
        response_format: "url",
        model: "dall-e-3",
        prompt: params.prompt,
        n: 1,
        size: "1024x1024",
    });

    const createdImages = response.data.map((img: any) => img.url);
    console.log('dalleCreateFn : ', params.prompt);
    console.log('dalleCreateFn res : ', createdImages);
    return createdImages;
}

export const dalleCreate = zodFunction<any>({
    function: dalleCreateFn,
    schema: paramsSchema,
    description: "Create an image using DALL-E based on a given prompt.",
});
