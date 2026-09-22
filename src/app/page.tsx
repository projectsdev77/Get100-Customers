import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Get100-Customers
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          An AI growth coach to get your startup to its first 100 customers.
        </p>
        <div className="mt-2 flex gap-4">
          <Link
            href="/signup"
            className="rounded bg-black px-5 py-2 text-white dark:bg-zinc-50 dark:text-black"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded border border-zinc-300 px-5 py-2 text-black dark:border-zinc-700 dark:text-zinc-50"
          >
            Log in
          </Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          See PHASES.md for the build sequence and SPEC.md for the product spec.
        </p>
      </main>
    </div>
  );
}
