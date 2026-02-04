import { z } from 'zod';
import type { ToolDefinition } from '../../types/mcp.js';

/**
 * File Read Tool Definition
 * 
 * Intent: Allow AI agents to read file contents from a sandboxed directory.
 * 
 * Safety: SAFE - Read-only with path restrictions
 */

export const fileReadInputSchema = z.object({
    /** Relative path within the allowed directory */
    path: z.string()
        .min(1, 'Path cannot be empty')
        .refine(p => !p.includes('..'), 'Path traversal not allowed'),

    /** Maximum bytes to read (default 10KB, max 1MB) */
    maxBytes: z.number()
        .int()
        .min(1)
        .max(1_000_000)
        .default(10_000),

    /** Encoding for text files */
    encoding: z.enum(['utf-8', 'base64']).default('utf-8'),
});

export type FileReadInput = z.infer<typeof fileReadInputSchema>;

export const fileReadDefinition: ToolDefinition<typeof fileReadInputSchema> = {
    name: 'file-read',
    description: 'Read the contents of a file from a sandboxed directory.',
    intent: 'Enables agents to access configuration files, logs, or data files within a restricted area. Path traversal is blocked to prevent unauthorized access.',
    inputSchema: fileReadInputSchema,
    safety: 'safe',
};
