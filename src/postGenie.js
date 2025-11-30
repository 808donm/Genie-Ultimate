import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callJsonModel } from "./openaiClient.js";
// 1. NEW IMPORT: Bring in the sender function
import { sendPostToN8n } from "./sendToN8n.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postSystemPrompt = readFileSync(
  path.join(__dirname, "..", "prompts", "post_genie_system_prompt.md"),
  "utf8"
);

/**
 * Call the Post Genie AND trigger automation.
 *
 * @param {object} payload - The structured JSON from the Orchestrator.
 * @param {string} locationId - (NEW) The GHL Location ID to post to.
 *
 * @returns {Promise<object>} - Returns the campaign JSON to the Orchestrator.
 */
export async function callPostGenie(payload, locationId) {
  
  // 2. Generate the Content (AI)
  const result = await callJsonModel({
    system: postSystemPrompt,
    user: payload,
  });

  if (!result || typeof result !== "object") {
    throw new Error("Post Genie returned an empty or invalid response.");
  }

  // 3. Validate Structure
  if (!result.campaign || !Array.isArray(result.campaign.platforms)) {
    console.error("Post Genie raw result:", result);
    throw new Error(
      "Post Genie response missing 'campaign.platforms' array. Check the system prompt and schema."
    );
  }

  // 4. Send to n8n (The Hands)
  // We check if locationId exists so we don't crash if testing without a GHL connection
  if (locationId) {
    console.log(`[PostGenie] Triggering n8n automation for Location: ${locationId}`);
    
    // We await this to ensure the handoff starts successfully before returning
    await sendPostToN8n(result, locationId);
    
  } else {
    console.warn("[PostGenie] No Location ID provided. Skipping n8n automation.");
  }

  // 5. Return result to Orchestrator (so the user sees the plan)
  return result;
}