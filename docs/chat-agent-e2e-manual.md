# Prueba manual E2E — chat + runtime del agente (B.4 / B.6 / B.9)

Objetivo: comprobar el flujo real sin framework de tests ni dependencias nuevas. La API debe estar levantada y la base de datos accesible (misma configuración que en desarrollo).

## Prerrequisitos

- Arrancar la API, por ejemplo desde la raíz del monorepo: `pnpm --filter @atlas/api dev` (o el comando que uses; puerto por defecto **3001**).
- `BASE`: URL base, p. ej. `http://127.0.0.1:3001`.

En PowerShell puedes definir:

```powershell
$BASE = "http://127.0.0.1:3001"
```

En bash:

```bash
BASE="http://127.0.0.1:3001"
```

## 1) Crear sesión

**Petición**

```bash
curl -s -X POST "$BASE/chat/sessions" -H "Content-Type: application/json" -d "{}"
```

**Esperado:** HTTP 201 y JSON con `id` de la sesión (y campos de sesión). Copia `id` como `SESSION_ID`.

## 2) Enviar mensaje (flujo principal)

Sustituye `SESSION_ID` por el valor obtenido.

```bash
curl -s -i -X POST "$BASE/chat/sessions/SESSION_ID/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"Hola, contexto del repo para chat\"}"
```

**Esperado (chat + IA + agente OK):** HTTP **200** y cuerpo JSON que incluye **a la vez**:

| Campo / zona | Qué comprobar |
|----------------|---------------|
| Sesión plana | `id`, `messages`, `lastMessageAt`, etc. (compatible con el cliente que espera `ChatSessionDetail` en la raíz) |
| `ok` | `true` (indica que el flujo principal del chat terminó bien, no solo el agente) |
| `result` | Objeto presente **solo** si el runtime del agente no falló |
| `result.summary` | String no vacío (resumen del orquestador) |
| `result.context` | Objeto (puede traer `files` vacíos según el prompt y el repo) |

**Nota:** `result.context.files` puede ser `[]` si el contexto no encontró archivos; igualmente `result.context` debe existir cuando hay `result`.

Si el agente falla **después** de que el mensaje y la respuesta de IA ya se guardaron, el contrato es el de la **§4** (200 + `agentError`, sin `result`).

## 3) Contenido vacío

```bash
curl -s -i -X POST "$BASE/chat/sessions/SESSION_ID/messages" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"\"}"
```

**Esperado:** HTTP 400, cuerpo con `ok: false` y mensaje de error (`error` / `message`).

## 4) Agente falla después de chat + IA correctos (contrato B.5)

Si `sendChatMessage` terminó bien (usuario + asistente en BD) y **`runAgentTask` lanza**, la respuesta **no** es 502: sigue siendo **HTTP 200** y el cuerpo conserva la **sesión plana**.

| Campo / zona | Qué comprobar |
|----------------|---------------|
| HTTP | `200` |
| Sesión plana | `id`, `messages`, etc. como en el éxito normal |
| `ok` | `true` |
| `agentError` | String con el mensaje de error del runtime del agente |
| `result` | **Ausente** (no enviar un `result` inválido) |

**Comprobación extra:** `GET $BASE/chat/sessions/SESSION_ID` debe listar los mensajes nuevos aunque el cuerpo del POST traiga `agentError`.

*(Forzar este caso en local puede requerir un fallo deliberado dentro del runtime del agente; si en tu entorno el agente siempre completa bien, solo anota “no reproducido” en la checklist.)*

## 5) Errores del flujo principal (sin cambios)

Siguen igual que antes:

- **400** — contenido vacío (`§3`): `ok: false`, `error` / `message`.
- **404** — sesión inexistente: `ok: false`, `error` / `message`.
- Código y cuerpo del **`ai_error`** cuando la capa de IA no puede responder (mismo comportamiento que antes del agente).

## 6) Estado interno del agente — `GET /chat/sessions/:sessionId/agent-state` (B.8 / B.9)

**Disponibilidad:** ruta interna de instrumentación/debug. Con la API en **desarrollo** (`NODE_ENV !== "production"`) la ruta **sí** se registra y responde como abajo. En **producción** **no** se registra: no forme parte de expectativas ni checklists de prod; un **404** allí significa **ruta inexistente**, no el cuerpo JSON “sin estado en memoria” de más abajo.

