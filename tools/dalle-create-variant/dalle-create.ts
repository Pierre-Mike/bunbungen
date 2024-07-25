import OpenAI from "openai";
import { z } from "zod";
import { zodFunction } from "../../utils/utils.ts";
import fetch from "node-fetch"; // Import fetch to handle URL to Response conversion
import type { FsReadStream } from "openai/_shims/index.mjs";

const openai = new OpenAI()

const paramsSchema = z.object({
    prompt: z.string({
        description: "The prompt describing the image to be created",
    }),
    imageUrl: z.string({
        description: "The URL of the image to be used for creating variations",
    }),
    variations: z.number().optional().default(1).describe("The number of variations to create"),
});

export async function dalleCreateVariantFn(params: z.infer<typeof paramsSchema>) {
    // Fetch the image from the URL and convert it to a ResponseLike object
    const imageResponse = await fetch(params.imageUrl);
    if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${params.imageUrl}`);
    }
    const buffer  = await imageResponse.arrayBuffer()

    const response = await openai.images.createVariation({
        response_format: "url",
        model: "dall-e-3",
        image:buffer , // Use the ResponseLike object
        n: params.variations,
        size: "1024x1024",
    });

    const createdImages = response.data.map((img: any) => img.url);
    console.log('dalleCreateVariantFn : ', params.prompt);
    console.log('dalleCreateVariantFn res : ', createdImages);
    return createdImages;
}

export const dalleCreateVariant = zodFunction<any>({
    function: dalleCreateVariantFn,
    schema: paramsSchema,
    description: "Create one or more image variations using DALL-E based on a given prompt.",
});
