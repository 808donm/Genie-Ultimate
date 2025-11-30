import { callJsonModel } from "./openaiClient";
import { sendPostToN8n } from "./sendToN8n";
import { POST_GENIE_PROMPT } from "./prompts";

export async function callPostGenie(payload: any, locationId: string) {
  // 1. Generate Content
  const result = await callJsonModel({
    system: POST_GENIE_PROMPT,
    user: payload,
  });

  if (!result || typeof result !== "object") {
    throw new Error("Post Genie returned an empty or invalid response.");
  }

  // 2. Validate
  if (!result.campaign || !Array.isArray(result.campaign.platforms)) {
    console.error("Post Genie raw result:", result);
    throw new Error("Post Genie response missing 'campaign.platforms'.");
  }

  // 3. Automation Trigger
  if (locationId) {
    console.log(`[PostGenie] Triggering n8n automation for Location: ${locationId}`);
    // We await this to catch connection errors immediately
    await sendPostToN8n(result, locationId);
  } else {
    console.warn("[PostGenie] No Location ID provided. Skipping n8n automation.");
  }

  return result;
}