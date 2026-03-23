# Agent runtime — plan de control

Documento de mando para el runtime del agente en Atlas. Evita dispersar lógica entre muchos sitios y fija el orden de construcción.

## Fuente de verdad

Este archivo (`docs/agent-runtime-plan.md`) es la **única** referencia normativa para fases, orden y gobierno del runtime del agente. Si algo choca con otro doc, manda este.

---

## Estado actual del runtime

**Clasificación:** el runtime del agente integrado al chat es la **base oficial del chat**: integrado en la API, validado con pruebas y documentación de contrato, y **promovido** con los cinco gates cerrados **con evidencia** (detalle en el checklist más abajo).

**Lectura oficial:** ya no se trata de un modo experimental ni de una capacidad solo “internal” pendiente de promoción; es el comportamiento esperado del producto en este plano (evolución posterior = nuevas capacidades sobre esta base, no “subir de experimental”).

### Criterios de salida (subir a base oficial del chat)

**Estado:** **cumplidos.** Los cinco criterios siguientes fueron el umbral de promoción; hoy están cerrados de forma inequívoca (evidencia en el checklist operativo).

1. **Persistencia real** de sesión / estado de agente alineada con el modelo de chat.
2. **Smoke o E2E automatizado** estable sobre lo que se expone al cliente.
3. **Contrato estable** de endpoints y payloads como producto (no solo el comportamiento implícito de hoy).
4. **Tool runner mínimo** operativo y acotado.
5. **Apply controlado** o **flujo diff** explícito y revisable para cambios en el repo.

### Checklist operativo de promoción

Cada gate se cerró con **objetivo**, **condición mínima de cumplimiento** y **evidencia** verificable. **Los cinco están cerrados.**

#### 1. Persistencia real de sesión

- **Objetivo:** que el estado del agente sobreviva reinicios.
- **Cumple si:** `AgentSessionState` sale de memoria y vive en storage real.
- **Evidencia:** reinicio del proceso sin perder el estado esperado.
- **Estado:** **Cerrado.** Evidencia: pruebas de contrato p. ej. `apps/api/test/agent-session-persistence.test.ts` y alineación HTTP `apps/api/test/agent-state-http.test.ts`.

#### 2. Smoke / E2E automatizado

- **Objetivo:** validar el flujo sin depender de prueba manual.
- **Cumple si:** existe prueba automatizada de sesión + mensaje + respuesta + enriquecimiento o degradación acordada.
- **Evidencia:** comando reproducible pasando en CI o local de forma estable.
- **Estado:** **Cerrado.** Evidencia: `apps/api/test/chat-post-messages.smoke.test.ts`, `apps/api/test/chat-post-messages.degraded.test.ts` y carril `test:contract` en `apps/api/package.json`.

#### 3. Contrato estable del endpoint

- **Objetivo:** fijar la respuesta oficial del flujo de mensajes (y variantes).
- **Cumple si:** request/response y casos degradados están definidos y documentados.
- **Evidencia:** documentación + tipos + comportamiento real alineados entre sí.
- **Estado:** **Cerrado.** Evidencia: tipos y contrato en `apps/api/src/routes/postChatMessages.contract.ts` y documentación de producto en `docs/chat-agent-contract.md`.

#### 4. Tool runner mínimo

- **Objetivo:** dejar de ser solo contexto y ejecutar trabajo controlado desde el runtime.
- **Cumple si:** existe al menos una herramienta real invocable y acotada desde el runtime.
- **Evidencia:** una ejecución mínima reproducible y acotada (mismo input → mismo tipo de resultado).
- **Estado:** **Cerrado.** Evidencia: `apps/api/test/orchestrator-tool.test.ts`, `apps/api/test/agent-tools.test.ts`, `apps/api/test/agent-tools-http.test.ts` (incl. ausencia en prod vía proceso hijo).

#### 5. Apply real o workflow de diff explícito

- **Objetivo:** cerrar el loop de edición respecto al repo.
- **Cumple si:** o se aplican cambios reales de forma controlada, o existe un flujo oficial de diff preview + confirmación.
- **Evidencia:** recorrido completo documentado y probado (manual automatizable o automático).
- **Estado:** **Cerrado.** Evidencia: preview sin escritura a disco (`runOrchestratorEditPreview`), `apps/api/test/orchestrator-edit-preview.test.ts`, `apps/api/test/agent-edit-preview-http.test.ts` (incl. ausencia en prod), y guía manual §8 en `docs/chat-agent-e2e-manual.md`.

**Regla de promoción (histórica):** la subida a base oficial exigía **los cinco** gates cerrados **con evidencia**; ese estándar se cumplió y la promoción quedó cerrada.

### Orden oficial de ejecución

**Estado:** **ejecutado y completado.** Lo siguiente es **historial útil** (por qué se eligió ese orden en el trabajo real); **no** es un plan activo pendiente.

El orden de los apartados del checklist (1–5) es **temático**; el **orden en que se ejecutaron y cerraron** los gates en trabajo real fue el siguiente (dependencia + riesgo):

1. **Contrato estable del endpoint** — Primero: persistencia, pruebas y cliente se apoyan en un contrato fijo; si request/response y degradaciones siguen moviéndose, el resto se contamina.

2. **Smoke / E2E automatizado** — Segundo: red de seguridad antes de persistencia y tools; se fija comportamiento explícito y luego se automatiza la verificación de regresión.

3. **Persistencia real de sesión** — Tercero: con contrato cerrado y smoke verde, se puede sacar estado de memoria a storage sin ir a ciegas.

