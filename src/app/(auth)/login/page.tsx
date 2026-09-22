import Link from "next/link";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Log in</h1>

        {params.message === "check-email" && (
          <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
            Check your email to confirm your account, then log in.
          </p>
        )}
        {params.error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">
            {params.error}
          </p>
        )}

        <form action={login} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Password
            <input
              type="password"
              name="password"
              required
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded bg-black px-4 py-2 text-white dark:bg-zinc-50 dark:text-black"
          >
            Log in
          </button>
        </form>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          No account?{" "}
          <Link href="/signup" className="font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
