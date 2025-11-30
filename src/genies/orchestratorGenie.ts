import { callJsonModel } from "./openaiClient";
// Import the text constant from your prompts file
import { ORCHESTRATOR_PROMPT } from "./prompts"; 

/**
 * Call the Orchestrator Genie.
 *
 * @param userMessage - Raw user text from the human.
 * @param state - Previous state object
 */
export async function callOrchestrator(userMessage: string, state: any = {}) {
  const userPayload = {
    user_message: userMessage,
    previous_state: state,
  };

  // Pass the constant string (ORCHESTRATOR_PROMPT) to the model
  const result = await callJsonModel({
    system: ORCHESTRATOR_PROMPT, 
    user: userPayload,
  });

  return result;
}