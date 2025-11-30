import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callJsonModel } from "./openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const orchestratorSystemPrompt = readFileSync(
  path.join(__dirname, "..", "prompts", "orchestrator_system_prompt.md"),
  "utf8"
);

/**
 * Call the Orchestrator Genie.
 *
 * @param {string} userMessage - Raw user text from the human.
 * @param {object} state - Previous state_update (or {}), e.g.:
 *   {
 *     business_profile: { ... },
 *     lead_magnet_brief: { ... },
 *     lead_magnet_json: { ... },
 *     offer_brief: { ... },
 *     offer_json: { ... },
 *     ...
 *   }
 *
 * @returns {Promise<{
 *   assistant_message_for_user: string,
 *   actions: Array<{ type: string, payload: any }>,
 *   state_update: object
 * }>}
 *
 * The logic for which actions to return (CALL_LEAD_MAGNET_GENIE,
 * CALL_OFFER_GENIE, CALL_FUNNEL_GENIE, CALL_POST_GENIE, etc.)
 * lives entirely in the orchestrator_system_prompt.md file.
 * This function simply forwards the userMessage + previous_state
 * to the model and returns the parsed JSON result.
 */
export async function callOrchestrator(userMessage, state = {}) {
  const userPayload = {
    user_message: userMessage,
    previous_state: state,
  };

  const result = await callJsonModel({
    system: orchestratorSystemPrompt,
    user: userPayload,
  });

  return result;
}
