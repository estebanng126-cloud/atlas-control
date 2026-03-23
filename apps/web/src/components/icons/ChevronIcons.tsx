const baseSvg = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24" as const,
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg" as const,
};

const stroke = {
  stroke: "currentColor" as const,
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** ‹ — colapsar / ocultar hacia la izquierda */
export function IconChevronLeft() {
  return (
    <svg {...baseSvg} aria-hidden>
      <path d="m15 18-6-6 6-6" {...stroke} />
    </svg>
  );
}

/** › — expandir / mostrar hacia la derecha */
export function IconChevronRight() {
  return (
    <svg {...baseSvg} aria-hidden>
      <path d="m9 18 6-6-6-6" {...stroke} />
    </svg>
  );
}

/** ∨ — cerrado / abrir dropdown */
export function IconChevronDown() {
  return (
    <svg {...baseSvg} aria-hidden>
      <path d="M6 9l6 6 6-6" {...stroke} />
    </svg>
  );
}

/** ∧ — abierto / cerrar dropdown */
export function IconChevronUp() {
  return (
    <svg {...baseSvg} aria-hidden>
      <path d="M18 15l-6-6-6 6" {...stroke} />
    </svg>
  );
}
