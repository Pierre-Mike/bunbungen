import {z} from "zod";
import {zodFunction} from "../../utils/utils.ts";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI()

const paramsSchema = z.object({
    image: z.string({
        description: "The file path to the image to edit",
    }),
    prompt: z.string({
        description: "The prompt describing the edit to be made",
    }),
    mask: z.string({
        description: "The file path to the mask to edit",
    }),
});

export async function dalleEditFn(params: z.infer<typeof paramsSchema>) {

    // Ensure the image and mask paths are absolute and accessible
    if (!fs.existsSync(params.image)) {
        throw new Error(`Image file not found: ${params.image}`);
    }
    if (!fs.existsSync(params.mask)) {
        throw new Error(`Mask file not found: ${params.mask}`);
    }

    const response = await openai.images.edit({
        response_format: "url",
        model: "dall-e-2",
        image: fs.createReadStream(params.image),
        mask: fs.createReadStream(params.mask),
        prompt: params.prompt,
        n: 2,
        size: "1024x1024",
    });

    const editedImages = response.data.map((img: any) => img.url);
    console.log('dalleEditFn : ', params.prompt);
    console.log('dalleEditFn res : ', editedImages);
    return editedImages;
}

export const dalleEdit = zodFunction<any>({
    function: dalleEditFn,
    schema: paramsSchema,
    description: "Edit an image using DALL-E based on a given prompt and a mask.",
});


