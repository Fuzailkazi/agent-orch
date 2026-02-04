/**
 * MCP Client
 *
 * Shared HTTP client for all MCP tool calls.
 *
 * TRUST BOUNDARY: This client is the ONLY way agents can interact with
 * the MCP server. It enforces structured requests and handles responses
 * without implementing any tool-specific logic.
 *
 * All tool execution happens on the MCP server side.
 */
import type { MCPToolCallResponse, MCPToolDefinition } from './types.js';
export interface MCPClientConfig {
    /** Base URL of the MCP server */
    baseUrl: string;
    /** Request timeout in milliseconds */
    timeoutMs?: number;
}
export declare class MCPClient {
    private readonly baseUrl;
    private readonly timeoutMs;
    constructor(config: MCPClientConfig);
    /**
     * Check if the MCP server is healthy.
     */
    healthCheck(): Promise<boolean>;
    /**
     * List all available tools from the MCP server.
     */
    listTools(): Promise<MCPToolDefinition[]>;
    /**
     * Call an MCP tool with the given inputs.
     *
     * @param toolName - Name of the tool to invoke
     * @param inputs - Tool-specific inputs
     * @param intent - Description of why this tool is being called (for audit)
     */
    callTool(toolName: string, inputs: Record<string, unknown>, intent?: string): Promise<MCPToolCallResponse>;
}
/**
 * Default MCP client instance.
 * Uses MCP_SERVER_URL environment variable or defaults to localhost:3000.
 */
export declare function createMCPClient(): MCPClient;
//# sourceMappingURL=client.d.ts.map