"use client";

import { useState, useTransition } from "react";
import { analyzeSource, completeOnboarding, type ExtractedFields } from "./actions";
import type { Founder } from "@/types/database";
import { Stepper } from "@/components/ui/navigation/Stepper";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { ChipGroup } from "@/components/ui/forms/Chip";
import { Button } from "@/components/ui/actions/Button";
import { Banner } from "@/components/ui/surfaces/Banner";
import {
  CHANNEL_OPTIONS,
  CHANNEL_VALUES,
  CHANNEL_LABELS,
  STAGE_OPTIONS,
  STAGE_VALUES,
  STAGE_LABELS,
  HOURS_OPTIONS,
  HOURS_VALUES,
  HOURS_LABELS,
} from "@/lib/founders/field-options";

interface FormState {
  name: string;
  company_name: string;
  industry: string;
  product_description: string;
  icp: string;
  stage: string;
  channels_tried: string[];
  current_customer_count: string;
  weekly_hours: string;
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
    weekly_hours: founder?.weekly_hours ?? "",
  };
}

export function OnboardingWizard({ founder }: { founder: Founder | null }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initialState(founder));
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeNotice, setAnalyzeNotice] = useState<string | null>(null);
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
    setAnalyzeNotice(null);
    setAnalyzed(false);
    if (!url.trim() && !file) {
      setAnalyzeError("Paste a URL or upload a file first.");
      return;
    }
    const formData = new FormData();
    if (url.trim()) formData.set("url", url.trim());
    if (file) formData.set("file", file);

    startAnalyzing(async () => {
      const result = await analyzeSource(formData);
      if (result.error) {
        setAnalyzeError(result.error);
        return;
      }
      if (result.extracted) {
        // The AI can run successfully and still find nothing worth extracting
        // (thin or JS-rendered marketing sites) — that's not an error, but it's
        // not a "pre-filled" success either, so it gets its own message rather
        // than the misleading green banner. `summary` is excluded here since
        // it's always present (the one required field in the schema) and
        // would otherwise always make this look like a match.
        const { company_name, industry, product_description, icp, stage_guess, summary } =
          result.extracted;
        const foundAnything = [company_name, industry, product_description, icp, stage_guess].some(
          (value) => value !== null,
        );
        if (!foundAnything) {
          setAnalyzeNotice(
            `Couldn't find enough on that page to pre-fill anything. No worries — just fill in the fields on the next steps.${
              summary ? ` (What the AI read from it: "${summary}")` : ""
            }`,
          );
          return;
        }
        applyExtracted(result.extracted);
        setAnalyzed(true);
      }
    });
  }

  const reviewRows: Array<[string, string]> = [
    ["Company", data.company_name],
    ["Industry", data.industry],
    ["What you sell", data.product_description],
    ["Ideal customer", data.icp],
    ["Stage", STAGE_LABELS[data.stage] ?? data.stage],
    ["Channels tried", data.channels_tried.map((c) => CHANNEL_LABELS[c] ?? c).join(", ")],
    ["Customers today", data.current_customer_count],
    ["Hours a week", HOURS_LABELS[data.weekly_hours] ?? data.weekly_hours],
  ];

  const steps = [
    {
      title: "Got a website or notes? (optional)",
      body: (
        <div className="flex flex-col gap-3">
          <Input
            placeholder="https://yourproduct.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex items-center gap-3 text-xs text-secondary">
            <div className="h-px flex-1 bg-subtle" />
            or
            <div className="h-px flex-1 bg-subtle" />
          </div>
          <label className="flex h-11 w-full cursor-pointer items-center justify-center rounded-field border border-dashed border-strong bg-card px-3.5 text-sm text-secondary transition-colors hover:border-accent">
            {file ? file.name : "Upload notes (.txt or .md)"}
            <input
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {analyzeError && <Banner tone="error">{analyzeError}</Banner>}
          {analyzeNotice && <Banner tone="info">{analyzeNotice}</Banner>}
          {analyzed && (
            <Banner tone="success">
              Pre-filled what we could find. You&apos;ll review every field next.
            </Banner>
          )}
          <Button type="button" variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? "Analyzing…" : "Analyze"}
          </Button>
        </div>
      ),
    },
    {
      title: "What's your company or product called?",
      body: (
        <Input
          value={data.company_name}
          onChange={(e) => setData({ ...data, company_name: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "What industry are you in?",
      body: (
        <Input
          value={data.industry}
          onChange={(e) => setData({ ...data, industry: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "In one line, what does your product do?",
      body: (
        <Textarea
          rows={3}
          value={data.product_description}
          onChange={(e) => setData({ ...data, product_description: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "Who's your target customer?",
      hint: "Ideal customer profile. Be specific.",
      body: (
        <Input value={data.icp} onChange={(e) => setData({ ...data, icp: e.target.value })} autoFocus />
      ),
    },
    {
      title: "What stage are you at?",
      body: (
        <ChipGroup
          options={STAGE_OPTIONS}
          multi={false}
          value={STAGE_LABELS[data.stage] ?? ""}
          onChange={(v) => setData({ ...data, stage: STAGE_VALUES[v as string] })}
        />
      ),
    },
    {
      title: "Which channels have you already tried?",
      body: (
        <ChipGroup
          options={CHANNEL_OPTIONS}
          multi
          value={data.channels_tried.map((c) => CHANNEL_LABELS[c] ?? c)}
          onChange={(v) =>
            setData({ ...data, channels_tried: (v as string[]).map((label) => CHANNEL_VALUES[label]) })
          }
        />
      ),
    },
    {
      title: "How many customers do you have today?",
      hint: "Paying or committed. A rough number is fine.",
      body: (
        <Input
          type="number"
          min={0}
          value={data.current_customer_count}
          onChange={(e) => setData({ ...data, current_customer_count: e.target.value })}
          autoFocus
        />
      ),
    },
    {
      title: "How many hours a week can you give this?",
      hint: "We size quests to fit.",
      body: (
        <ChipGroup
          options={HOURS_OPTIONS}
          multi={false}
          value={HOURS_LABELS[data.weekly_hours] ?? ""}
          onChange={(v) => setData({ ...data, weekly_hours: HOURS_VALUES[v as string] })}
        />
      ),
    },
    {
      title: "Does this look right?",
      hint: "You can change any of this later in Settings.",
      body: (
        <div className="flex flex-col rounded-tile bg-sunken px-4">
          {reviewRows.map(([label, value], i) => (
            <div
              key={label}
              className={`grid grid-cols-[140px_minmax(0,1fr)] items-baseline gap-3 py-4 ${i ? "border-t border-strong" : ""}`}
            >
              <span className="text-[13px] font-medium text-secondary">{label}</span>
              <span className="text-sm text-primary">{value || "-"}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;
  const current = steps[step];

  return (
    <div className="flex flex-col gap-6">
      <Stepper step={step + 1} total={steps.length} />

      <h1 className="text-2xl font-medium leading-[1.25] tracking-[-0.01em] text-primary">
        {current.title}
      </h1>
      {"hint" in current && current.hint && <p className="-mt-4 text-sm text-secondary">{current.hint}</p>}
      {current.body}

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
          <input type="hidden" name="current_customer_count" value={data.current_customer_count} />
          <input type="hidden" name="weekly_hours" value={data.weekly_hours} />
          <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
          <Button type="submit">Start my quest log</Button>
        </form>
      ) : (
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={isFirstStep}
            className={isFirstStep ? "invisible" : ""}
          >
            Back
          </Button>
          <Button type="button" onClick={() => setStep(step + 1)}>
            {step === 0 ? "Continue" : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}