4. **Tool runner mínimo** — Cuarto: el runtime deja de solo “mirar” y empieza a “hacer”; sin contrato, tests y persistencia previos, la integración del runner es inestable.

5. **Apply real o workflow de diff explícito** — Quinto: paso más delicado (cambios reales o cierre formal de edición); no entra antes de tener base contratada, probada y persistente.

**Resumen:** fijar contrato → blindar con pruebas → sacar sesión de memoria → meter ejecución real → cerrar edición aplicada o confirmada.

**Nota (histórica):** durante la promoción no se adelantaban ni se reordenaban gates fuera de esta secuencia salvo **decisión técnica explícita** (excepción acordada y registrada, no improvisación).

### Nota final (post-promoción)

El runtime del agente **deja de clasificarse como experimental** y pasa a ser **base oficial del chat**. Las fases y entregables que vengan después son **evolución y nuevas capacidades** sobre esa base, no una segunda “promoción desde experimental”.

---

## Bloque 1 — Gobierno del plan

### Regla de ejecución

Cada bloque de trabajo debe declarar explícitamente:

- **objetivo**
- **alcance**
- **archivos permitidos**
- **reglas**
- **validación**
- **advertencia** (nota corta al final de la orden)

### Regla de progreso

No se abre un bloque nuevo hasta **cerrar** el anterior con:

- archivos tocados
- qué cambió
- qué no cambió
- validación corrida (p. ej. `tsc --noEmit` en `apps/api` cuando aplique)

### Nota estándar (pie de orden)

Pegar al final de cada orden a Cursor:

```txt
Advertencia:
No improvises ni expandas alcance.
No toques nada fuera del bloque pedido.
No agregues dependencias, refactors ni UI.
Termina solo esto y reporta validación.
```

### Variante más dura

```txt
Advertencia:
Ejecuta solo esta orden.
No diseñes, no adelantes fases, no "mejores" fuera del alcance.
No cambies estructura, contratos ni nombres sin instrucción.
Hazlo, valida y detente.
```

### Formato oficial de cada orden a Cursor

```txt
Trabaja bajo esta orden exacta.

Objetivo:
[qué se hace]

Alcance:
[archivo o archivos exactos]

Haz:
[lista corta y concreta]

Reglas:
- cambios mínimos
- nada fuera del alcance
- no tocar UI
- no agregar dependencias
- mantener tsc sano

Entrega:
- archivos tocados
- qué cambió
- validación corrida

Advertencia:
No improvises ni expandas alcance.
No toques nada fuera del bloque pedido.
No agregues dependencias, refactors ni UI.
Termina solo esto y reporta validación.
```

---

## Bloque 2 — Orden operativo Fase A (implementación)

Orden **oficial de pasos en código**. No se mueve.

| Paso | Módulo (`apps/api/src/agent/`) |
|------|--------------------------------|
| 1 | `types/index.ts` |
| 2 | `repo/index.ts` |
| 3 | `search/index.ts` |
| 4 | `context/index.ts` |
| 5 | `edit/index.ts` |
| 6 | `orchestrator/index.ts` |
| 7 | `session/index.ts` |

Lógica: contratos primero; capacidades sobre archivos y búsqueda; contexto; edición; el orquestador cablea; la sesión cierra el estado de trabajo.

### Fase A — Dependencias conceptuales (sin confundir con el orden de carpetas)

A nivel de **capacidad**, el núcleo sigue siendo: **repo/file service → context engine → code search → edit engine**, y el **orquestador** decide y conecta. El orden de la tabla de arriba es solo el **orden en que se implementan** esas piezas en el repo (tipos antes que todo; orquestador después de que existan repo/search/context/edit).

---

## Bloque 3 — Etapas de producto (Fase A, vista por entregables)

1. **Contratos** — tipos base del runtime (`types/`).
2. **Capacidades mínimas** — árbol, leer archivo, buscar archivo, buscar texto (`repo/`, `search/`).
3. **Contexto mínimo** — elegir archivos relevantes, límite de cantidad, bundle limpio (`context/`).
4. **Edición mínima** — preview, diff, apply controlado después (`edit/`).
5. **Orquestación mínima** — recibir tarea, invocar repo/search/context, resultado estructurado (`orchestrator/`; `session/` según Paso 7).

---

## Dónde vive cada cosa

| Área | Responsabilidad |
|------|-----------------|
| **apps/web** | Chat UI, historial visual, diff viewer, confirmaciones de tools, estado visual de ejecución |
| **apps/api** | Orquestador, runtime del agente, selección de contexto, tool calling, estado de sesión, reglas, git awareness, change review |
| **worker / sandbox** (después) | Terminal, build, test, lint, format, I/O segura sobre workspace |

Código del runtime del agente: `apps/api/src/agent/`.

---

## Sprint 1 (cerrar primero)

- Orquestación
- Leer repo
- Buscar archivos
- Editar archivos
- Mostrar diff

---

## Fuera de alcance hasta cerrar Sprint 1

- Terminal runner (`execa`, sandbox)
- Indexado semántico / embeddings
- Memoria persistente entre sesiones (más allá de lo que ya tenga la API de chat)
- Integraciones externas (tickets, MCP, etc.)

---

## Stack inicial acordado

- `fast-glob`, `ignore`, `micromatch`, `diff`, `zod`
- `execa` — **después** (con worker/sandbox)
- `ripgrep` — Sprint 1 si está disponible en el entorno; si no, búsqueda en Node

---

## UI

No prioritaria en esta fase: primero poder en API y contratos; la web consume resultados (diff, estado) cuando toque.

---

## Rama Git sugerida

`feat/agent-runtime-foundation` — solo base del agente, sin cosmética.
