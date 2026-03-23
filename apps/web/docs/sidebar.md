# Sidebar — arquitectura

## Decisión (canon)

**El sidebar se considera un componente compuesto, construido por composición, desde el shell principal hasta sus piezas internas reutilizables.**

En la práctica:

- **El shell** (`Sidebar` + columnas): layout, orden, scroll, `gap` y spacing estructural (ver comentario en `main-screen.css` junto a `.sidebar-column`).
- **Los subcomponentes** (`UserCard`, grupos de navegación, slots con `children`, footer slot): contenido propio, `padding` interno y contratos explícitos (p. ej. ids estables en nav, no índice como contrato).

No es un bloque monolítico: cada pieza puede evolucionar o reutilizarse manteniendo las mismas reglas entre niveles.

## Sidebar colapsado (rail de iconos)

Cuando el sidebar está cerrado (`sidebar--closed`, 56px de ancho):

- Se ocultan búsqueda, `UserCard` y footer; siguen visibles el toggle y el **mismo árbol de navegación** (`children`: p. ej. demo slot1 + divisor + slot2), montado en el mismo bloque `.sidebar-content` para no perder estado al colapsar.
- `SidebarLayoutContext` expone `isOpen`; `SidebarNavButton` recibe `iconOnly={!isOpen}` (etiqueta oculta visualmente, `aria-label` cuando hace falta).

## Nav demo vs catálogo de producto

- **`src/components/sidebar/sidebarNav.types.ts`**: contrato de la nav **demo/prototipo** (`primary-1`, etc.). Sigue siendo el lienzo para iterar UI sin ligar rutas de producto.
- **`src/features/sidebar/`**: ids estables y catálogo **real** del producto (`SidebarItemId`, `sidebarItems`, `getSidebarItem`, `requireSidebarItem`). El shell/top bar leen etiquetas desde aquí (p. ej. `AppShell` → `TopBarModuleContextTrail`); no mezclar con los tipos demo.

## Referencias en código

- Entrada: [`src/components/Sidebar.tsx`](../src/components/Sidebar.tsx)
- Layout colapsado: [`src/components/SidebarLayoutContext.tsx`](../src/components/SidebarLayoutContext.tsx)
- Reglas de espaciado vertical: [`src/styles/main-screen.css`](../src/styles/main-screen.css) (`.sidebar-column` / `.sidebar-content`)
- Ids de nav demo: [`src/components/sidebar/sidebarNav.types.ts`](../src/components/sidebar/sidebarNav.types.ts)
- Catálogo producto (sidebar): [`src/features/sidebar/sidebarItemId.ts`](../src/features/sidebar/sidebarItemId.ts), [`src/features/sidebar/sidebarItems.tsx`](../src/features/sidebar/sidebarItems.tsx)
- Segunda fila de tabs del TopBar por módulo: [`src/features/sidebar/moduleTopBarTabRow.ts`](../src/features/sidebar/moduleTopBarTabRow.ts) (allowlist; Dashboard = una sola fila)
