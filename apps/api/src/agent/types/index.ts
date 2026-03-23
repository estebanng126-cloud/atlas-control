/**
 * Contratos base del runtime del agente (solo tipos; sin implementación).
 * Orden de trabajo: docs/agent-runtime-plan.md
 */

/** Tarea que el orquestador debe atender (texto del usuario u objetivo interno). */
export interface AgentTask {
  id: string;
  /** Objetivo o mensaje en lenguaje natural. */
  prompt: string;
}

/** Estado de trabajo acumulado en la sesión del agente. */
export interface AgentSessionState {
  /** Identificador de sesión (coincide con dominio de chat cuando aplique). */
  sessionId: string;
  /** Tarea en curso, si existe. */
  currentTask: AgentTask | null;
  /** Rutas relativas al workspace ya leídas o modificadas en esta sesión. */
  touchedPaths: readonly string[];
  /** Plan o notas de decisión actuales (texto libre). */
  activePlan: string | null;
  /** Errores recientes (mensaje + contexto opcional). */
  recentErrors: readonly { message: string; source?: string }[];
}

/** Entrada en el árbol o metadato de archivo bajo la raíz del workspace. */
export interface RepoFile {
  /** Ruta relativa al workspace, con separadores POSIX (`/`). */
  path: string;
  kind: "file" | "directory";
}

/** Coincidencia de búsqueda sobre el repo (texto o path). */
export interface RepoSearchHit {
  path: string;
  /** Línea 1-based cuando la búsqueda es por contenido; omitir si no aplica. */
  line?: number;
  /** Fragmento de línea o preview corto. */
  preview: string;
}

/** Paquete de contexto listo para enviar al modelo (archivos recortados y metadatos). */
export interface ContextBundle {
  /** Archivos incluidos con contenido completo o truncado según política futura. */
  files: readonly { path: string; content: string }[];
  /** Nota breve de por qué se eligieron (opcional). */
  rationale?: string;
}

/** Vista previa de un cambio antes de aplicar al disco. */
export interface EditPreview {
  path: string;
  /** Diff unificado propuesto para este archivo. */
  unifiedDiff: string;
}

/** Resultado estructurado de una pasada del orquestador. */
export interface OrchestratorResult {
  /** Resultado agregado para la UI o siguiente paso. */
  summary: string;
  context?: ContextBundle;
  editPreviews?: readonly EditPreview[];
}

/**
 * Salida de una pasada explícita de tool (sin elección automática por prompt).
 * `toolResult` alinea con `AgentToolResult` del runner.
 */
export interface OrchestratorToolPassResult {
  summary: string;
  toolResult:
    | { toolName: string; ok: true; data: unknown }
    | { toolName: string; ok: false; error: string };
}

/** Salida de una pasada explícita de preview de edición (sin escribir disco). */
export interface OrchestratorEditPreviewPassResult {
  summary: string;
  editPreview: EditPreview;
}
