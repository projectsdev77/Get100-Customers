import { appendStrategyHistory } from "./append-strategy-history";

// A downward customer-count correction is logged into the growth
// profile's strategy_history so future coaching (quest generation, chat)
// addresses it instead of silently ignoring it (SPEC §14).
export async function flagChurnEvent(
  founderId: string,
  oldCount: number,
  newCount: number,
): Promise<void> {
  await appendStrategyHistory(
    founderId,
    `Customer count corrected down from ${oldCount} to ${newCount} (churn or correction).`,
  );
}
