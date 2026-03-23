/** Iconos tipo ventana (trazo fino, sin dependencias). Mismo tamaño visual que Lucide con iconButtonLucideDefaults */

const baseSvg = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24" as const,
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg" as const,
};

export function IconWindowMinimize() {
  return (
    <svg {...baseSvg} aria-hidden>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWindowMaximize() {
  return (
    <svg {...baseSvg} aria-hidden>
      <rect
        x={4.5}
        y={4.5}
        width={15}
        height={15}
        rx={1.5}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWindowClose() {
  return (
    <svg {...baseSvg} aria-hidden>
      <path
        d="M16 8 8 16M8 8l8 8"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
