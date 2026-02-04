import Fastify from 'fastify';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { toolRegistry } from './tools/index.js';
import { logToolCall, logServerEvent, createAuditEntry, logger } from './middleware/audit-logger.js';
import { ToolCallRequestSchema, type ToolCallResponse, type ExecutionContext, type AuditLogEntry } from './types/mcp.js';

/**
 * MCP Server
 * 
 * A Fastify-based Model Context Protocol server that exposes
 * operational tools to AI agents in a safe, deterministic, and auditable manner.
 * 
 * Design principles:
 * - Stateless per request
 * - Deterministic tool behavior
 * - All calls are audited
 * - Dangerous tools run in dry-run mode only
 */

export function createMcpServer() {
    const fastify = Fastify({
        logger: false, // We use our own logger
        requestIdHeader: 'x-request-id',
        genReqId: () => randomUUID(),
    });

    // Health check endpoint
    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // List all available tools (definitions only, no executors)
    fastify.get('/mcp/tools', async () => {
        const tools = toolRegistry.listDefinitions().map(def => ({
            name: def.name,
            description: def.description,
            intent: def.intent,
            safety: def.safety,
            inputSchema: JSON.parse(JSON.stringify(def.inputSchema._def)),
        }));

        return {
            tools,
            count: tools.length,
        };
    });

    // Get specific tool definition
    fastify.get<{ Params: { name: string } }>('/mcp/tools/:name', async (request, reply) => {
        const { name } = request.params;
        const tool = toolRegistry.get(name);

        if (!tool) {
            reply.status(404);
            return { error: `Tool not found: ${name}` };
        }

        return {
            name: tool.definition.name,
            description: tool.definition.description,
            intent: tool.definition.intent,
            safety: tool.definition.safety,
            inputSchema: JSON.parse(JSON.stringify(tool.definition.inputSchema._def)),
        };
    });

    // Execute a tool call
    fastify.post('/mcp/call', async (request, reply) => {
        const requestId = (request.id as string) || randomUUID();
        const startTime = Date.now();

        // Parse and validate request
        let parsedRequest;
        try {
            parsedRequest = ToolCallRequestSchema.parse(request.body);
        } catch (err) {
            if (err instanceof ZodError) {
                reply.status(400);
                return {
                    error: 'Invalid request',
                    details: err.errors,
                };
            }
            throw err;
        }

        const { tool: toolName, inputs, intent } = parsedRequest;

        // Get the tool
        const tool = toolRegistry.get(toolName);
        if (!tool) {
            reply.status(404);
            return { error: `Tool not found: ${toolName}` };
        }

        // Validate inputs against tool's schema
        let validatedInputs;
        try {
            validatedInputs = tool.definition.inputSchema.parse(inputs);
        } catch (err) {
            if (err instanceof ZodError) {
                reply.status(400);
                return {
                    error: 'Invalid tool inputs',
                    tool: toolName,
                    details: err.errors,
                };
            }
            throw err;
        }

        // Create execution context
        // IMPORTANT: Dangerous tools ALWAYS run in dry-run mode
        const dryRun = tool.definition.safety === 'dangerous';

        const context: ExecutionContext = {
            dryRun,
            timestamp: new Date(),
            requestId,
        };

        // Prepare audit entry
        const auditBase = createAuditEntry(
            requestId,
            toolName,
            intent || tool.definition.intent,
            validatedInputs as Record<string, unknown>,
            dryRun
        );

        // Execute the tool
        try {
            const result = await tool.executor(validatedInputs, context);
            const durationMs = Date.now() - startTime;

            // Log successful call
            const auditEntry: AuditLogEntry = {
                ...auditBase,
                result: result.success ? 'success' : 'error',
                durationMs,
                error: result.error,
            };
            logToolCall(auditEntry);

            // Build response
            const response: ToolCallResponse = {
                tool: toolName,
                success: result.success,
                result: result.data,
                error: result.error,
                dryRun,
                timestamp: context.timestamp.toISOString(),
                requestId,
            };

            // Add simulated action for dry-run
            if (result.simulatedAction) {
                response.simulatedAction = result.simulatedAction;
            }

            if (!result.success) {
                reply.status(422);
            }

            return response;
        } catch (err) {
            const durationMs = Date.now() - startTime;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';

            // Log failed call
            const auditEntry: AuditLogEntry = {
                ...auditBase,
                result: 'error',
                durationMs,
                error: errorMessage,
            };
            logToolCall(auditEntry);

            reply.status(500);
            return {
                tool: toolName,
                success: false,
                error: errorMessage,
                dryRun,
                timestamp: context.timestamp.toISOString(),
                requestId,
            };
        }
    });

    return fastify;
}

/**
 * Start the MCP server
 */
export async function startServer(port = 3000, host = '0.0.0.0') {
    const server = createMcpServer();

    try {
        await server.listen({ port, host });
        logServerEvent('Server started', { port, host });
        logger.info(`🚀 MCP Server running at http://${host}:${port}`);
        logger.info('Available endpoints:');
        logger.info('  GET  /health       - Health check');
        logger.info('  GET  /mcp/tools    - List all tools');
        logger.info('  GET  /mcp/tools/:name - Get tool definition');
        logger.info('  POST /mcp/call     - Execute a tool');
        return server;
    } catch (err) {
        logger.error(err, 'Failed to start server');
        throw err;
    }
}
