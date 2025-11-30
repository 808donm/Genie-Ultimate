import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { callJsonModel } from "./openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const leadMagnetSystemPrompt = readFileSync(
  path.join(__dirname, "..", "prompts", "lead_magnet_genie_system_prompt.md"),
  "utf8"
);

/**
 * Call the Lead Magnet Genie.
 * @param {object} payload - matches the schema in the system prompt
 */
export async function callLeadMagnetGenie(payload) {
  const result = await callJsonModel({
    system: leadMagnetSystemPrompt,
    user: payload,
  });

  return result;
}
