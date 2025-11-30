import dotenv from "dotenv";
dotenv.config();

/**
 * Send funnel JSON to n8n webhook.
 * @param {object} funnelResult - The full object from Funnel Genie.
 */
export async function sendFunnelToN8n(funnelResult) {
  const url = process.env.N8N_WEBHOOK_URL;

  console.log("\n[sendFunnelToN8n] N8N_WEBHOOK_URL:", url);

  if (!url) {
    throw new Error(
      "N8N_WEBHOOK_URL is not set in .env. Add it like: N8N_WEBHOOK_URL=https://YOUR-WORKSPACE.n8n.cloud/webhook/funnel-genie-v1"
    );
  }

  try {
    console.log(
      "[sendFunnelToN8n] Sending funnel payload to n8n. Funnel keys:",
      Object.keys(funnelResult)
    );

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(funnelResult),
    });

    const text = await res.text();

    console.log("[sendFunnelToN8n] n8n response status:", res.status);
    console.log("[sendFunnelToN8n] n8n response body:", text);

    if (!res.ok) {
      throw new Error(
        `n8n webhook error: HTTP ${res.status} – ${text || "no body"}`
      );
    }

    console.log("✅ Successfully sent funnel JSON to n8n.");
  } catch (err) {
    console.error("❌ Failed to send funnel to n8n:", err);
    throw err;
  }
}
import dotenv from "dotenv";
dotenv.config();

// ... existing sendFunnelToN8n code ...

/**
 * Send Post Campaign JSON to n8n for Image Gen & Scheduling.
 * @param {object} campaignResult - The full output from Post Genie.
 * @param {string} locationId - The GHL Location ID to post to.
 */
export async function sendPostToN8n(campaignResult, locationId) {
  const url = process.env.N8N_POST_WEBHOOK_URL;

  console.log("\n[sendPostToN8n] Target URL:", url);

  if (!url) {
    throw new Error("N8N_POST_WEBHOOK_URL is missing in .env");
  }

  // Construct the payload expected by our new n8n workflow
  const payload = {
    location_id: locationId,
    campaign: campaignResult.campaign // The nested campaign object
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`n8n Post Genie error: ${res.status} - ${text}`);
    }

    console.log("✅ Successfully dispatched Post Campaign to n8n.");
    return true;
  } catch (err) {
    console.error("❌ Failed to send to n8n:", err);
    // We don't throw here to avoid crashing the chat UI if automation fails
    return false;
  }
 }

