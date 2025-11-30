import { callJsonModel } from "./openaiClient";
import { LEAD_MAGNET_GENIE_PROMPT } from "./prompts";

/**
 * Call the Lead Magnet Genie.
 * @param payload - matches the schema in the system prompt
 */
export async function callLeadMagnetGenie(payload: any) {
  const result = await callJsonModel({
    system: LEAD_MAGNET_GENIE_PROMPT,
    user: payload,
  });

  return result;
}