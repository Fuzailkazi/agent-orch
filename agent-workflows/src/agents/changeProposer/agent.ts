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

import { ConstrainedAgent, type AgentConfig, type AgentRunResult } from '../base.js';
import { MCPClient } from '../../mcp/client.js';
import { CHANGE_PROPOSER_PROMPT } from './prompt.js';

/**
 * Tool permissions for this agent.
 * NOTE: file-write is marked as "dangerous" on the MCP server,
 * so it ALWAYS runs in dry-run mode.
 */
const ALLOWED_TOOLS = ['file-write'] as const;

/**
 * Create a ChangeProposerAgent instance.
 */
export async function createChangeProposerAgent(
    mcpClient: MCPClient
): Promise<ConstrainedAgent> {
    const config: AgentConfig = {
        name: 'ChangeProposer',
        allowedTools: [...ALLOWED_TOOLS],
        systemPrompt: CHANGE_PROPOSER_PROMPT,
        mcpClient,
        temperature: 0, // Deterministic responses
    };

    return ConstrainedAgent.create(config);
}

/**
 * Run the ChangeProposerAgent with a change request.
 */
export async function runChangeProposer(
    mcpClient: MCPClient,
    request: string
): Promise<AgentRunResult> {
    const agent = await createChangeProposerAgent(mcpClient);
    return agent.run(request);
}