**Contexto** (solo cuando la ruta existe): el mismo `SESSION_ID` del chat. El estado vive **en memoria** en la API: solo existe después de un `POST …/messages` que haya entrado a `runAgentTask` (tras un chat + IA correctos). Úsalo después de **§1** y **§2**.

**Petición**

```bash
curl -s -i "$BASE/chat/sessions/SESSION_ID/agent-state"
```

**200 — hay estado** (`runAgentTask` ya se ejecutó al menos una vez para ese `sessionId`):

```json
{ "ok": true, "agentSession": { ... } }
```

Dentro de `agentSession`:

| Campo | Significado breve |
|--------|-------------------|
| `sessionId` | Misma clave que la sesión de chat |
| `currentTask` | Última tarea (`id`, `prompt`) o `null` |
| `touchedPaths` | Rutas relativas tocadas por el contexto del agente |
| `activePlan` | Último `summary` del orquestador guardado como plan activo |
| `recentErrors` | Errores recientes (p. ej. fallo del agente con `source: "orchestrator"`) |

**404 — sin estado en memoria** (solo con la ruta registrada: nunca se disparó el runtime del agente para ese id, o proceso reiniciado y se perdió la memoria):

```json
{ "ok": false, "error": "No agent session state for this sessionId" }
```

**Flujo recomendado:** §1 → §2 → esta §6 (solo fuera de prod); si en §4 hubo `agentError`, aquí deberías poder ver `recentErrors` poblado tras otro intento.

## 7) Tool del agente por HTTP — `POST /chat/sessions/:sessionId/agent-tools/:toolName` (B.37 / B.39)

**Propósito:** en DEV/debug, ejecutar **una** tool del runtime con nombre e `input` explícitos vía `runOrchestratorTool`, **sin** usar el `POST …/messages` y **sin** modificar el contrato del chat.

**Disponibilidad:** la ruta existe **solo** cuando `NODE_ENV !== "production"`. En **producción no se registra**. Ahí un **404** significa **ruta inexistente** (Fastify), no un fallo “de la tool” ni el mismo significado que el 404 de sesión descrito abajo.

**Request**

- En URL: `sessionId` (debe existir una fila `ChatSession` con ese id).
- En URL: `toolName` (p. ej. `read_repo_file`; vacío → HTTP 400).
- Body JSON opcional:
  - `taskPrompt?: string` — alimenta `AgentTask.prompt` para trazas; si falta o va vacío, la API usa un texto debug fijo.
  - `input?: unknown` — argumentos de la tool (p. ej. `{ "path": "package.json" }` para `read_repo_file`).

**Response HTTP 200** (sesión válida y `toolName` no vacío)

Cuerpo mínimo:

| Campo | Contenido |
|--------|-----------|
| `ok` | `true` |
| `sessionId` | Mismo que en la URL |
| `toolName` | Mismo que en la URL |
| `summary` | Resumen generado por el orquestador para esta pasada |
| `toolResult` | Resultado del runner: `toolName`, `ok`, y `data` **o** `error` |

Si la **tool falla** (p. ej. archivo inexistente), la respuesta HTTP sigue siendo **200**, el envelope lleva `ok: true`, y **`toolResult.ok === false`** con **`toolResult.error`** string no vacío. El campo **`summary`** debe reflejar el fallo.

**404 — sesión de chat inexistente**

Cuerpo aproximado: `ok: false`, `error` descriptivo (p. ej. `Chat session not found`).

**400 — `toolName` vacío**

Cuerpo: `ok: false`, mensaje de error de validación.

**Ejemplo `curl` (`read_repo_file`, `package.json`)**

Sustituye `SESSION_ID` (tras **§1**).

```bash
curl -s -i -X POST "$BASE/chat/sessions/SESSION_ID/agent-tools/read_repo_file" \
  -H "Content-Type: application/json" \
  -d "{\"taskPrompt\":\"prueba manual tool\",\"input\":{\"path\":\"package.json\"}}"
```

**Producción:** no esperes esta ruta; un 404 allí es ausencia de registro, no sustituto del flujo de tools en DEV.

## 8) Edit preview del agente por HTTP — `POST /chat/sessions/:sessionId/agent-edit-preview` (B.42 / B.43 / B.44)

