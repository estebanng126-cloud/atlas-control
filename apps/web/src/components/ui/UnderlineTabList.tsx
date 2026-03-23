/**
 * Lista horizontal de tabs estilo texto + subrayado (p. ej. Xbox: activo con barra redondeada).
 * Recibe una lista `{ id, label }[]`; la selección es por `id` estable.
 */
export type UnderlineTabListItem<T extends string = string> = {
  id: T;
  label: string;
};

export type UnderlineTabListProps<T extends string> = {
  items: readonly UnderlineTabListItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  /** Accesible: nombre del grupo de pestañas */
  ariaLabel?: string;
  /** Si existe, referencia al id del título visible del módulo (`aria-labelledby`) */
  ariaLabelledBy?: string;
  className?: string;
  hidden?: boolean;
};

export function UnderlineTabList<T extends string>({
  items,
  activeId,
  onSelect,
  ariaLabel = "Tabs",
  ariaLabelledBy,
  className = "",
  hidden = false,
}: UnderlineTabListProps<T>) {
  const listClass = [
    "underline-tab-list",
    hidden && "underline-tab-list--hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const a11yName = ariaLabelledBy
    ? { "aria-labelledby": ariaLabelledBy }
    : { "aria-label": ariaLabel };

  return (
    <nav
      className={listClass}
      role="tablist"
      {...a11yName}
      aria-hidden={hidden}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`underline-tab-${item.id}`}
            aria-selected={isActive}
            className={isActive ? "underline-tab underline-tab--active" : "underline-tab"}
            onClick={() => onSelect(item.id)}
          >
            <span className="underline-tab__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
