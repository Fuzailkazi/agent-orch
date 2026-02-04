/**
 * Agent Workflows - Entry Point
 *
 * This is the main entry point demonstrating orchestrator usage.
 *
 * PREREQUISITES:
 * 1. MCP server must be running: cd ../mcp-server && npm run dev
 * 2. OPENAI_API_KEY environment variable must be set
 *
 * USAGE:
 *   npm run dev
 *
 * TRUST BOUNDARIES:
 * - This process runs untrusted agent code
 * - All tool calls go through MCP server (trust boundary)
 * - Dangerous tools (file-write) are forced to dry-run by MCP server
 */
export {};
//# sourceMappingURL=index.d.ts.map