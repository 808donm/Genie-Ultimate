import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in .env");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper to call the OpenAI chat API and force JSON output.
 */
export async function callJsonModel({ system, user }) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // adjust if you want a different model
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: typeof user === "string" ? user : JSON.stringify(user),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse JSON from model:", content);
    throw err;
  }
}
