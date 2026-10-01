// Kill switch for the celebrations/illustrations UI layer (handoff round 1:
// "Ship behind a feature flag ... so it can be switched off without a
// deploy"). No feature-flag service exists in this app and adding a DB
// column would be a schema change the handoff explicitly forbids, so this
// reads a plain env var instead — default on, set
// NEXT_PUBLIC_UI_CELEBRATIONS_V1=false to disable. Every new visual piece
// this flag gates must leave the screen pixel-identical to before when off.
export const CELEBRATIONS_ENABLED = process.env.NEXT_PUBLIC_UI_CELEBRATIONS_V1 !== "false";
