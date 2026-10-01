import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";
import { PdfWriter } from "@/lib/pdf/pdf-writer";
import type {
  CustomerEvent,
  Founder,
  FounderDocument,
  GrowthProfile,
  NotificationLogEntry,
  Quest,
  QuestResult,
  Subscription,
} from "@/types/database";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function label(value: string | null | undefined): string {
  return value ? value.replace(/_/g, " ") : "-";
}

// Account data export (SPEC §13 privacy baseline). Session-scoped client
// throughout — every table here has an RLS policy that lets the founder
// read their own rows, so no admin client is needed for a read-only
// export of your own data. A human-readable PDF rather than a raw JSON
// dump, since this is meant to actually be opened and read, not parsed.
export async function GET() {
  const supabase = await createClient();
  const founder = await getCurrentFounder(supabase);
  if (!founder) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const [documents, growthProfile, quests, questResults, customerEvents, subscription, notifications] =
    await Promise.all([
      supabase.from("founder_documents").select("*").eq("founder_id", founder.id),
      supabase.from("growth_profiles").select("*").eq("founder_id", founder.id).maybeSingle(),
      supabase.from("quests").select("*").eq("founder_id", founder.id),
      supabase.from("quest_results").select("*").eq("founder_id", founder.id),
      supabase.from("customer_events").select("*").eq("founder_id", founder.id),
      supabase.from("subscriptions").select("*").eq("founder_id", founder.id).maybeSingle(),
      supabase.from("notifications_log").select("*").eq("founder_id", founder.id),
    ]);

  const pdf = await buildExportPdf({
    founder: founder as Founder,
    documents: (documents.data ?? []) as FounderDocument[],
    growthProfile: growthProfile.data as GrowthProfile | null,
    quests: (quests.data ?? []) as Quest[],
    questResults: (questResults.data ?? []) as QuestResult[],
    customerEvents: (customerEvents.data ?? []) as CustomerEvent[],
    subscription: subscription.data as Subscription | null,
    notifications: (notifications.data ?? []) as NotificationLogEntry[],
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="get100-customers-export-${founder.id}.pdf"`,
    },
  });
}

async function buildExportPdf(data: {
  founder: Founder;
  documents: FounderDocument[];
  growthProfile: GrowthProfile | null;
  quests: Quest[];
  questResults: QuestResult[];
  customerEvents: CustomerEvent[];
  subscription: Subscription | null;
  notifications: NotificationLogEntry[];
}): Promise<Uint8Array> {
  const { founder, documents, growthProfile, quests, questResults, customerEvents, subscription, notifications } =
    data;
  const questTitleById = new Map(quests.map((q) => [q.id, q.title]));

  const pdf = await PdfWriter.create();

  pdf.heading("Get100-Customers — Your Data Export");
  pdf.text(`Generated ${formatDate(new Date().toISOString())}`, { size: 9, color: [0.4, 0.4, 0.4] });
  pdf.divider();

  pdf.heading("Profile");
  pdf.text(`Name: ${founder.name ?? "-"}`);
  pdf.text(`Company: ${founder.company_name ?? "-"}`);
  pdf.text(`Industry: ${founder.industry ?? "-"}`);
  pdf.text(`Product: ${founder.product_description ?? "-"}`);
  pdf.text(`Target customer (ICP): ${founder.icp ?? "-"}`);
  pdf.text(`Stage: ${label(founder.stage)}`);
  pdf.text(`Weekly hours available: ${founder.weekly_hours ?? "-"}`);
  pdf.text(`Buying motion: ${label(founder.buying_motion)}`);
  pdf.text(`Channels tried: ${founder.channels_tried.map(label).join(", ") || "-"}`);
  pdf.text(`Current customer count: ${founder.current_customer_count}`);
  pdf.text(`Level: ${founder.level} (${founder.xp} XP)`);
  pdf.text(`Current streak: ${founder.streak_count} days`);
  pdf.text(`Account created: ${formatDate(founder.created_at)}`);

  pdf.heading("Subscription");
  if (subscription) {
    pdf.text(`Plan: ${subscription.plan}`);
    pdf.text(`Status: ${label(subscription.status)}`);
    pdf.text(`Trial ends: ${formatDate(subscription.trial_ends_at)}`);
    pdf.text(`Grace period ends: ${formatDate(subscription.grace_period_ends_at)}`);
  } else {
    pdf.text("No subscription record yet.");
  }

  pdf.heading("Growth profile");
  if (growthProfile) {
    pdf.text(`Bottleneck hypothesis: ${growthProfile.bottleneck_hypothesis ?? "-"}`);
    pdf.subheading("What's working");
    if (growthProfile.what_working.length > 0) {
      for (const item of growthProfile.what_working) pdf.text(`• ${item.insight}`);
    } else {
      pdf.text("Nothing yet.");
    }
    pdf.subheading("What's not working");
    if (growthProfile.what_not_working.length > 0) {
      for (const item of growthProfile.what_not_working) pdf.text(`• ${item.insight}`);
    } else {
      pdf.text("Nothing yet.");
    }
  } else {
    pdf.text("No growth profile yet.");
  }

  pdf.heading(`Quests (${quests.length})`);
  if (quests.length > 0) {
    for (const quest of quests) {
      pdf.subheading(quest.title);
      pdf.text(
        `Category: ${label(quest.category)} · Status: ${label(quest.status)} · XP: ${quest.xp_value}`,
        { size: 9, color: [0.4, 0.4, 0.4] },
      );
      pdf.text(
        `Created: ${formatDate(quest.created_at)}${
          quest.resolved_at ? ` · Resolved: ${formatDate(quest.resolved_at)}` : ""
        }`,
        { size: 9, color: [0.4, 0.4, 0.4] },
      );
    }
  } else {
    pdf.text("No quests yet.");
  }

  pdf.heading(`Quest results (${questResults.length})`);
  if (questResults.length > 0) {
    for (const result of questResults) {
      pdf.subheading(questTitleById.get(result.quest_id) ?? "Quest");
      pdf.text(`Reported: ${formatDate(result.reported_at)}`, { size: 9, color: [0.4, 0.4, 0.4] });
      const answers = Object.entries(result.structured_answers)
        .map(([key, value]) => `${label(key)}: ${value}`)
        .join(" · ");
      if (answers) pdf.text(answers, { size: 9 });
      if (result.notes) pdf.text(`Notes: ${result.notes}`, { size: 9 });
    }
  } else {
    pdf.text("No quest results yet.");
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
    pdf.text("No customer events yet.");
  }

  pdf.heading(`Uploaded documents (${documents.length})`);
  if (documents.length > 0) {
    for (const doc of documents) {
      pdf.text(`${formatDate(doc.created_at)} — ${label(doc.type)}: ${doc.source}`, { size: 9 });
    }
  } else {
    pdf.text("No uploaded documents.");
  }

  pdf.heading(`Notifications (${notifications.length})`);
  if (notifications.length > 0) {
    for (const n of notifications) {
      pdf.text(
        `${formatDate(n.sent_at)} — [${n.channel}] ${label(n.type)}: ${n.message}`,
        { size: 9 },
      );
    }
  } else {
    pdf.text("No notifications yet.");
  }

  return pdf.save();
}
