import pino from 'pino';
import type { AuditLogEntry } from '../types/mcp.js';

/**
 * Audit Logger
 * 
 * Structured logging for all MCP tool calls.
 * Every tool invocation is logged with:
 * - Timestamp
 * - Request ID
 * - Tool name and intent
 * - Inputs (sanitized)
 * - Result status
 * - Duration
 * - Dry-run flag
 */

// Create pino logger with pretty output in development
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});

/**
 * Log a tool call for audit purposes
 */
export function logToolCall(entry: AuditLogEntry): void {
    const logMethod = entry.result === 'error' ? 'error' : 'info';

    logger[logMethod]({
        type: 'TOOL_CALL',
        ...entry,
    }, `[MCP] Tool: ${entry.toolName} | Result: ${entry.result} | DryRun: ${entry.dryRun} | Duration: ${entry.durationMs}ms`);
}

/**
 * Log server events
 */
export function logServerEvent(event: string, details?: Record<string, unknown>): void {
    logger.info({ type: 'SERVER_EVENT', event, ...details }, `[MCP] ${event}`);
}

/**
 * Create an audit log entry
 */
export function createAuditEntry(
    requestId: string,
    toolName: string,
    intent: string,
    inputs: Record<string, unknown>,
    dryRun: boolean
): Omit<AuditLogEntry, 'result' | 'durationMs' | 'error'> {
    return {
        timestamp: new Date().toISOString(),
        requestId,
        toolName,
        intent,
        inputs,
        dryRun,
    };
}

export { logger };
