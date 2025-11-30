import { callJsonModel } from "./openaiClient";
import { FUNNEL_GENIE_PROMPT } from "./prompts";

/**
 * Call the Funnel Genie.
 * @param payload - The structured JSON from the Orchestrator
 */
export async function callFunnelGenie(payload: any) {
  const result = await callJsonModel({
    system: FUNNEL_GENIE_PROMPT,
    user: payload,
  });

  // Sanity checks
  if (!result || typeof result !== "object") {
    throw new Error("Funnel Genie returned an empty or invalid response.");
  }

  if (!result.funnel) {
    console.error("Funnel Genie raw result:", result);
    throw new Error("Funnel Genie response missing 'funnel' property.");
  }

  // Note: Your TS prompt might define pages inside funnel, checking that structure:
  if (!Array.isArray(result.funnel.pages)) {
    console.error("Funnel Genie raw result:", result);
    throw new Error("Funnel Genie response missing 'funnel.pages' array.");
  }

  return result;
}