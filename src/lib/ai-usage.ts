export const FREE_AI_SUMMARY_LIMIT = 3;
export const PREMIUM_AI_SUMMARY_LIMIT = 999999;

export function isUnlimitedAiUsageLimit(limit: number): boolean {
  return limit >= PREMIUM_AI_SUMMARY_LIMIT;
}
