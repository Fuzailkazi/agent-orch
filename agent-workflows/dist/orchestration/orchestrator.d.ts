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
import { MCPClient } from '../mcp/client.js';
import type { ToolCallRecord } from '../agents/base.js';
/**
 * Task types that the orchestrator can handle.
 */
export type TaskType = 'system-diagnostic' | 'file-analysis' | 'change-proposal' | 'composite';
/**
 * Input for the orchestrator.
 */
export interface OrchestratorInput {
    /** High-level task description */
    task: string;
    /** Optional explicit task type (auto-detected if not provided) */
    taskType?: TaskType;
    /** Additional context to pass to agents */
    context?: string;
}
/**
 * Result from a single agent execution.
 */
export interface AgentExecutionResult {
    agentName: string;
    output: string;
    toolCalls: ToolCallRecord[];
    durationMs: number;
}
/**
 * Final structured output from the orchestrator.
 */
export interface OrchestratorResult {
    /** Whether the overall task succeeded */
    success: boolean;
    /** Classification of the task */
    taskType: TaskType;
    /** Results from each agent that was invoked */
    agentResults: AgentExecutionResult[];
    /** Final synthesized output */
    finalOutput: string;
    /** Total duration in milliseconds */
    totalDurationMs: number;
    /** Any error that occurred */
    error?: string;
}
/**
 * Orchestrator for coordinating agent workflows.
 */
export declare class Orchestrator {
    private readonly mcpClient;
    constructor(mcpClient?: MCPClient);
    /**
     * Run a task through the orchestration pipeline.
     */
    run(input: OrchestratorInput): Promise<OrchestratorResult>;
    /**
     * Classify a task to determine which agent(s) to invoke.
     */
    private classifyTask;
    /**
     * Run the SystemInspectorAgent.
     */
    private runSystemDiagnostic;
    /**
     * Run the FileAnalystAgent.
     */
    private runFileAnalysis;
    /**
     * Run the ChangeProposerAgent.
     */
    private runChangeProposal;
    /**
     * Run a composite workflow involving multiple agents.
     */
    private runCompositeWorkflow;
    /**
     * Synthesize final output from agent results.
     */
    private synthesizeOutput;
}
/**
 * Create an orchestrator instance with default configuration.
 */
export declare function createOrchestrator(): Orchestrator;
//# sourceMappingURL=orchestrator.d.ts.map