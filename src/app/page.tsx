export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Get100-Customers
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Scaffold in progress. See{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            PHASES.md
          </code>{" "}
          for the build sequence and{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            SPEC.md
          </code>{" "}
          for the product spec.
        </p>
      </main>
    </div>
  );
}
