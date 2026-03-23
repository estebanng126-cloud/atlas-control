# Contrato oficial — `POST /chat/sessions/:sessionId/messages`

Referencia corta **end-to-end** (API + web). Para prueba manual paso a paso, ver [`chat-agent-e2e-manual.md`](./chat-agent-e2e-manual.md).

## Propósito

Persistir el mensaje del usuario y la respuesta de IA en la sesión de chat, y **enriquecer** la respuesta HTTP 200 con el resultado del runtime del agente cuando este completa, o con un error de agente **sin** tumbar el chat ya guardado.

## Request

- **Método / ruta:** `POST /chat/sessions/:sessionId/messages`
- **Body JSON:** `{ "content": string }` — tipo compartido `CreateChatMessageInput` en `@atlas/types` (`packages/types/src/chat.ts`).

## Respuesta HTTP 200 — agente OK

Tras **chat + IA persistidos con éxito** y agente sin lanzar:

- `ok: true`
- Campos de **sesión plana** en la raíz del JSON (mismo shape que `ChatSessionDetail`: `id`, `title`, `messages`, `lastMessageAt`, etc.)
- `result`: objeto alineado con `OrchestratorResult` (p. ej. `summary`, `context` opcional con `files`, etc.)
- **No** debe aparecer `agentError`

## Respuesta HTTP 200 — agente degradado

Tras **chat + IA persistidos con éxito** y el agente **falla después** (excepción capturada en la ruta):

- `ok: true`
- Misma **sesión plana** en la raíz
- `agentError`: string con el mensaje de fallo del runtime del agente
- **No** debe aparecer `result`

## Errores previos al flujo principal

Ocurren **antes** de intentar el agente: no hay cuerpo 200 con sesión plana de éxito en estos casos.

| Situación | HTTP típico | Cuerpo |
|-----------|-------------|--------|
| Contenido vacío | 400 | `ok: false`, `error`, `message` |
| Sesión inexistente | 404 | `ok: false`, `error`, `message` |
| Fallo capa IA (`ai_error`) | según servicio | `ok: false`, `error`, `message` |

Tipo API: `PostChatMessagesErrorBody`.

## Invariantes oficiales

1. **Sesión plana en 200:** si el status es 200 y el flujo llegó a “chat+IA OK”, el cliente recibe siempre los campos de `ChatSessionDetail` en el objeto raíz junto con `ok: true`.
2. **El agente no revierte un chat persistido:** un fallo del agente después de persistir no cambia el hecho de que el mensaje y la IA quedaron guardados; la respuesta sigue siendo 200 con `ok: true` y `agentError` si aplica.
3. **Exclusión mutua en 200:** en un payload 200 válido, **`result` y `agentError` no conviven**; es uno u otro (o el éxito del agente sin error explícito en `agentError`).

## Fuente de implementación

| Rol | Ubicación |
|-----|-----------|
| Tipos de contrato (API) | `apps/api/src/routes/postChatMessages.contract.ts` — `PostChatMessagesSuccessWithAgentResult`, `PostChatMessagesSuccessWithAgentError`, `PostChatMessagesErrorBody`, uniones |
| Handler y `satisfies` | `apps/api/src/routes/chat.ts` — `POST …/sessions/:sessionId/messages` |
| Prefijo `/chat` | `apps/api/src/server.ts` — registro de `chatRoutes` |
| Resultado del orquestador (shape de `result`) | `apps/api/src/agent/types/index.ts` — `OrchestratorResult` |
| Tipos espejo + cliente | `apps/web/src/features/chat/api/chat.ts` — `SendChatMessageApiResponse`, `SendChatMessageSuccessWithAgentResult`, `SendChatMessageSuccessWithAgentError`, `AgentOrchestratorResultDto`, `sendMessage`, `chatSessionDetailFromSendMessageResponse` |
| Consumo UI (enriquecimiento) | `apps/web/src/features/chat/components/ChatPanel.tsx` — ramas `"result" in raw` vs `agentError` |

## Notas de consumo (web)

- **`sendMessage`** usa un `request` que **lanza** si `!response.ok`: los errores previos al flujo principal **no** se modelan como valor de retorno; se manejan con `try/catch` (o mensaje de error derivado del `throw`).
- Los **200** se tipan como `SendChatMessageApiResponse`: discriminar con **`"result" in response`** (agente OK) frente a la rama con solo **`agentError`** (degradado). No asumir ambos opcionales a la vez como caso válido.

---

*Gate 1 (contrato estable): B.24 / B.25. Próximo gate operativo: smoke/E2E automatizado (B.27).*
