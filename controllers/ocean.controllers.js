import { promises as fs } from 'fs';
import path from 'path';
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config()
const client = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export const imageAnalyzer = async (req, res, next, filePath) => {
	// console.log(filePath);
	// console.log("image analyzer called");
    // console.log("prompt is ", req.body.prompt);
	if (!filePath) {
		console.error("FilePath is null or undefined");
		return res.status(400).json({ error: "File path is missing" });
	}
	try {
		// Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({ error: "File not found" });
        }
		const imgBase64 = await fs.readFile(filePath, { encoding: 'base64' });
        console.log("File read successfully, base64 length:", imgBase64.length);
		const chatComp = await client.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: req.body.prompt },
						{
							type: "image_url",
							image_url: {
								url: `data:image/jpeg;base64,${imgBase64}`,
							},
						},
					],
				},
			],
		});
		// console.log(chatComp.choices[0].message);
        await fs.unlink(filePath);
        console.log(`File deleted: ${filePath}`);
		res.status(200).json({ text: chatComp.choices[0].message.content });
	} catch (err) {
		console.log("error occured in image analyze ", err);
        // Attempt to delete the file even if an error occurred
        try {
            await fs.unlink(filePath);
            console.log(`File deleted after error: ${filePath}`);
        } catch (unlinkErr) {
            console.error("Error deleting file:", unlinkErr);
        }
		res.status(500).json(err);
	}
};
