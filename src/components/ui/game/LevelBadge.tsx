export function LevelBadge({ level = 1 }: { level?: number }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-tile-level px-2.5 text-xs font-medium text-on-tile">
      Level {level}
    </span>
  );
}

export function XpPill({ xp }: { xp: number }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-tile-level px-2.5 text-xs font-medium text-on-tile">
      +{xp} XP
    </span>
  );
}
