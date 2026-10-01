import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { PdfColors, PdfWriter } from "@/lib/pdf/pdf-writer";
import type { CustomerEvent, Founder, FounderDocument, GrowthProfile, Quest, QuestResult } from "@/types/database";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function label(value: string | null | undefined): string {
  return value ? value.replace(/_/g, " ") : "-";
}

// Account data export (SPEC §13 privacy baseline), reframed as a business
// journey summary rather than a raw data dump: billing/notification
// records are account housekeeping, not the founder's business, so they're
// left out here (billing has its own view under Settings > Billing).
// Session-scoped client throughout — every table has an RLS policy that
// lets the founder read their own rows, so no admin client is needed.
export async function GET() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [documents, growthProfile, quests, questResults, customerEvents] = await Promise.all([
    supabase.from("founder_documents").select("*").eq("founder_id", founder.id),
    supabase.from("growth_profiles").select("*").eq("founder_id", founder.id).maybeSingle(),
    supabase.from("quests").select("*").eq("founder_id", founder.id),
    supabase.from("quest_results").select("*").eq("founder_id", founder.id),
    supabase.from("customer_events").select("*").eq("founder_id", founder.id),
  ]);

  const pdf = await buildJourneyPdf({
    founder: founder as Founder,
    documents: (documents.data ?? []) as FounderDocument[],
    growthProfile: growthProfile.data as GrowthProfile | null,
    quests: (quests.data ?? []) as Quest[],
    questResults: (questResults.data ?? []) as QuestResult[],
    customerEvents: (customerEvents.data ?? []) as CustomerEvent[],
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="get100-customers-export-${founder.id}.pdf"`,
    },
  });
}

async function buildJourneyPdf(data: {
  founder: Founder;
  documents: FounderDocument[];
  growthProfile: GrowthProfile | null;
  quests: Quest[];
  questResults: QuestResult[];
  customerEvents: CustomerEvent[];
}): Promise<Uint8Array> {
  const { founder, documents, growthProfile, quests, questResults, customerEvents } = data;
  const questTitleById = new Map(quests.map((q) => [q.id, q.title]));

  const pdf = await PdfWriter.create("Get100-Customers · Your Growth Journey");
  pdf.coverHeader(
    "Your Growth Journey",
    founder.company_name || founder.name || "Founder summary",
    [`Generated ${formatDate(new Date().toISOString())}`, founder.name ? `Prepared for ${founder.name}` : ""].filter(
      Boolean,
    ),
  );

  pdf.statGrid([
    { label: "Customers", value: String(founder.current_customer_count) },
    { label: "Level", value: String(founder.level) },
    { label: "XP", value: String(founder.xp) },
    { label: "Streak", value: `${founder.streak_count}d` },
  ]);

  pdf.heading("Business profile");
  pdf.keyValue("Company", founder.company_name ?? "-");
  pdf.keyValue("Industry", label(founder.industry));
  pdf.keyValue("Stage", label(founder.stage));
  pdf.keyValue("Buying motion", label(founder.buying_motion));
  pdf.keyValue("Weekly hours", founder.weekly_hours ?? "-");
  pdf.keyValue("Channels tried", founder.channels_tried.map(label).join(", ") || "-");
  pdf.keyValue("Founder since", formatDate(founder.created_at));
  if (founder.product_description) {
    pdf.spacer(6);
    pdf.subheading("Product");
    pdf.text(founder.product_description);
  }
  if (founder.icp) {
    pdf.spacer(4);
    pdf.subheading("Target customer");
    pdf.text(founder.icp);
  }

  pdf.heading("Growth profile");
  if (growthProfile) {
    if (growthProfile.bottleneck_hypothesis) {
      pdf.subheading("Current bottleneck");
      pdf.text(growthProfile.bottleneck_hypothesis);
      pdf.spacer(6);
    }
    pdf.subheading("What's working");
    if (growthProfile.what_working.length > 0) {
      for (const item of growthProfile.what_working) pdf.bullet(item.insight, { color: PdfColors.green });
    } else {
      pdf.text("Nothing confirmed yet.", { size: 9, color: PdfColors.secondary });
    }
    pdf.spacer(6);
    pdf.subheading("What's not working");
    if (growthProfile.what_not_working.length > 0) {
      for (const item of growthProfile.what_not_working) pdf.bullet(item.insight, { color: PdfColors.rose });
    } else {
      pdf.text("Nothing ruled out yet.", { size: 9, color: PdfColors.secondary });
    }
  } else {
    pdf.text("No growth profile yet.", { size: 9, color: PdfColors.secondary });
  }

  pdf.heading(`Quests (${quests.length})`);
  if (quests.length > 0) {
    quests.forEach((quest, i) => {
      if (i > 0) pdf.itemDivider();
      pdf.item(60, () => {
        pdf.subheading(quest.title);
        pdf.text(`${label(quest.category)} · ${label(quest.status)} · ${quest.xp_value} XP`, {
          size: 9,
          color: PdfColors.secondary,
        });
        pdf.text(
          `Started ${formatDate(quest.created_at)}${
            quest.resolved_at ? ` · Resolved ${formatDate(quest.resolved_at)}` : ""
          }`,
          { size: 9, color: PdfColors.secondary },
        );
      });
    });
  } else {
    pdf.text("No quests yet.", { size: 9, color: PdfColors.secondary });
  }

  pdf.heading(`Quest results (${questResults.length})`);
  if (questResults.length > 0) {
    questResults.forEach((result, i) => {
      if (i > 0) pdf.itemDivider();
      pdf.item(45, () => {
        pdf.subheading(questTitleById.get(result.quest_id) ?? "Quest");
        pdf.text(`Reported ${formatDate(result.reported_at)}`, { size: 9, color: PdfColors.secondary });
      });
      const answers = Object.entries(result.structured_answers)
        .map(([key, value]) => `${label(key)}: ${value}`)
        .join(" · ");
      if (answers) pdf.text(answers, { size: 9 });
      if (result.notes) pdf.text(`Notes: ${result.notes}`, { size: 9 });
    });
  } else {
    pdf.text("No quest results yet.", { size: 9, color: PdfColors.secondary });
  }

  pdf.heading(`Customer events (${customerEvents.length})`);
  if (customerEvents.length > 0) {
    for (const event of customerEvents) {
      const questTitle = event.quest_id ? questTitleById.get(event.quest_id) : null;
      pdf.text(
        `${formatDate(event.reported_at)} — ${label(event.event_type)} (${event.delta > 0 ? "+" : ""}${
          event.delta
        })${questTitle ? ` — ${questTitle}` : ""}${event.note ? ` — ${event.note}` : ""}`,
        { size: 9 },
      );
    }
  } else {
    pdf.text("No customer events yet.", { size: 9, color: PdfColors.secondary });
  }

  pdf.heading(`Uploaded documents (${documents.length})`);
  if (documents.length > 0) {
    for (const doc of documents) {
      pdf.text(`${formatDate(doc.created_at)} — ${label(doc.type)}: ${doc.source}`, { size: 9 });
    }
  } else {
    pdf.text("No uploaded documents.", { size: 9, color: PdfColors.secondary });
  }

  return pdf.save();
}
