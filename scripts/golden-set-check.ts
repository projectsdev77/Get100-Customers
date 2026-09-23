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

  for (const founder of FOUNDERS) {
    console.log(`\n=== ${founder.company_name} (${founder.stage}) ===`);

    console.log("\n-- personalizeQuestWithAI (template: cold email) --");
    const personalized = await personalizeQuestWithAI(founder, null, SAMPLE_TEMPLATE);
    console.log(personalized ? JSON.stringify(personalized, null, 2) : "FAILED — would fall back to raw template");

    console.log("\n-- generateNetNewQuest (no template fits) --");
    const generated = await generateNetNewQuest(founder, null);
    console.log(generated ? JSON.stringify(generated, null, 2) : "FAILED — no quest generated");
  }
}

main();
