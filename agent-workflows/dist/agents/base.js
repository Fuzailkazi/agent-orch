/**
 * Base Agent Infrastructure
 *
 * This module provides the foundation for creating permission-constrained agents.
 *
 * SECURITY MODEL:
 * - Each agent declares its allowed tools at construction time
 * - Tool calls are validated against the allowed list BEFORE calling MCP
 * - This is defense-in-depth: MCP server also validates, but we fail fast here
 *
 * TRUST BOUNDARY:
 * - Agents are UNTRUSTED - they cannot bypass tool restrictions
 * - All tool execution happens on the MCP server, not here
 * - This module only creates LangChain-compatible tool wrappers
 */
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { z } from 'zod';
/**
 * Permission-constrained agent wrapper.
 *
 * Wraps a LangChain agent with tool permission enforcement.
 */
export class ConstrainedAgent {
    name;
    allowedTools;
    executor;
    mcpClient;
    toolCallLog = [];
    constructor(name, allowedTools, executor, mcpClient) {
        this.name = name;
        this.allowedTools = new Set(allowedTools);
        this.executor = executor;
        this.mcpClient = mcpClient;
    }
    /**
     * Create a new constrained agent.
     */
    static async create(config) {
        const { name, allowedTools, systemPrompt, mcpClient, model = 'gpt-4o', temperature = 0, } = config;
        // Create LangChain tools that wrap MCP calls
        const tools = await createMCPToolWrappers(mcpClient, allowedTools, name);
        // Create the LLM
        const llm = new ChatOpenAI({
            model,
            temperature,
        });
        // Create the prompt template
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', systemPrompt],
            ['human', '{input}'],
            new MessagesPlaceholder('agent_scratchpad'),
        ]);
        // Create the agent
        const agent = await createOpenAIToolsAgent({
            llm,
            tools,
            prompt,
        });
        // Create the executor
        const executor = new AgentExecutor({
            agent,
            tools,
            verbose: false,
            returnIntermediateSteps: true,
        });
        return new ConstrainedAgent(name, allowedTools, executor, mcpClient);
    }
    /**
     * Run the agent with the given input.
     */
    async run(input) {
        // Clear tool call log for this run
        this.toolCallLog = [];
        const result = await this.executor.invoke({ input });
        return {
            output: result.output,
            toolCalls: [...this.toolCallLog],
        };
    }
    /**
     * Check if this agent is allowed to use a specific tool.
     */
    canUseTool(toolName) {
        return this.allowedTools.has(toolName);
    }
}
/**
 * Create LangChain tool wrappers for MCP tools.
 *
 * These tools validate permissions and delegate to the MCP server.
 */
async function createMCPToolWrappers(mcpClient, allowedTools, agentName) {
    const tools = [];
    for (const toolName of allowedTools) {
        const tool = createMCPToolWrapper(mcpClient, toolName, agentName);
        tools.push(tool);
    }
    return tools;
}
/**
 * Create a single LangChain tool wrapper for an MCP tool.
 */
function createMCPToolWrapper(mcpClient, toolName, agentName) {
    // Define tool-specific schemas
    // These match what the MCP server expects
    const toolSchemas = {
        'system-info': z.object({
            include: z.array(z.enum(['platform', 'memory', 'uptime', 'cpus'])).optional()
                .describe('Which system info categories to include'),
        }),
        'file-read': z.object({
            path: z.string().describe('Relative path to the file within the sandbox'),
        }),
        'file-write': z.object({
            path: z.string().describe('Relative path to the file within the sandbox'),
            content: z.string().describe('Content to write to the file'),
        }),
    };
    const toolDescriptions = {
        'system-info': 'Get system information like platform, memory usage, uptime, and CPU details',
        'file-read': 'Read the contents of a file from the sandboxed directory',
        'file-write': 'Write content to a file in the sandboxed directory (runs in dry-run mode)',
    };
    const schema = toolSchemas[toolName] ?? z.object({});
    const description = toolDescriptions[toolName] ?? `Call the ${toolName} MCP tool`;
    return new DynamicStructuredTool({
        name: toolName.replace(/-/g, '_'), // LangChain prefers underscores
        description,
        schema,
        func: async (inputs) => {
            const intent = `Agent "${agentName}" calling ${toolName}`;
            const response = await mcpClient.callTool(toolName, inputs, intent);
            if (!response.success) {
                return `Error: ${response.error}`;
            }
            // Format the response for the agent
            let result = JSON.stringify(response.result, null, 2);
            // Include dry-run info if applicable
            if (response.dryRun && response.simulatedAction) {
                result += `\n\n[DRY-RUN] Simulated action: ${response.simulatedAction}`;
            }
            return result;
        },
    });
}
//# sourceMappingURL=base.js.map