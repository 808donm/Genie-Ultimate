import { callOrchestrator } from "./orchestratorGenie.js";
import { callLeadMagnetGenie } from "./leadMagnetGenie.js";
import { callOfferGenie } from "./offerGenie.js";
import { callFunnelGenie } from "./funnelGenie.js";
import { callPostGenie } from "./postGenie.js";
import { sendFunnelToN8n } from "./sendToN8n.js";

async function main() {
  let state = {};

  // ============================================================
  // TURN 1: User gives high-level intent
  // ============================================================
  const initialUserMessage =
    "I'm a Maui real estate agent helping mainland buyers purchase oceanfront properties. I want a checklist lead magnet to attract serious buyers.";

  console.log("USER (TURN 1):", initialUserMessage);

  const orchestratorResponse1 = await callOrchestrator(
    initialUserMessage,
    state
  );

  console.log(
    "\nORCHESTRATOR → USER (TURN 1):\n",
    orchestratorResponse1.assistant_message_for_user
  );
  console.log(
    "\nORCHESTRATOR ACTIONS (TURN 1):\n",
    orchestratorResponse1.actions
  );

  state = { ...state, ...orchestratorResponse1.state_update };

  // ============================================================
  // TURN 2: Provide detailed info if needed, then get CALL_LEAD_MAGNET_GENIE
  // ============================================================
  let leadMagnetAction = orchestratorResponse1.actions?.find(
    (a) => a.type === "CALL_LEAD_MAGNET_GENIE"
  );

  if (!leadMagnetAction) {
    const secondUserMessage =
      "Here are the details you need: Business name: Maui Oceanfront Buyers Club. Niche: helping mainland buyers safely purchase Maui oceanfront property. Audience: high-income professionals on the mainland. Lead magnet type: downloadable checklist. Big promise: 'The 7-Step Maui Oceanfront Property Buying Checklist to Avoid Six-Figure Mistakes'. Core topics: financing, due diligence, local regulations, sight-unseen risks, inspection pitfalls. Tone: confident, friendly, and direct.";

    console.log("\nUSER (TURN 2):", secondUserMessage);

    const orchestratorResponse2 = await callOrchestrator(
      secondUserMessage,
      state
    );

    console.log(
      "\nORCHESTRATOR → USER (TURN 2):\n",
      orchestratorResponse2.assistant_message_for_user
    );
    console.log(
      "\nORCHESTRATOR ACTIONS (TURN 2):\n",
      orchestratorResponse2.actions
    );

    state = { ...state, ...orchestratorResponse2.state_update };

    leadMagnetAction = orchestratorResponse2.actions?.find(
      (a) => a.type === "CALL_LEAD_MAGNET_GENIE"
    );

    if (!leadMagnetAction) {
      console.log(
        "\n❌ Still no CALL_LEAD_MAGNET_GENIE action. Tighten the orchestrator_system_prompt if this keeps happening."
      );
      return;
    }
  }

  // ============================================================
  // CALL LEAD MAGNET GENIE
  // ============================================================
  console.log(
    "\n➡ CALLING LEAD MAGNET GENIE WITH PAYLOAD:\n",
    JSON.stringify(leadMagnetAction.payload, null, 2)
  );

  const leadMagnetResult = await callLeadMagnetGenie(leadMagnetAction.payload);

  console.log(
    "\n✅ LEAD MAGNET JSON:\n",
    JSON.stringify(leadMagnetResult.lead_magnet_json, null, 2)
  );
  console.log(
    "\n📄 LEAD MAGNET MARKDOWN (preview):\n",
    leadMagnetResult.lead_magnet_document_markdown.slice(0, 600) + "..."
  );

  // ============================================================
  // TURN 3: Tell Orchestrator the Lead Magnet is done, ask for next steps (Offer)
  // ============================================================
  const orchestratorResponse3 = await callOrchestrator(
    "The Lead Magnet Genie has completed the lead magnet. Please summarize it for the user and create an irresistible offer as the next step.",
    {
      ...state,
      lead_magnet_json: leadMagnetResult.lead_magnet_json,
    }
  );

  console.log(
    "\nORCHESTRATOR (AFTER LEAD MAGNET) → USER (TURN 3):\n",
    orchestratorResponse3.assistant_message_for_user
  );
  console.log(
    "\nORCHESTRATOR ACTIONS (TURN 3):\n",
    orchestratorResponse3.actions
  );

  state = { ...state, ...orchestratorResponse3.state_update };

  // ============================================================
  // FIND CALL_OFFER_GENIE
  // ============================================================
  const offerAction =
    orchestratorResponse3.actions?.find(
      (a) => a.type === "CALL_OFFER_GENIE"
    ) || null;

  if (!offerAction) {
    console.log(
      "\n❌ No CALL_OFFER_GENIE action found. Make sure your orchestrator_system_prompt has the CALL_OFFER_GENIE section and rules."
    );
    return;
  }

  console.log(
    "\n➡ CALLING OFFER GENIE WITH PAYLOAD:\n",
    JSON.stringify(offerAction.payload, null, 2)
  );

  const offerResult = await callOfferGenie(offerAction.payload);

  console.log(
    "\n✅ OFFER JSON:\n",
    JSON.stringify(offerResult.offer_json, null, 2)
  );
  console.log(
    "\n📄 OFFER SUMMARY FOR USER:\n",
    offerResult.offer_summary_for_user
  );

  // ============================================================
  // TURN 4: Tell Orchestrator the Offer is done, ask to create funnel next
  // ============================================================
  const orchestratorResponse4 = await callOrchestrator(
    "The Offer Genie has completed the offer. Please present the offer to the user and then create a funnel around this offer and lead magnet.",
    {
      ...state,
      lead_magnet_json: leadMagnetResult.lead_magnet_json,
      offer_json: offerResult.offer_json,
    }
  );

  console.log(
    "\nORCHESTRATOR (AFTER OFFER) → USER (TURN 4):\n",
    orchestratorResponse4.assistant_message_for_user
  );
  console.log(
    "\nORCHESTRATOR ACTIONS (TURN 4):\n",
    orchestratorResponse4.actions
  );

  state = { ...state, ...orchestratorResponse4.state_update };

  // ============================================================
  // FIND CALL_FUNNEL_GENIE
  // ============================================================
  let funnelAction =
    orchestratorResponse4.actions?.find(
      (a) => a.type === "CALL_FUNNEL_GENIE"
    ) || null;

  if (!funnelAction) {
    console.log(
      "\n❌ No CALL_FUNNEL_GENIE action found. You may need to update the orchestrator_system_prompt to explicitly call Funnel Genie after the offer is created."
    );
    return;
  }

  // Patch payload defensively in case Orchestrator leaves fields out
  if (!funnelAction.payload.client && state.business_profile) {
    funnelAction.payload.client = {
      client_id: state.business_profile.client_id || "client_1",
      business_name: state.business_profile.business_name,
      niche: state.business_profile.niche,
      audience: state.business_profile.audience,
    };
  }

  if (!funnelAction.payload.ghl) {
    funnelAction.payload.ghl = {
      location_id: null,
      domain: null,
    };
  }

  if (!funnelAction.payload.lead_magnet && state.lead_magnet_json) {
    funnelAction.payload.lead_magnet = state.lead_magnet_json;
  }

  if (!funnelAction.payload.offer && state.offer_json) {
    funnelAction.payload.offer = state.offer_json;
  }

  console.log(
    "\n➡ CALLING FUNNEL GENIE WITH PAYLOAD:\n",
    JSON.stringify(funnelAction.payload, null, 2)
  );

  const funnelResult = await callFunnelGenie(funnelAction.payload);

  console.log(
    "\n✅ FUNNEL JSON (TRUNCATED):\n",
    JSON.stringify(funnelResult, null, 2).slice(0, 2000) + "..."
  );

  console.log(
    "\n🎯 Pipeline complete: Lead Magnet → Offer → Funnel. Sending funnel JSON to n8n..."
  );

  // ✅ Send funnel JSON to n8n
  await sendFunnelToN8n(funnelResult);

  // ============================================================
  // TURN 5: Ask Orchestrator for social posts (Post Genie)
  // ============================================================
  const orchestratorResponse5 = await callOrchestrator(
    "We have completed the lead magnet, offer, and funnel. Please now create social media posts to drive traffic into this funnel from Facebook, Instagram, and LinkedIn.",
    {
      ...state,
      lead_magnet_json: leadMagnetResult.lead_magnet_json,
      offer_json: offerResult.offer_json,
    }
  );

  console.log(
    "\nORCHESTRATOR (BEFORE POSTS) → USER (TURN 5):\n",
    orchestratorResponse5.assistant_message_for_user
  );
  console.log(
    "\nORCHESTRATOR ACTIONS (TURN 5):\n",
    orchestratorResponse5.actions
  );

  state = { ...state, ...orchestratorResponse5.state_update };

  // ============================================================
  // FIND CALL_POST_GENIE
  // ============================================================
  let postAction =
    orchestratorResponse5.actions?.find(
      (a) => a.type === "CALL_POST_GENIE"
    ) || null;

  if (!postAction) {
    console.log(
      "\n❌ No CALL_POST_GENIE action found. Make sure your orchestrator_system_prompt defines CALL_POST_GENIE and the routing rules."
    );
    return;
  }

  // Patch payload defensively for Post Genie
  if (!postAction.payload.offer && state.offer_json) {
    postAction.payload.offer = state.offer_json;
  }

  if (
    typeof postAction.payload.lead_magnet === "undefined" &&
    state.lead_magnet_json
  ) {
    postAction.payload.lead_magnet = state.lead_magnet_json;
  }

  if (
    !postAction.payload.platforms ||
    !Array.isArray(postAction.payload.platforms) ||
    postAction.payload.platforms.length === 0
  ) {
    postAction.payload.platforms = ["facebook", "instagram", "linkedin"];
  }

  if (!postAction.payload.preferred_tone) {
    postAction.payload.preferred_tone =
      "warm, friendly, confident, and direct";
  }

  if (!postAction.payload.posting_goals) {
    postAction.payload.posting_goals = "drive_lead_magnet_opt_ins";
  }

  console.log(
    "\n➡ CALLING POST GENIE WITH PAYLOAD:\n",
    JSON.stringify(postAction.payload, null, 2)
  );

  const postResult = await callPostGenie(postAction.payload);

  console.log(
    "\n✅ POST CAMPAIGN JSON (TRUNCATED):\n",
    JSON.stringify(postResult, null, 2).slice(0, 2000) + "..."
  );

  // Nice human-readable view of posts by platform
  console.log("\n📣 POSTS BY PLATFORM:");
  for (const platformBlock of postResult.campaign.platforms) {
    console.log(`\n=== PLATFORM: ${platformBlock.platform} ===`);
    for (const post of platformBlock.posts) {
      console.log(`\nPost ID: ${post.post_id}`);
      console.log(`Purpose: ${post.purpose}`);
      console.log(`Hook: ${post.hook}`);
      console.log(`Primary Text (truncated):`);
      console.log(post.primary_text.slice(0, 400) + "...");
      console.log(`CTA: ${post.cta_text}`);
      console.log(`Destination: ${post.destination_type} → ${post.destination_label}`);
      console.log(`Image Prompt: ${post.image_prompt}`);
      console.log(`Hashtags: ${(post.hashtags || []).join(" ")}`);
    }
  }

  console.log(
    "\n🎯 Full pipeline complete: Lead Magnet → Offer → Funnel → Posts."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
