import { z } from 'zod';
import type { ToolDefinition } from '../../types/mcp.js';

/**
 * System Info Tool Definition
 * 
 * Intent: Allow AI agents to retrieve basic system information
 * for diagnostic and context-gathering purposes.
 * 
 * Safety: SAFE - Read-only, no side effects
 */

export const systemInfoInputSchema = z.object({
    /** Which system info categories to retrieve */
    include: z.array(z.enum(['platform', 'memory', 'uptime', 'nodeVersion']))
        .default(['platform', 'nodeVersion']),
});

export type SystemInfoInput = z.infer<typeof systemInfoInputSchema>;

export const systemInfoDefinition: ToolDefinition<typeof systemInfoInputSchema> = {
    name: 'system-info',
    description: 'Retrieve basic system information such as platform, memory usage, uptime, and Node.js version.',
    intent: 'Provides read-only system diagnostics for context awareness. Useful for agents that need to understand the runtime environment.',
    inputSchema: systemInfoInputSchema,
    safety: 'safe',
};
