import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFounder } from "@/lib/founders/get-founder";

// Account data export (SPEC §13 privacy baseline). Session-scoped client
// throughout — every table here has an RLS policy that lets the founder
// read their own rows, so no admin client is needed for a read-only
// export of your own data.
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

  const payload = {
    exported_at: new Date().toISOString(),
    founder,
    founder_documents: documents.data ?? [],
    growth_profile: growthProfile.data ?? null,
    quests: quests.data ?? [],
    quest_results: questResults.data ?? [],
    customer_events: customerEvents.data ?? [],
    subscription: subscription.data ?? null,
    notifications: notifications.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="get100-customers-export-${founder.id}.json"`,
    },
  });
}
