/**
 * MCP Types for Agent Workflows
 *
 * These types mirror the MCP server's response structures.
 * We define them separately to maintain the trust boundary -
 * agent-workflows does NOT import from mcp-server.
 */
/**
 * Request structure for calling an MCP tool.
 */
export interface MCPToolCallRequest {
    /** Name of the tool to invoke */
    tool: string;
    /** Tool-specific inputs */
    inputs: Record<string, unknown>;
    /** Intent description for audit logging */
    intent?: string;
}
/**
 * Response structure from an MCP tool call.
 */
export interface MCPToolCallResponse {
    /** Name of the tool that was called */
    tool: string;
    /** Whether the tool execution succeeded */
    success: boolean;
    /** Result data (if successful) */
    result?: unknown;
    /** Error message (if failed) */
    error?: string;
    /** Whether this was a dry-run (no side effects) */
    dryRun: boolean;
    /** ISO timestamp of execution */
    timestamp: string;
    /** Unique request ID for tracing */
    requestId: string;
    /** For dry-run, describes what WOULD happen */
    simulatedAction?: string;
}
/**
 * Tool definition as returned by MCP server's /mcp/tools endpoint.
 */
export interface MCPToolDefinition {
    name: string;
    description: string;
    intent: string;
    safety: 'safe' | 'dangerous';
    inputSchema: unknown;
}
/**
 * Result structure for agent operations.
 */
export interface AgentResult {
    success: boolean;
    data?: unknown;
    error?: string;
    toolCalls: MCPToolCallResponse[];
}
//# sourceMappingURL=types.d.ts.map