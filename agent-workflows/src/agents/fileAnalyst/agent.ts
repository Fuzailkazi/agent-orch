/**
 * FileAnalystAgent
 *
 * A read-only agent for file analysis.
 *
 * ALLOWED TOOLS: file-read
 * PURPOSE: Read and analyze file contents
 * SAFETY: Safe - no side effects
 */

import { ConstrainedAgent, type AgentConfig, type AgentRunResult } from '../base.js';
import { MCPClient } from '../../mcp/client.js';
import { FILE_ANALYST_PROMPT } from './prompt.js';

/**
 * Tool permissions for this agent.
 * This is the ONLY tool this agent can call.
 */
const ALLOWED_TOOLS = ['file-read'] as const;

/**
 * Create a FileAnalystAgent instance.
 */
export async function createFileAnalystAgent(
    mcpClient: MCPClient
): Promise<ConstrainedAgent> {
    const config: AgentConfig = {
        name: 'FileAnalyst',
        allowedTools: [...ALLOWED_TOOLS],
        systemPrompt: FILE_ANALYST_PROMPT,
        mcpClient,
        temperature: 0, // Deterministic responses
    };

    return ConstrainedAgent.create(config);
}

/**
 * Run the FileAnalystAgent with an analysis request.
 */
export async function runFileAnalyst(
    mcpClient: MCPClient,
    request: string
): Promise<AgentRunResult> {
    const agent = await createFileAnalystAgent(mcpClient);
    return agent.run(request);
}
