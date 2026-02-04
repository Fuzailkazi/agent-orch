import { z } from 'zod';

/**
 * MCP Core Types
 * 
 * These types define the Model Context Protocol structure for exposing
 * operational tools to AI agents in a safe, deterministic, and auditable manner.
 */

// Safety classification for tools
export type ToolSafety = 'safe' | 'dangerous';

// Tool definition - describes WHAT a tool does (no execution logic)
export interface ToolDefinition<T extends z.ZodType = z.ZodType> {
    /** Unique identifier for the tool */
    name: string;

    /** Human-readable description of what the tool does */
    description: string;

    /** Documented intent - WHY this tool exists */
    intent: string;

    /** Zod schema for strict input validation */
    inputSchema: T;

    /** Safety classification - dangerous tools run in dry-run only */
    safety: ToolSafety;
}

// Tool executor - the actual execution function (separate from definition)
export type ToolExecutor<TInput = unknown, TOutput = unknown> = (
    input: TInput,
    context: ExecutionContext
) => Promise<ToolExecutionResult<TOutput>>;

// Execution context passed to every tool
export interface ExecutionContext {
    /** Whether this is a dry-run (no side effects) */
    dryRun: boolean;

    /** Request timestamp for determinism */
    timestamp: Date;

    /** Unique request ID for tracing */
    requestId: string;
}

// Result of tool execution
export interface ToolExecutionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    /** For dry-run, describes what WOULD happen */
    simulatedAction?: string;
}

// Incoming tool call request
export const ToolCallRequestSchema = z.object({
    /** Name of the tool to invoke */
    tool: z.string(),

    /** Tool-specific inputs (validated against tool's inputSchema) */
    inputs: z.record(z.unknown()).default({}),

    /** Optional intent description for audit logging */
    intent: z.string().optional(),
});

export type ToolCallRequest = z.infer<typeof ToolCallRequestSchema>;

// Response from tool call
export interface ToolCallResponse {
    tool: string;
    success: boolean;
    result?: unknown;
    error?: string;
    dryRun: boolean;
    timestamp: string;
    requestId: string;
    /** For dry-run, describes what WOULD happen */
    simulatedAction?: string;
}

// Audit log entry structure
export interface AuditLogEntry {
    timestamp: string;
    requestId: string;
    toolName: string;
    intent: string;
    inputs: Record<string, unknown>;
    result: 'success' | 'error';
    dryRun: boolean;
    error?: string;
    durationMs: number;
}

// Tool registry entry (definition + executor paired)
export interface RegisteredTool<TInput = unknown, TOutput = unknown> {
    definition: ToolDefinition;
    executor: ToolExecutor<TInput, TOutput>;
}
