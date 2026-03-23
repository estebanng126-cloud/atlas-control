/**
 * Punto de entrada del runtime del agente (consumo desde API u otros módulos).
 */

export {
  runAgentTask,
  runOrchestrator,
  runOrchestratorEditPreview,
  runOrchestratorTool,
} from "./orchestrator/index.js";
export { runAgentTool } from "./tools/index.js";

export type {
  AgentTask,
  ContextBundle,
  OrchestratorEditPreviewPassResult,
  OrchestratorResult,
  OrchestratorToolPassResult,
} from "./types/index.js";
export type { AgentToolResult } from "./tools/index.js";
