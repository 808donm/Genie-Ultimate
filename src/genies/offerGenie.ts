import { callJsonModel } from "./openaiClient";
import { OFFER_GENIE_PROMPT } from "./prompts";

/**
 * Call the Offer Genie.
 * @param payload - The structured JSON from the Orchestrator
 */
export async function callOfferGenie(payload: any) {
  const result = await callJsonModel({
    system: OFFER_GENIE_PROMPT,
    user: payload,
  });

  // Basic validation to ensure the AI didn't hallucinate a different structure
  if (!result.offer_json || !result.offer_summary_for_user) {
    throw new Error(
      "Offer Genie returned an unexpected format. Make sure the system prompt is correct."
    );
  }

  return result;
}