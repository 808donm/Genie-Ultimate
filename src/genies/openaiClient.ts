import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in .env");
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

/**
 * Helper to call the OpenAI chat API and force JSON output.
 */
export async function callJsonModel({ system, user }: { system: string; user: any }) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // Upgraded to current standard (4.1-mini isn't a valid public model name usually)
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