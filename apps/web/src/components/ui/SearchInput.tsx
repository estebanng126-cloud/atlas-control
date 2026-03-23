import type { ComponentPropsWithoutRef } from "react";

type SearchInputProps = Omit<ComponentPropsWithoutRef<"input">, "className" | "type"> & {
  /** Clases en el contenedor píldora */
  className?: string;
};

function SearchIcon() {
  return (
    <svg
      className="search-input__icon-svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function SearchInput({
  className,
  placeholder = "Search…",
  ...props
}: SearchInputProps) {
  const wrapClass = className ? `search-input-wrap ${className}` : "search-input-wrap";

  return (
    <div className={wrapClass} role="search">
      <span className="search-input__icon" aria-hidden>
        <SearchIcon />
      </span>
      <input
        type="search"
        className="search-input"
        placeholder={placeholder}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}
