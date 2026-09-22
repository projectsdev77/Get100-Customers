"use client";

import { useState, useTransition } from "react";
import { analyzeSource, completeOnboarding, type ExtractedFields } from "./actions";
import type { Founder } from "@/types/database";

const CHANNEL_OPTIONS = [
  { value: "cold_email", label: "Cold email" },
  { value: "warm_intros", label: "Warm intros" },
  { value: "communities", label: "Online communities" },
  { value: "content", label: "Content" },
  { value: "paid", label: "Paid ads" },
  { value: "partnerships", label: "Partnerships" },
];

interface FormState {
  name: string;
  company_name: string;
  industry: string;
  product_description: string;
  icp: string;
  stage: string;
  channels_tried: string[];
  current_customer_count: string;
}

function initialState(founder: Founder | null): FormState {
  return {
    name: founder?.name ?? "",
    company_name: founder?.company_name ?? "",
    industry: founder?.industry ?? "",
    product_description: founder?.product_description ?? "",
    icp: founder?.icp ?? "",
    stage: founder?.stage ?? "",
    channels_tried: founder?.channels_tried ?? [],
    current_customer_count: String(founder?.current_customer_count ?? 0),
  };
}

const inputClass = "w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export function OnboardingWizard({ founder }: { founder: Founder | null }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initialState(founder));
  const [url, setUrl] = useState("");
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [isAnalyzing, startAnalyzing] = useTransition();

  function applyExtracted(extracted: ExtractedFields) {
    setData((prev) => ({
      ...prev,
      company_name: extracted.company_name ?? prev.company_name,
      industry: extracted.industry ?? prev.industry,
      product_description: extracted.product_description ?? prev.product_description,
      icp: extracted.icp ?? prev.icp,
      stage: extracted.stage_guess ?? prev.stage,
    }));
  }

  function handleAnalyze() {
    setAnalyzeError(null);
    const formData = new FormData();
    const fileInput = document.getElementById("onboarding-file") as HTMLInputElement | null;
    if (url.trim()) {
      formData.set("url", url.trim());
    } else if (fileInput?.files?.[0]) {
      formData.set("file", fileInput.files[0]);
    } else {
      setAnalyzeError("Paste a URL or choose a file first.");
      return;
    }

    startAnalyzing(async () => {
      const result = await analyzeSource(formData);
      if (result.error) {
        setAnalyzeError(result.error);
        return;
      }
      if (result.extracted) {
        applyExtracted(result.extracted);
        setAnalyzed(true);
      }
    });
  }

  const steps = [
    {
      title: "Got a website or notes? (optional)",
      body: (
        <div className="flex flex-col gap-3">
          <input
            className={inputClass}
            placeholder="https://yourproduct.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">or</p>
          <input id="onboarding-file" type="file" accept=".txt,.md" />
          {analyzeError && <p className="text-sm text-red-600 dark:text-red-400">{analyzeError}</p>}
          {analyzed && (
            <p className="text-sm text-green-700 dark:text-green-400">
              Pre-filled what we could find — you&apos;ll review every field next.
            </p>
          )}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="self-start rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {isAnalyzing ? "Analyzing…" : "Analyze"}
          </button>
        </div>
      ),
    },
    {
      title: "What's your company or product called?",
      body: (
        <input
          className={inputClass}
          value={data.company_name}
          onChange={(e) => setData({ ...data, company_name: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "What industry are you in?",
      body: (
        <input
          className={inputClass}
          value={data.industry}
          onChange={(e) => setData({ ...data, industry: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "In one line, what does your product do?",
      body: (
        <textarea
          className={inputClass}
          rows={3}
          value={data.product_description}
          onChange={(e) => setData({ ...data, product_description: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "Who's your target customer?",
      body: (
        <input
          className={inputClass}
          value={data.icp}
          onChange={(e) => setData({ ...data, icp: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "What stage are you at?",
      body: (
        <div className="flex gap-2">
          {(["idea", "prototype", "launched"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setData({ ...data, stage: s })}
              className={`rounded border px-4 py-2 text-sm capitalize ${
                data.stage === s
                  ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Which channels have you already tried?",
      body: (
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map((c) => {
            const selected = data.channels_tried.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                onClick={() =>
                  setData({
                    ...data,
                    channels_tried: selected
                      ? data.channels_tried.filter((v) => v !== c.value)
                      : [...data.channels_tried, c.value],
                  })
                }
                className={`rounded border px-3 py-1.5 text-sm ${
                  selected
                    ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "How many customers do you have today?",
      body: (
        <input
          type="number"
          min={0}
          className={inputClass}
          value={data.current_customer_count}
          onChange={(e) => setData({ ...data, current_customer_count: e.target.value })}
          autoFocus
        />
      ),
    },
  ];

  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="h-1 w-full rounded bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-1 rounded bg-black transition-all dark:bg-zinc-50"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        {steps[step].title}
      </h1>
      {steps[step].body}

      {isLastStep ? (
        <form action={completeOnboarding} className="flex justify-between">
          <input type="hidden" name="name" value={data.name} />
          <input type="hidden" name="company_name" value={data.company_name} />
          <input type="hidden" name="industry" value={data.industry} />
          <input type="hidden" name="product_description" value={data.product_description} />
          <input type="hidden" name="icp" value={data.icp} />
          <input type="hidden" name="stage" value={data.stage} />
          {data.channels_tried.map((c) => (
            <input key={c} type="hidden" name="channels_tried" value={c} />
          ))}
          <input
            type="hidden"
            name="current_customer_count"
            value={data.current_customer_count}
          />
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded bg-black px-5 py-2 text-white dark:bg-zinc-50 dark:text-black"
          >
            Start my quest log
          </button>
        </form>
      ) : (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={isFirstStep}
            className="rounded border border-zinc-300 px-4 py-2 text-sm disabled:opacity-0 dark:border-zinc-700"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="rounded bg-black px-5 py-2 text-white dark:bg-zinc-50 dark:text-black"
          >
            {step === 0 ? "Skip" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
