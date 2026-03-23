const base = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24" as const,
  fill: "none" as const,
  xmlns: "http://www.w3.org/2000/svg" as const,
};

const stroke = {
  stroke: "currentColor" as const,
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Plus/añadir — para botón add del compositor */
export function IconAdd() {
  return (
    <svg {...base} aria-hidden>
      <path d="M12 5v14" {...stroke} />
      <path d="M5 12h14" {...stroke} />
    </svg>
  );
}

/** Clip/adjuntar archivos */
export function IconAttach() {
  return (
    <svg {...base} aria-hidden>
      <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 1 1 5.65 5.66l-9.2 9.19a2 2 0 1 1-2.82-2.83l8.49-8.48" {...stroke} />
    </svg>
  );
}

/** Imagen/galería */
export function IconCreateImage() {
  return (
    <svg {...base} aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" {...stroke} />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="m21 16-4.5-4.5L7 21" {...stroke} />
    </svg>
  );
}

/** Investigación profunda */
export function IconDeepResearch() {
  return (
    <svg {...base} aria-hidden>
      <path d="M10 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" {...stroke} />
      <path d="m14 14 7 7" {...stroke} />
      <path d="M7.5 7.5h5" {...stroke} />
      <path d="M10 5v5" {...stroke} />
    </svg>
  );
}

/** Bolsa/lupa */
export function IconShoppingResearch() {
  return (
    <svg {...base} aria-hidden>
      <path d="M6 8h12l-1 10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" {...stroke} />
      <path d="M9 8a3 3 0 0 1 6 0" {...stroke} />
      <circle cx="18.5" cy="18.5" r="2.5" {...stroke} />
      <path d="m20.4 20.4 1.6 1.6" {...stroke} />
    </svg>
  );
}

/** Globo/web */
export function IconWebSearch() {
  return (
    <svg {...base} aria-hidden>
      <circle cx="12" cy="12" r="9" {...stroke} />
      <path d="M3 12h18" {...stroke} />
      <path d="M12 3a15 15 0 0 1 0 18" {...stroke} />
      <path d="M12 3a15 15 0 0 0 0 18" {...stroke} />
    </svg>
  );
}

/** Más opciones */
export function IconMore() {
  return (
    <svg {...base} aria-hidden>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Cerrar/eliminar adjunto */
export function IconClose() {
  return (
    <svg {...base} aria-hidden>
      <path d="M16 8 8 16M8 8l8 8" {...stroke} />
    </svg>
  );
}

/** Robot/agente — para botón Agent del compositor */
export function IconAgent() {
  return (
    <svg {...base} aria-hidden>
      <path d="M12 8V4H8" {...stroke} />
      <rect x="4" y="10" width="16" height="10" rx="2" {...stroke} />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      <path d="M12 16v2" {...stroke} />
    </svg>
  );
}

/** Rayo/chispa — para botón Auto del compositor */
export function IconAuto() {
  return (
    <svg {...base} aria-hidden>
      <path d="m13 2-3 8h4l-2 8 8-12h-4l3-4z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Flecha de envío — para acción primaria del compositor */
export function IconSend() {
  return (
    <svg {...base} aria-hidden>
      <path d="M12 20V6" {...stroke} />
      <path d="m6 12 6-6 6 6" {...stroke} />
    </svg>
  );
}
