const base = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24" as const,
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg" as const,
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Pantalla + pie; est inspiración consola (trazo fino) */
export function IconUserCardCast() {
  return (
    <svg {...base} aria-hidden>
      <rect x="5" y="6" width="14" height="11" rx="1.5" {...stroke} />
      <path d="M10 17h4" {...stroke} />
      <path d="M8 4s2.5 2 4 2 4-2 4-2" {...stroke} />
    </svg>
  );
}

export function IconUserCardBell() {
  return (
    <svg {...base} aria-hidden>
      <path d="M8 10a4 4 0 1 1 8 0c0 5 2 5 2 7H6c0-2 2-2 2-7" {...stroke} />
      <path d="M10 20h4" {...stroke} />
    </svg>
  );
}

/** Reloj — historial de chat */
export function IconHistory() {
  return (
    <svg {...base} aria-hidden>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M12 7v5l3 3" {...stroke} />
    </svg>
  );
}
