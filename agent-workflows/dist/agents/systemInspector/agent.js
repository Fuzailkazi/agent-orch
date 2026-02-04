/**
 * SystemInspectorAgent
 *
 * A read-only agent for system diagnostics.
 *
 * ALLOWED TOOLS: system-info
 * PURPOSE: Gather and analyze system information
 * SAFETY: Safe - no side effects
 */
import { ConstrainedAgent } from '../base.js';
import { SYSTEM_INSPECTOR_PROMPT } from './prompt.js';
/**
 * Tool permissions for this agent.
 * This is the ONLY tool this agent can call.
 */
const ALLOWED_TOOLS = ['system-info'];
/**
 * Create a SystemInspectorAgent instance.
 */
export async function createSystemInspectorAgent(mcpClient) {
    const config = {
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
export async function runSystemInspector(mcpClient, request) {
    const agent = await createSystemInspectorAgent(mcpClient);
    return agent.run(request);
}
//# sourceMappingURL=agent.js.map