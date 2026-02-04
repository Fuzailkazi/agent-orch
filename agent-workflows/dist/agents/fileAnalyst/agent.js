/**
 * FileAnalystAgent
 *
 * A read-only agent for file analysis.
 *
 * ALLOWED TOOLS: file-read
 * PURPOSE: Read and analyze file contents
 * SAFETY: Safe - no side effects
 */
import { ConstrainedAgent } from '../base.js';
import { FILE_ANALYST_PROMPT } from './prompt.js';
/**
 * Tool permissions for this agent.
 * This is the ONLY tool this agent can call.
 */
const ALLOWED_TOOLS = ['file-read'];
/**
 * Create a FileAnalystAgent instance.
 */
export async function createFileAnalystAgent(mcpClient) {
    const config = {
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
export async function runFileAnalyst(mcpClient, request) {
    const agent = await createFileAnalystAgent(mcpClient);
    return agent.run(request);
}
//# sourceMappingURL=agent.js.map