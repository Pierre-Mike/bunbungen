import fs from 'fs';
import fetch from 'node-fetch';
import OpenAI from "openai";
import path from 'path';
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

    // Save images to the 'images' folder
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
    }

    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    await Promise.all(createdImages.map(async (imageUrl, index) => {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
        }
        const buffer = await imageResponse.buffer();
        const fileName = `${params.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${date}_${index + 1}.png`; // Create a sanitized file name
        fs.writeFileSync(path.join(imagesDir, fileName), buffer);
    }));

    return createdImages;
}

export const dalleCreate = zodFunction<any>({
    function: dalleCreateFn,
    schema: paramsSchema,
    description: "Create an image using DALL-E based on a given prompt.",
});
