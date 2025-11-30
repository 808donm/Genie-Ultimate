import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callJsonModel } from "./openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const funnelSystemPrompt = readFileSync(
  path.join(__dirname, "..", "prompts", "funnel_genie_system_prompt.md"),
  "utf8"
);

/**
 * Call the Funnel Genie.
 *
 * @param {object} payload - The structured JSON from the Orchestrator:
 *   {
 *     client: {
 *       client_id: string,
 *       business_name: string,
 *       niche: string,
 *       audience: string
 *     },
 *     ghl: {
 *       location_id: string | null,
 *       domain: string | null
 *     },
 *     lead_magnet: { ...lead_magnet_json },
 *     offer: { ...offer_json }
 *   }
 *
 * @returns {Promise<object>} - Expected shape:
 *   {
 *     version: "1.0",
 *     funnel: {
 *       funnel_id: string,
 *       name: string,
 *       domain: string | null,
 *       pages: [...],
 *       event: {...},
 *       workflows: [...],
 *       emails: [...]
 *     }
 *   }
 */
export async function callFunnelGenie(payload) {
  const result = await callJsonModel({
    system: funnelSystemPrompt,
    user: payload,
  });

  // Basic sanity checks so we fail loudly if the model drifts
  if (!result || typeof result !== "object") {
    throw new Error("Funnel Genie returned an empty or invalid response.");
  }

  if (!result.funnel) {
    console.error("Funnel Genie raw result:", result);
    throw new Error("Funnel Genie response missing 'funnel' property.");
  }

  if (!Array.isArray(result.funnel.pages)) {
    console.error("Funnel Genie raw result:", result);
    throw new Error("Funnel Genie response missing 'funnel.pages' array.");
  }

  return result;
}
