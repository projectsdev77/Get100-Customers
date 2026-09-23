import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/actions/Button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <main className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-medium tracking-[-0.01em] text-primary">
          Get100-Customers
        </h1>
        <p className="text-lg text-secondary">
          An AI growth coach to get your startup to its first 100 customers.
        </p>
        <div className="mt-2 flex gap-3">
          <LinkButton href="/signup">Sign up</LinkButton>
          <LinkButton href="/login" variant="outline">
            Log in
          </LinkButton>
        </div>
        <p className="mt-6 text-sm text-secondary">
          See PHASES.md for the build sequence and SPEC.md for the product spec.
        </p>
      </main>
    </div>
  );
}
