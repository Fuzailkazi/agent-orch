/**
 * SystemInspectorAgent
 *
 * A read-only agent for system diagnostics.
 *
 * ALLOWED TOOLS: system-info
 * PURPOSE: Gather and analyze system information
 * SAFETY: Safe - no side effects
 */

import { ConstrainedAgent, type AgentConfig, type AgentRunResult } from '../base.js';
import { MCPClient } from '../../mcp/client.js';
import { SYSTEM_INSPECTOR_PROMPT } from './prompt.js';

/**
 * Tool permissions for this agent.
 * This is the ONLY tool this agent can call.
 */
const ALLOWED_TOOLS = ['system-info'] as const;

/**
 * Create a SystemInspectorAgent instance.
 */
export async function createSystemInspectorAgent(
    mcpClient: MCPClient
): Promise<ConstrainedAgent> {
    const config: AgentConfig = {
        name: 'SystemInspector',
        allowedTools: [...ALLOWED_TOOLS],
        systemPrompt: SYSTEM_INSPECTOR_PROMPT,
        mcpClient,
        temperature: 0, // Deterministic responses
    };

    return ConstrainedAgent.create(config);
}

/**
 * Run the SystemInspectorAgent with a diagnostic request.
 */
export async function runSystemInspector(
    mcpClient: MCPClient,
    request: string
): Promise<AgentRunResult> {
    const agent = await createSystemInspectorAgent(mcpClient);
    return agent.run(request);
}
