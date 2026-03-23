# Layout del shell (sin componente `Slot`)

El antiguo componente `<Slot />` y las clases CSS `.slot*` **se retiraron**: no había usos en `AppShell` y duplicaban responsabilidad con contenedores semánticos por región.

## Dónde vive el layout hoy

| Región | Contenedor principal |
|--------|----------------------|
| Sidebar (nav) | [`Sidebar`](../src/components/Sidebar.tsx) → `.sidebar-nav-region` |
| Top bar (módulo › pestaña) | [`TopBarModuleContextTrail`](../src/components/TopBarModuleContextTrail.tsx) → `.top-bar-context-trail-wrap` |
| Top bar (celdas) | [`TopBar`](../src/components/TopBar.tsx) → `.top-bar-slot--left` / `--center` / `--right` (props `leftSlot` etc. = **composición**, no el componente eliminado) |
| Panel derecho | [`SidePanel`](../src/components/SidePanel.tsx) → `.side-panel-content` |
| Dropdown | [`DropdownButton`](../src/components/DropdownButton.tsx) → `.dropdown-btn__panel` + `.dropdown-btn__list` |

## Regla

Cada pieza del shell usa **clases y markup propios** del módulo; no reintroducir un wrapper genérico “slot” salvo que haya un caso claro documentado.

## Estilos

Ver [`src/styles/main-screen.css`](../src/styles/main-screen.css) (bloques `sidebar-*`, `top-bar-*`, `side-panel-*`, `dropdown-btn*`).
