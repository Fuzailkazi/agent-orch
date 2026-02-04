/**
 * SystemInspectorAgent
 *
 * A read-only agent for system diagnostics.
 *
 * ALLOWED TOOLS: system-info
 * PURPOSE: Gather and analyze system information
 * SAFETY: Safe - no side effects
 */
import { ConstrainedAgent, type AgentRunResult } from '../base.js';
import { MCPClient } from '../../mcp/client.js';
/**
 * Create a SystemInspectorAgent instance.
 */
export declare function createSystemInspectorAgent(mcpClient: MCPClient): Promise<ConstrainedAgent>;
/**
 * Run the SystemInspectorAgent with a diagnostic request.
 */
export declare function runSystemInspector(mcpClient: MCPClient, request: string): Promise<AgentRunResult>;
//# sourceMappingURL=agent.d.ts.map