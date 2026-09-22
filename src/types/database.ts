// Hand-written types mirroring supabase/schema.sql (SPEC.md §19).
// Regenerate/replace with `supabase gen types typescript` once a real
// project exists (Phase 1) if generated types are preferred over these.

export type QuestStatus =
  | "suggested"
  | "active"
  | "in_progress"
  | "awaiting_report"
  | "completed"
  | "skipped"
  | "expired";

export type FounderStage = "idea" | "prototype" | "launched";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "restricted"
  | "canceled";

export interface Founder {
  id: string;
  auth_user_id: string;
  name: string | null;
  company_name: string | null;
  industry: string | null;
  product_description: string | null;
  icp: string | null;
  stage: FounderStage | null;
  channels_tried: string[];
  current_customer_count: number;
  level: number;
  xp: number;
  streak_count: number;
  created_at: string;
  updated_at: string;
}

export interface FounderDocument {
  id: string;
  founder_id: string;
  type: "url" | "upload";
  source: string;
  extracted_summary: string | null;
  created_at: string;
}

export interface GrowthProfile {
  id: string;
  founder_id: string;
  channels_tried: Record<string, { attempts: number; successes: number; conversion_rate: number }>;
  what_working: Array<{ insight: string; evidence?: string }>;
  what_not_working: Array<{ insight: string; evidence?: string }>;
  bottleneck_hypothesis: string | null;
  strategy_history: Array<{ date: string; summary: string }>;
  last_updated: string;
}

export interface QuestTemplate {
  id: string;
  category: string;
  industry_tags: string[];
  stage_tags: string[];
  title_template: string;
  instructions_template: string;
  default_xp: number;
  default_window_days: number;
  result_question_set: Array<{ id: string; prompt: string; type: "number" | "text" | "boolean" }>;
  tool_templates: Array<{ label: string; content: string }>;
  created_at: string;
}

export interface Quest {
  id: string;
  founder_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  category: string | null;
  xp_value: number;
  tools_provided: Array<{ label: string; content: string }>;
  result_questions: Array<{ id: string; prompt: string; type: "number" | "text" | "boolean" }>;
  success_criteria: string | null;
  sub_tasks: Array<{ label: string; done: boolean }>;
  suggested_window: string | null;
  expires_at: string | null;
  status: QuestStatus;
  skip_reason: string | null;
  created_at: string;
  resolved_at: string | null;
  completed_at: string | null;
}

export interface QuestResult {
  id: string;
  quest_id: string;
  founder_id: string;
  structured_answers: Record<string, string | number | boolean>;
  notes: string | null;
  ai_summary: string | null;
  reported_at: string;
}

export interface CustomerEvent {
  id: string;
  founder_id: string;
  quest_id: string | null;
  event_type: "reported" | "corrected";
  delta: number;
  reported_at: string;
  note: string | null;
}

export interface Subscription {
  id: string;
  founder_id: string;
  plan: string;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  billing_provider: string | null;
  billing_provider_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationLogEntry {
  id: string;
  founder_id: string;
  type: string;
  channel: "in_app" | "email";
  sent_at: string;
}

export interface AdminUser {
  id: string;
  auth_user_id: string;
  role: string;
  created_at: string;
}
