import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callJsonModel } from "./openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const offerSystemPrompt = readFileSync(
  path.join(__dirname, "..", "prompts", "offer_genie_system_prompt.md"),
  "utf8"
);

/**
 * Call the Offer Genie.
 * @param {object} payload - The structured JSON from the Orchestrator
 *   {
 *     lead_magnet: {...},
 *     offer_preferences: {...}
 *   }
 * @returns {Promise<object>} - { offer_json, offer_summary_for_user }
 */
export async function callOfferGenie(payload) {
  const result = await callJsonModel({
    system: offerSystemPrompt,
    user: payload,
  });

  if (!result.offer_json || !result.offer_summary_for_user) {
    throw new Error(
      "Offer Genie returned an unexpected format. Make sure the system prompt is correct."
    );
  }

  return result;
}
