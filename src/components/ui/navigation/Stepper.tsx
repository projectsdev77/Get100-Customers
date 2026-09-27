export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < step ? "bg-accent" : "bg-subtle"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-secondary">
        Step {step} of {total}
      </span>
    </div>
  );
}
