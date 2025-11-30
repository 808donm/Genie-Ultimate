// src/app/page.tsx
"use client";

import { useState } from "react";
import type { GenieResponse } from "@/types/genie";

const LEAD_MAGNET_TYPES = [
  "checklist",
  "guide",
  "report",
  "ebook",
  "cheatsheet",
  "blueprint",
  "toolkit",
  "roadmap",
  "planner",
  "framework"
];

const PLATFORMS = ["facebook", "instagram", "linkedin", "tiktok", "twitter"];

export default function HomePage() {
  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [leadMagnetType, setLeadMagnetType] = useState("checklist");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook", "instagram"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenieResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"lead" | "offer" | "funnel" | "workflow" | "posts">("lead");

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/genie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          niche,
          targetAudience,
          leadMagnetType,
          platforms: selectedPlatforms
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed with ${res.status}`);
      }

      const data: GenieResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 md:flex-row">
        {/* Left: Form Panel */}
        <section className="md:w-1/3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
          <h1 className="text-2xl font-semibold mb-1">Genie Orchestrator</h1>
          <p className="text-sm text-slate-300 mb-4">
            Describe your business and target, pick a lead magnet type, and let the Genies build the rest.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Business Name</label>
              <input
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Maui Oceanfront Realty"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Niche / Industry</label>
              <input
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                placeholder="e.g. Luxury real estate, SaaS, coaching"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Target Audience</label>
              <textarea
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="Who is this for? What do they want and what are they struggling with?"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Lead Magnet Type</label>
              <select
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={leadMagnetType}
                onChange={e => setLeadMagnetType(e.target.value)}
              >
                {LEAD_MAGNET_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(platform => {
                  const active = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1 rounded-full text-xs border transition ${
                        active
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-950 text-slate-200 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-700 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Summoning the Genies..." : "Generate System"}
            </button>
          </form>
        </section>

        {/* Right: Results Panel */}
        <section className="md:w-2/3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Output</h2>
            {result && (
              <span className="text-xs text-emerald-400">
                Lead Magnet → Offer → Funnel → Workflow → Posts
              </span>
            )}
          </div>

          {!result && !isLoading && (
            <p className="text-sm text-slate-300">
              Run the system to see your lead magnet, offer, funnel JSON, workflow build guide, and social posts here.
            </p>
          )}

          {result && (
            <>
              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs">
                {[
                  { id: "lead", label: "Lead Magnet" },
                  { id: "offer", label: "Offer" },
                  { id: "funnel", label: "Funnel JSON" },
                  { id: "workflow", label: "Workflow Guide" },
                  { id: "posts", label: "Social Posts" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`px-3 py-1 rounded-full ${
                      activeTab === tab.id
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-100"
                    }`}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-sm bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-[70vh] overflow-auto whitespace-pre-wrap">
                {activeTab === "lead" && (
                  <>
                    <h3 className="font-semibold mb-2">{result.lead_magnet.title}</h3>
                    <p className="text-slate-300 mb-4">{result.lead_magnet.subtitle}</p>
                    <pre className="text-xs bg-slate-950">{result.lead_magnet.markdown}</pre>
                  </>
                )}

                {activeTab === "offer" && (
                  <>
                    <h3 className="font-semibold mb-2">{result.offer.big_idea}</h3>
                    <p className="mb-2">
                      <span className="font-semibold">Hook: </span>
                      {result.offer.hook}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Core Offer: </span>
                      {result.offer.core_offer}
                    </p>
                    <p className="mb-2 font-semibold">Value Stack:</p>
                    <ul className="list-disc list-inside mb-2">
                      {result.offer.value_stack.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    {result.offer.bonuses.length > 0 && (
                      <>
                        <p className="mb-2 font-semibold">Bonuses:</p>
                        <ul className="list-disc list-inside mb-2">
                          {result.offer.bonuses.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="mb-2">
                      <span className="font-semibold">Guarantee: </span>
                      {result.offer.guarantee}
                    </p>
                    <p>
                      <span className="font-semibold">CTA: </span>
                      {result.offer.cta}
                    </p>
                  </>
                )}

                {activeTab === "funnel" && (
                  <pre className="text-xs">
                    {JSON.stringify(result.funnel, null, 2)}
                  </pre>
                )}

                {activeTab === "workflow" && (
                  <>
                    <h3 className="font-semibold mb-2">{result.workflow_build_guide.title}</h3>
                    <p className="text-slate-300 mb-4">{result.workflow_build_guide.summary}</p>
                    <pre className="text-xs bg-slate-950">
                      {result.workflow_build_guide.full_markdown}
                    </pre>
                  </>
                )}

                {activeTab === "posts" && (
                  <div className="flex flex-col gap-4">
                    {result.posts.map((post, idx) => (
                      <div key={idx} className="border border-slate-800 rounded-lg p-3">
                        <p className="text-xs uppercase text-slate-400 mb-1">
                          {post.platform}
                        </p>
                        <p className="mb-2">{post.primary_post}</p>
                        <p className="text-xs font-semibold mb-1">Comments:</p>
                        <ul className="list-disc list-inside text-xs mb-2">
                          {post.comments.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                        <p className="text-xs text-slate-400">
                          <span className="font-semibold">Image prompt:</span> {post.image_prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
