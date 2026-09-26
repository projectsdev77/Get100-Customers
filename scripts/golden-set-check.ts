// Manual AI quality check (SPEC §17 "golden-set of sample founder profiles,
// checked when prompts/templates change"). Not run in CI — it needs a real
// GEMINI_API_KEY and costs a handful of free-tier calls. Run by hand after
// touching any prompt in src/lib/ai/ or supabase/seed.sql:
//
//   npx tsx scripts/golden-set-check.ts
//
// Prints personalized quest output for a few founder archetypes so a human
// can eyeball it — this is a review aid, not a pass/fail gate.

import "dotenv/config";
import { personalizeQuestWithAI } from "../src/lib/ai/personalize-quest";
import { generateNetNewQuest } from "../src/lib/ai/generate-quest";
import { selectNextQuestWithAI } from "../src/lib/ai/select-quest";
import type { Founder, QuestTemplate } from "../src/types/database";

const FOUNDERS: Array<
  Pick<
    Founder,
    | "company_name"
    | "industry"
    | "product_description"
    | "icp"
    | "stage"
    | "channels_tried"
    | "weekly_hours"
  >
> = [
  {
    company_name: "Ledgerly",
    industry: "fintech / SMB accounting software",
    product_description: "Automated bookkeeping for freelancers and solo consultants",
    icp: "freelance consultants who bill hourly and hate manual invoicing",
    stage: "prototype",
    channels_tried: [],
    weekly_hours: "3-5",
  },
  {
    company_name: "PawPath",
    industry: "pet services marketplace",
    product_description: "Marketplace connecting dog walkers with busy pet owners in cities",
    icp: "urban professionals with dogs who work long hours",
    stage: "idea",
    channels_tried: ["communities"],
    weekly_hours: "1-2",
  },
  {
    company_name: "Buildscope",
    industry: "construction tech",
    product_description: "Project timeline software for small residential contractors",
    icp: "owners of 2-10 person residential construction crews",
    stage: "launched",
    channels_tried: ["cold_email", "content"],
    weekly_hours: "10+",
  },
];

const SAMPLE_TEMPLATE: QuestTemplate = {
  id: "sample",
  category: "cold_email",
  industry_tags: [],
  stage_tags: [],
  title_template: "Send 10 cold emails to your ICP",
  instructions_template:
    "Find 10 people who match {{icp}} and send each a short, personal email introducing {{product_name}} and asking for 15 minutes to learn about their workflow.",
  default_xp: 15,
  default_window_days: 4,
  result_question_set: [
    { id: "sent_count", prompt: "How many emails did you send?", type: "number" },
    { id: "converted", prompt: "Did any convert to a customer?", type: "boolean" },
  ],
  tool_templates: [
    {
      label: "Cold email opener",
      content:
        "Subject: quick question about {{icp_pain_point}}\n\nHi {{first_name}}, I noticed you work on {{icp_context}} — I'm building {{product_name}} to help with exactly that.",
    },
  ],
  created_at: new Date().toISOString(),
};

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Set GEMINI_API_KEY (e.g. in .env.local) before running this script.");
    process.exit(1);
  }

  // The free tier caps gemini-3.6-flash at 5 requests/minute (confirmed
  // via a live 429: "limit: 5, model: gemini-3.6-flash"). This script
  // makes 2 calls per founder with nothing pacing them, which blows
  // through that in a couple of iterations — a 15s gap between every call
  // keeps it under 5/minute with room to spare. Real app usage doesn't
  // need this: a founder naturally paces requests by clicking through
  // the UI, not by firing 6 calls in a burst.
  const pause = () => new Promise((resolve) => setTimeout(resolve, 15_000));
  let first = true;

  for (const founder of FOUNDERS) {
    console.log(`\n=== ${founder.company_name} (${founder.stage}) ===`);

    if (!first) await pause();
    first = false;
    console.log("\n-- selectNextQuestWithAI (primary path — AI picks the channel too) --");
    const selected = await selectNextQuestWithAI(founder, null, [SAMPLE_TEMPLATE], [], []);
    console.log(selected ? JSON.stringify(selected, null, 2) : "FAILED — would fall back to pickTemplate");

    await pause();
    console.log("\n-- personalizeQuestWithAI (fallback tier: template: cold email) --");
    const personalized = await personalizeQuestWithAI(founder, null, SAMPLE_TEMPLATE);
    console.log(personalized ? JSON.stringify(personalized, null, 2) : "FAILED — would fall back to raw template");

    await pause();
    console.log("\n-- generateNetNewQuest (last-resort fallback: no template fits) --");
    const generated = await generateNetNewQuest(founder, null);
    console.log(generated ? JSON.stringify(generated, null, 2) : "FAILED — no quest generated");
  }
}

main();
