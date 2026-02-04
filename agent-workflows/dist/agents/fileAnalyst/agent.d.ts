/**
 * FileAnalystAgent
 *
 * A read-only agent for file analysis.
 *
 * ALLOWED TOOLS: file-read
 * PURPOSE: Read and analyze file contents
 * SAFETY: Safe - no side effects
 */
import { ConstrainedAgent, type AgentRunResult } from '../base.js';
import { MCPClient } from '../../mcp/client.js';
/**
 * Create a FileAnalystAgent instance.
 */
export declare function createFileAnalystAgent(mcpClient: MCPClient): Promise<ConstrainedAgent>;
/**
 * Run the FileAnalystAgent with an analysis request.
 */
export declare function runFileAnalyst(mcpClient: MCPClient, request: string): Promise<AgentRunResult>;
//# sourceMappingURL=agent.d.ts.map