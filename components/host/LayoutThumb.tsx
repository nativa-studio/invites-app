// Little drawings of each layout's shape. Used on the Layout tab, where the difference has to be
// visible before the preview loads, and on the event list, where an event with no artwork of its
// own still needs to look like the invite it will become.

export function LayoutThumb({ id }: { id: string }) {
  const ink = "#2B2119", tint = "#E3D7BF", art = "#EFB93C";
  const box = { width: 56, height: 84, viewBox: "0 0 56 84" } as const;
  if (id === "lineup") {
    return (
      <svg {...box} aria-hidden="true">
        <rect x="1" y="1" width="54" height="82" rx="6" fill="#FDF6E4" stroke={ink} strokeWidth="1.6" />
        <rect x="14" y="10" width="28" height="4" rx="2" fill={ink} />
        <rect x="18" y="18" width="20" height="3" rx="1.5" fill={tint} />
        <rect x="4" y="27" width="48" height="13" rx="2" fill={art} />
        <rect x="10" y="46" width="36" height="2.5" rx="1.25" fill={tint} />
        <rect x="10" y="53" width="36" height="2.5" rx="1.25" fill={tint} />
        <rect x="10" y="60" width="26" height="2.5" rx="1.25" fill={tint} />
        <rect x="14" y="70" width="28" height="7" rx="3.5" fill="#E0553F" />
      </svg>
    );
  }
  return (
    <svg {...box} aria-hidden="true">
      <rect x="1" y="1" width="54" height="82" rx="6" fill="#FDF6E4" stroke={ink} strokeWidth="1.6" />
      <rect x="6" y="6" width="44" height="30" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.4" />
      <path d="M6 8 L28 24 L50 8" fill="none" stroke={ink} strokeWidth="1.4" />
      <rect x="9" y="42" width="38" height="13" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.2" />
      <rect x="9" y="59" width="38" height="13" rx="3" fill="#FFFDF6" stroke={ink} strokeWidth="1.2" />
    </svg>
  );
}
