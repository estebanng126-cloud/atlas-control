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

export function IconCopy() {
  return (
    <svg {...base} aria-hidden>
      <rect x="9" y="9" width="10" height="10" rx="2" {...stroke} />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" {...stroke} />
    </svg>
  );
}

export function IconPencil() {
  return (
    <svg {...base} aria-hidden>
      <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" {...stroke} />
      <path d="m13.5 6.5 4 4" {...stroke} />
    </svg>
  );
}

export function IconRotateCcw() {
  return (
    <svg {...base} aria-hidden>
      <path d="M3 10V4h6" {...stroke} />
      <path d="M3.5 9A8 8 0 1 0 6 5.5L3 8" {...stroke} />
    </svg>
  );
}

export function IconEllipsis() {
  return (
    <svg {...base} aria-hidden>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconExternalLink() {
  return (
    <svg {...base} aria-hidden>
      <path d="M14 5h5v5" {...stroke} />
      <path d="M10 14 19 5" {...stroke} />
      <path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" {...stroke} />
    </svg>
  );
}

export function IconDownload() {
  return (
    <svg {...base} aria-hidden>
      <path d="M12 4v10" {...stroke} />
      <path d="m8 10 4 4 4-4" {...stroke} />
      <path d="M5 19h14" {...stroke} />
    </svg>
  );
}

export function IconSparkles() {
  return (
    <svg {...base} aria-hidden>
      <path d="m12 3 1.2 3.1L16.5 7.5l-3.3 1.4L12 12l-1.2-3.1L7.5 7.5l3.3-1.4L12 3Z" {...stroke} />
      <path d="m18.5 13 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" {...stroke} />
      <path d="m6 14 .9 2.3 2.3.9-2.3.9L6 20.4l-.9-2.3-2.3-.9 2.3-.9L6 14Z" {...stroke} />
    </svg>
  );
}
