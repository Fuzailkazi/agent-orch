/**
 * Base Agent Infrastructure
 *
 * This module provides the foundation for creating permission-constrained agents.
 *
 * SECURITY MODEL:
 * - Each agent declares its allowed tools at construction time
 * - Tool calls are validated against the allowed list BEFORE calling MCP
 * - This is defense-in-depth: MCP server also validates, but we fail fast here
 *
 * TRUST BOUNDARY:
 * - Agents are UNTRUSTED - they cannot bypass tool restrictions
 * - All tool execution happens on the MCP server, not here
 * - This module only creates LangChain-compatible tool wrappers
 */
import { MCPClient } from '../mcp/client.js';
import type { MCPToolCallResponse } from '../mcp/types.js';
/**
 * Configuration for creating an agent.
 */
export interface AgentConfig {
    /** Unique name for this agent */
    name: string;
    /** List of MCP tool names this agent is allowed to use */
    allowedTools: string[];
    /** System prompt defining agent behavior */
    systemPrompt: string;
    /** MCP client instance */
    mcpClient: MCPClient;
    /** OpenAI model to use (defaults to gpt-4o) */
    model?: string;
    /** Temperature for LLM responses (defaults to 0 for determinism) */
    temperature?: number;
}
/**
 * Tool call record for tracking agent activity.
 */
export interface ToolCallRecord {
    tool: string;
    inputs: Record<string, unknown>;
    response: MCPToolCallResponse;
}
/**
 * Result from running an agent.
 */
export interface AgentRunResult {
    /** The agent's final output */
    output: string;
    /** All tool calls made during execution */
    toolCalls: ToolCallRecord[];
}
/**
 * Permission-constrained agent wrapper.
 *
 * Wraps a LangChain agent with tool permission enforcement.
 */
export declare class ConstrainedAgent {
    readonly name: string;
    readonly allowedTools: ReadonlySet<string>;
    private readonly executor;
    private readonly mcpClient;
    private toolCallLog;
    private constructor();
    /**
     * Create a new constrained agent.
     */
    static create(config: AgentConfig): Promise<ConstrainedAgent>;
    /**
     * Run the agent with the given input.
     */
    run(input: string): Promise<AgentRunResult>;
    /**
     * Check if this agent is allowed to use a specific tool.
     */
    canUseTool(toolName: string): boolean;
}
//# sourceMappingURL=base.d.ts.map