**Propósito:** en DEV/debug, obtener un **diff preview** (unified diff) del cambio propuesto para un archivo del workspace del agente, vía el orquestador, **sin escribir al disco** y **sin** usar `POST …/messages`.

**Disponibilidad:** la ruta existe **solo** cuando `NODE_ENV !== "production"`; en **producción no se registra**. Si llamas a esa URL con la API en **producción**, el **404** es **ruta inexistente** (Fastify), no un fallo “del preview” ni el mismo caso que el **404** de sesión inexistente descrito abajo (ese solo aplica cuando la ruta sí está registrada).

**Request**

- URL: `sessionId` (debe existir una fila `ChatSession` con ese id).
- Body JSON:
  - `taskPrompt?: string` — opcional; alimenta `AgentTask.prompt` para trazas; si falta o va vacío, la API usa un texto debug fijo.
  - `path: string` — ruta relativa al workspace (p. ej. `package.json`); vacío o solo espacios → **400** con `ok: false`.
  - `nextContent: string` — contenido completo propuesto para ese archivo; debe ser **string**; si el tipo no es string → **400** con `ok: false`.

**Response HTTP 200** (preview generado)

| Campo | Contenido |
|--------|------------|
| `ok` | `true` |
| `sessionId` | Mismo que en la URL |
| `summary` | Resumen del orquestador para esta pasada |
| `editPreview` | Objeto con al menos `path` y `unifiedDiff` (diff unificado) |

**404 — sesión de chat inexistente** (solo cuando la ruta está registrada)

Cuerpo: `ok: false`, `error` descriptivo (p. ej. sesión no encontrada).

**400 — input inválido o preview fallido**

- `path` inválido → `ok: false`, `error` no vacío.
- `nextContent` inválido (no string) → `ok: false`, `error` no vacío.
- Preview fallido (p. ej. archivo inexistente en el repo) → `ok: false`, `error` claro.

**Ejemplo `curl` (`package.json`, una línea extra al final)**

Ejecuta el `node` desde la **raíz del monorepo** (misma raíz que el workspace del agente). Sustituye `SESSION_ID` (tras **§1**).

```bash
NEXT_CONTENT=$(node -e "const fs=require('fs'); console.log(JSON.stringify(fs.readFileSync('package.json','utf8')+'\\n// manual edit-preview\\n'))")
curl -s -i -X POST "$BASE/chat/sessions/SESSION_ID/agent-edit-preview" \
  -H "Content-Type: application/json" \
  -d '{"taskPrompt":"manual preview","path":"package.json","nextContent":'"$NEXT_CONTENT"'}'
```

**Esperado (DEV):** HTTP **200**, `ok: true`, `editPreview.path` coherente con `path`, `editPreview.unifiedDiff` no vacío (cabeceras típicas `--- a/package.json` / `+++ b/package.json`).

**Producción:** no esperes esta ruta; un **404** allí es ausencia de registro, no sustituto del flujo de preview en DEV.

## Resultado observado (rellenar en tu máquina)

Ejecuta los pasos anteriores y anota:

- [ ] Paso 1: creado `SESSION_ID` = _______________
- [ ] Paso 2: HTTP ______ — `ok` = ______ — `result` presente: sí / no — si sí: `result.summary` / `result.context` presentes: sí / no
- [ ] Paso 3: HTTP ______ — `ok: false`: sí / no
- [ ] Paso 4 (si aplica): HTTP ______ — `ok` = ______ — `agentError` presente: sí / no — `result` ausente: sí / no — GET sesión coherente: sí / no
- [ ] Paso 6 (solo DEV): `GET …/agent-state` HTTP ______ — `agentSession` visto: sí / no — `recentErrors` / `activePlan` coherentes: sí / no
- [ ] Paso 7 (solo DEV): `POST …/agent-tools/read_repo_file` HTTP ______ — envelope `ok` = ______ — `toolResult.ok` = ______ — `summary` coherente: sí / no
- [ ] Paso 8 (solo DEV): `POST …/agent-edit-preview` HTTP ______ — `ok` = ______ — `editPreview.unifiedDiff` visto: sí / no

---

**B.6:** contrato endurecido documentado: el agente es enriquecimiento; un fallo suyo no tumba el 200 del chat ya persistido. **B.9:** inspección de estado del agente documentada junto al E2E. **B.44:** ruta DEV de edit preview documentada (sin registro en producción; 404 en prod = ruta inexistente).
