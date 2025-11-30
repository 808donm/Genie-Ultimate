// src/app/api/genie/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { GenieResponse } from "@/types/genie";

// TODO: replace this with a real call into your orchestratorGenie.js
async function callOrchestratorBackend(payload: any): Promise<GenieResponse> {
  // For now, this is a stub. You will:
  // - Either call your existing Node backend over HTTP
  // - Or import orchestratorGenie logic directly if you merge repos

  console.warn("callOrchestratorBackend is using stub data. Wire this to orchestratorGenie.");
  
  // LOGGING: Verify the ID is making it this far
  if (payload.locationId) {
    console.log("Received Location ID:", payload.locationId);
  }

  return {
    lead_magnet: {
      title: "Stub Lead Magnet",
      subtitle: "This is a stubbed lead magnet. Wire me to the backend.",
      target_audience: payload.client.targetAudience, // Updated to match payload structure
      problem: "Example problem",
      solution: "Example solution",
      sections: [
        { heading: "Section 1", content: "Example content." }
      ],
      slug: "stub-lead-magnet",
      markdown: "# Stub Lead Magnet\n\nReplace this by wiring the API to your orchestrator."
    },
    offer: {
      big_idea: "Stub Big Idea",
      hook: "Stub Hook",
      core_offer: "Stub Core Offer",
      value_stack: ["Benefit 1", "Benefit 2"],
      bonuses: ["Bonus 1"],
      guarantee: "Stub guarantee",
      cta: "Click here",
      slug: "stub-offer"
    },
    funnel: {
      funnel_name: "Stub Funnel",
      slug: "stub-funnel",
      pages: [],
      event: {}
    },
    workflow_build_guide: {
      title: "Stub Workflow Guide",
      summary: "This is a stub workflow guide. Wire it to Funnel Genie.",
      ghl_area: "Workflows",
      estimated_time_minutes: 20,
      steps: [
        {
          step_number: 1,
          step_title: "Create Workflow Shell",
          ghl_navigation: "Automations → Workflows → Create Workflow",
          goal: "Set up the shell for this lead magnet workflow.",
          instructions: "In GHL, go to Automations → Workflows → Create Workflow and name it appropriately.",
          checklist: [
            "Workflow created",
            "Correct location selected"
          ]
        }
      ],
      full_markdown: "# Stub Workflow Guide\n\nReplace this with real Funnel Genie output."
    },
    posts: [
      {
        platform: "facebook",
        primary_post: "Stub Facebook post.",
        comments: ["Nice!", "Looks good."],
        image_prompt: "Stub image prompt"
      }
    ]
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. EXTRACT locationId FROM BODY
    const {
      businessName,
      niche,
      targetAudience,
      leadMagnetType,
      platforms,
      locationId // <--- Added here
    } = body;

    if (!businessName || !targetAudience || !leadMagnetType) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // 2. PASS locationId INTO PAYLOAD
    const payload = {
      client: {
        businessName,
        niche,
        targetAudience,
      },
      leadMagnetType,
      platforms,
      locationId, // <--- Added here so the backend receives it
    };

    const data = await callOrchestratorBackend(payload);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error in /api/genie:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}