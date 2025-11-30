import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callJsonModel } from "./openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postSystemPrompt = readFileSync(
  path.join(__dirname, "..", "prompts", "post_genie_system_prompt.md"),
  "utf8"
);

/**
 * Call the Post Genie.
 *
 * @param {object} payload - The structured JSON from the Orchestrator:
 *   {
 *     offer: { ...offer_json },
 *     lead_magnet: { ...lead_magnet_json } | null,
 *     platforms: string[],
 *     preferred_tone: string,
 *     posting_goals: string
 *   }
 *
 * @returns {Promise<object>} - Expected shape:
 *   {
 *     version: "1.0",
 *     campaign: {
 *       campaign_id: string,
 *       objective: string,
 *       primary_offer_id: string,
 *       primary_offer_name: string,
 *       primary_lead_magnet_title: string | null,
 *       platforms: [
 *         {
 *           platform: string,
 *           posts: [
 *             {
 *               post_id: string,
 *               purpose: string,
 *               hook: string,
 *               primary_text: string,
 *               headline: string,
 *               cta_text: string,
 *               destination_type: string,
 *               destination_label: string,
 *               image_prompt: string,
 *               hashtags: string[],
 *               first_comment: string,
 *               comment_prompts: string[],
 *               notes_for_scheduler: string
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 */
export async function callPostGenie(payload) {
  const result = await callJsonModel({
    system: postSystemPrompt,
    user: payload,
  });

  if (!result || typeof result !== "object") {
    throw new Error("Post Genie returned an empty or invalid response.");
  }

  if (!result.campaign || !Array.isArray(result.campaign.platforms)) {
    console.error("Post Genie raw result:", result);
    throw new Error(
      "Post Genie response missing 'campaign.platforms' array. Check the system prompt and schema."
    );
  }

  return result;
}
