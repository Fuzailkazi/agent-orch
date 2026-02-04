/**
 * ChangeProposerAgent
 *
 * An agent that PROPOSES file changes without executing them.
 *
 * ALLOWED TOOLS: file-write (always dry-run on MCP server)
 * PURPOSE: Propose file changes for human review
 * SAFETY: Dangerous tool, but MCP server forces dry-run mode
 *
 * TRUST BOUNDARY:
 * Even though this agent can call file-write, the MCP server
 * enforces dry-run mode for all dangerous tools. This agent
 * can NEVER actually write files - it can only propose.
 */
import { ConstrainedAgent, type AgentRunResult } from '../base.js';
import { MCPClient } from '../../mcp/client.js';
/**
 * Create a ChangeProposerAgent instance.
 */
export declare function createChangeProposerAgent(mcpClient: MCPClient): Promise<ConstrainedAgent>;
/**
 * Run the ChangeProposerAgent with a change request.
 */
export declare function runChangeProposer(mcpClient: MCPClient, request: string): Promise<AgentRunResult>;
//# sourceMappingURL=agent.d.ts.map