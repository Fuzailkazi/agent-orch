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
export class MCPClient {
    baseUrl;
    timeoutMs;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.timeoutMs = config.timeoutMs ?? 30000;
    }
    /**
     * Check if the MCP server is healthy.
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                signal: AbortSignal.timeout(this.timeoutMs),
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * List all available tools from the MCP server.
     */
    async listTools() {
        const response = await fetch(`${this.baseUrl}/mcp/tools`, {
            signal: AbortSignal.timeout(this.timeoutMs),
        });
        if (!response.ok) {
            throw new Error(`Failed to list tools: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.tools;
    }
    /**
     * Call an MCP tool with the given inputs.
     *
     * @param toolName - Name of the tool to invoke
     * @param inputs - Tool-specific inputs
     * @param intent - Description of why this tool is being called (for audit)
     */
    async callTool(toolName, inputs, intent) {
        const request = {
            tool: toolName,
            inputs,
            intent,
        };
        const response = await fetch(`${this.baseUrl}/mcp/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            signal: AbortSignal.timeout(this.timeoutMs),
        });
        const data = await response.json();
        // Even non-2xx responses return structured data from MCP server
        return data;
    }
}
/**
 * Default MCP client instance.
 * Uses MCP_SERVER_URL environment variable or defaults to localhost:3000.
 */
export function createMCPClient() {
    const baseUrl = process.env.MCP_SERVER_URL ?? 'http://localhost:3000';
    return new MCPClient({ baseUrl });
}
//# sourceMappingURL=client.js.map