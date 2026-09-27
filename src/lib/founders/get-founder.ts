import type { createClient } from "@/lib/supabase/server";
import type { Founder } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getCurrentFounder(
  supabase: SupabaseServerClient,
): Promise<Founder | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: founder } = await supabase
    .from("founders")
    .select("*")
    .eq("auth_user_id", user.id)
    .single<Founder>();

  return founder ?? null;
}
