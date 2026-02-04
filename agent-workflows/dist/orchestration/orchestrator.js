/**
 * Orchestrator
 *
 * Explicit, deterministic task orchestration for agent workflows.
 *
 * DESIGN PRINCIPLES:
 * - NO autonomous agent spawning - orchestrator decides which agents to invoke
 * - Explicit routing based on task classification
 * - Structured output passing between agents
 * - Full audit trail of all agent/tool calls
 *
 * TRUST MODEL:
 * - The orchestrator is a coordinator, not an executor
 * - All tool calls go through agents -> MCP client -> MCP server
 * - The orchestrator cannot bypass agent permission constraints
 */
import { createMCPClient } from '../mcp/client.js';
import { createSystemInspectorAgent } from '../agents/systemInspector/agent.js';
import { createFileAnalystAgent } from '../agents/fileAnalyst/agent.js';
import { createChangeProposerAgent } from '../agents/changeProposer/agent.js';
/**
 * Orchestrator for coordinating agent workflows.
 */
export class Orchestrator {
    mcpClient;
    constructor(mcpClient) {
        this.mcpClient = mcpClient ?? createMCPClient();
    }
    /**
     * Run a task through the orchestration pipeline.
     */
    async run(input) {
        const startTime = Date.now();
        const agentResults = [];
        try {
            // Verify MCP server is available
            const healthy = await this.mcpClient.healthCheck();
            if (!healthy) {
                return {
                    success: false,
                    taskType: 'system-diagnostic',
                    agentResults: [],
                    finalOutput: '',
                    totalDurationMs: Date.now() - startTime,
                    error: 'MCP server is not available. Please ensure it is running.',
                };
            }
            // Classify the task
            const taskType = input.taskType ?? this.classifyTask(input.task);
            // Route to appropriate agent(s)
            switch (taskType) {
                case 'system-diagnostic':
                    agentResults.push(await this.runSystemDiagnostic(input.task));
                    break;
                case 'file-analysis':
                    agentResults.push(await this.runFileAnalysis(input.task));
                    break;
                case 'change-proposal':
                    agentResults.push(await this.runChangeProposal(input.task));
                    break;
                case 'composite':
                    // Run multiple agents in sequence
                    // Example: system check -> file analysis -> change proposal
                    agentResults.push(...await this.runCompositeWorkflow(input));
                    break;
            }
            // Synthesize final output
            const finalOutput = this.synthesizeOutput(taskType, agentResults);
            return {
                success: true,
                taskType,
                agentResults,
                finalOutput,
                totalDurationMs: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                taskType: input.taskType ?? 'system-diagnostic',
                agentResults,
                finalOutput: '',
                totalDurationMs: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Classify a task to determine which agent(s) to invoke.
     */
    classifyTask(task) {
        const lowerTask = task.toLowerCase();
        // Check for composite tasks (multiple keywords)
        const hasSystemKeywords = /\b(system|memory|cpu|platform|uptime|health)\b/.test(lowerTask);
        const hasFileKeywords = /\b(file|read|analyze|content)\b/.test(lowerTask);
        const hasChangeKeywords = /\b(write|create|propose|change|modify|update)\b/.test(lowerTask);
        const keywordCount = [hasSystemKeywords, hasFileKeywords, hasChangeKeywords]
            .filter(Boolean).length;
        if (keywordCount > 1) {
            return 'composite';
        }
        // Single-agent classification
        if (hasChangeKeywords)
            return 'change-proposal';
        if (hasFileKeywords)
            return 'file-analysis';
        if (hasSystemKeywords)
            return 'system-diagnostic';
        // Default to system diagnostic for unknown tasks
        return 'system-diagnostic';
    }
    /**
     * Run the SystemInspectorAgent.
     */
    async runSystemDiagnostic(task) {
        const startTime = Date.now();
        const agent = await createSystemInspectorAgent(this.mcpClient);
        const result = await agent.run(task);
        return {
            agentName: 'SystemInspector',
            output: result.output,
            toolCalls: result.toolCalls,
            durationMs: Date.now() - startTime,
        };
    }
    /**
     * Run the FileAnalystAgent.
     */
    async runFileAnalysis(task) {
        const startTime = Date.now();
        const agent = await createFileAnalystAgent(this.mcpClient);
        const result = await agent.run(task);
        return {
            agentName: 'FileAnalyst',
            output: result.output,
            toolCalls: result.toolCalls,
            durationMs: Date.now() - startTime,
        };
    }
    /**
     * Run the ChangeProposerAgent.
     */
    async runChangeProposal(task) {
        const startTime = Date.now();
        const agent = await createChangeProposerAgent(this.mcpClient);
        const result = await agent.run(task);
        return {
            agentName: 'ChangeProposer',
            output: result.output,
            toolCalls: result.toolCalls,
            durationMs: Date.now() - startTime,
        };
    }
    /**
     * Run a composite workflow involving multiple agents.
     */
    async runCompositeWorkflow(input) {
        const results = [];
        const lowerTask = input.task.toLowerCase();
        // Determine which agents to run based on keywords
        const needsSystemCheck = /\b(system|memory|cpu|platform|uptime|health)\b/.test(lowerTask);
        const needsFileAnalysis = /\b(file|read|analyze|content)\b/.test(lowerTask);
        const needsChangeProposal = /\b(write|create|propose|change|modify|update)\b/.test(lowerTask);
        // Run agents in logical order, passing context between them
        let accumulatedContext = input.context ?? '';
        if (needsSystemCheck) {
            const systemTask = `${input.task}\n\nContext: ${accumulatedContext}`;
            const result = await this.runSystemDiagnostic(systemTask);
            results.push(result);
            accumulatedContext += `\n\nSystem Info: ${result.output}`;
        }
        if (needsFileAnalysis) {
            const fileTask = `${input.task}\n\nContext: ${accumulatedContext}`;
            const result = await this.runFileAnalysis(fileTask);
            results.push(result);
            accumulatedContext += `\n\nFile Analysis: ${result.output}`;
        }
        if (needsChangeProposal) {
            const changeTask = `${input.task}\n\nContext: ${accumulatedContext}`;
            const result = await this.runChangeProposal(changeTask);
            results.push(result);
        }
        return results;
    }
    /**
     * Synthesize final output from agent results.
     */
    synthesizeOutput(taskType, results) {
        if (results.length === 0) {
            return 'No agents were invoked.';
        }
        if (results.length === 1) {
            return results[0].output;
        }
        // Composite output
        const sections = results.map((r, i) => {
            return `## ${i + 1}. ${r.agentName}\n\n${r.output}`;
        });
        return `# Orchestration Results (${taskType})\n\n${sections.join('\n\n---\n\n')}`;
    }
}
/**
 * Create an orchestrator instance with default configuration.
 */
export function createOrchestrator() {
    return new Orchestrator();
}
//# sourceMappingURL=orchestrator.js.map