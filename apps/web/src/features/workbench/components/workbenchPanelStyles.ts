import type { CSSProperties } from "react";

/** Flex column shell: header fijo arriba, cuerpo con scroll/overflow propio. */
export const workbenchPanelRootStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
  flex: "1 1 auto",
  minHeight: 0,
  minWidth: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

/** Contenedor del cuerpo bajo el header (el hijo suele ser el que hace scroll). */
export const workbenchPanelBodyStyle: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "hidden",
};

/**
 * Franja común de headers de panel: fija en la columna, borde inferior, `minWidth: 0` para que filas internas (p. ej. tabs) puedan hacer scroll horizontal.
 */
export const workbenchPanelHeaderStripStyle: CSSProperties = {
  flexShrink: 0,
  minWidth: 0,
  borderBottom: "0.5px solid var(--screen-border)",
};

/** Header de título (texto); extiende la franja con padding y tipografía del screen contract. */
export const workbenchPanelTitleHeaderStyle: CSSProperties = {
  ...workbenchPanelHeaderStripStyle,
  padding: "var(--screen-header-padding-y) var(--screen-header-padding-x)",
  fontSize: "var(--screen-header-font-size)",
  fontWeight: "var(--screen-header-font-weight)",
  lineHeight: "var(--line-height-tight)",
};
