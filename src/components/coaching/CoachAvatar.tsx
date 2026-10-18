function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function CoachAvatar({
  name,
  photoUrl,
  size = 56,
}: {
  name: string;
  photoUrl: string | null;
  size?: number;
}) {
  const style = { width: size, height: size };
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        style={style}
        className="shrink-0 rounded-full bg-sunken object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={style}
      className="grid shrink-0 place-items-center rounded-full bg-tile-level text-base font-medium text-on-tile"
    >
      {initials(name)}
    </span>
  );
}
