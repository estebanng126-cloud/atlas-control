import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export type BasePanelVariant = "default" | "plain";

type BasePanelProps<T extends ElementType = "div"> = {
  as?: T;
  /** `default`: fondo, borde y sombra del panel. `plain`: sin fondo, borde ni sombra (solo contenedor). */
  variant?: BasePanelVariant;
  className?: string;
  children?: ReactNode;
} & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "variant" | "className" | "children"
>;

export function BasePanel<T extends ElementType = "div">({
  as,
  variant = "default",
  className,
  children,
  ...rest
}: BasePanelProps<T>) {
  const Component = (as ?? "div") as ElementType;
  const variantClass =
    variant === "plain" ? "base-panel base-panel--plain" : "base-panel";
  const classes = className
    ? `${variantClass} ${className}`.trim()
    : variantClass;

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}

