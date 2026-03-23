/**
 * Instrumentación / debug del runtime del agente en el feature chat (no es UI de producto).
 * En prod queda en false: sin fetch a agent-state, sin estado de enriquecimiento ni franja.
 * Solo DEV por defecto; cambiar aquí si más adelante se expone en prod.
 */
export const SHOW_AGENT_INSTRUMENTATION_STRIP = import.meta.env.DEV;
