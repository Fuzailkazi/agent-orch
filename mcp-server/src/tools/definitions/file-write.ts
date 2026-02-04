import { z } from 'zod';
import type { ToolDefinition } from '../../types/mcp.js';

/**
 * File Write Tool Definition
 * 
 * Intent: Allow AI agents to write file contents to a sandboxed directory.
 * 
 * Safety: DANGEROUS - This tool has side effects!
 * All calls to this tool will be executed in DRY-RUN mode only.
 */

export const fileWriteInputSchema = z.object({
    /** Relative path within the allowed directory */
    path: z.string()
        .min(1, 'Path cannot be empty')
        .refine(p => !p.includes('..'), 'Path traversal not allowed'),

    /** Content to write */
    content: z.string().max(100_000, 'Content too large (max 100KB)'),

    /** Write mode */
    mode: z.enum(['overwrite', 'append']).default('overwrite'),

    /** Create parent directories if they don't exist */
    createDirs: z.boolean().default(false),
});

export type FileWriteInput = z.infer<typeof fileWriteInputSchema>;

export const fileWriteDefinition: ToolDefinition<typeof fileWriteInputSchema> = {
    name: 'file-write',
    description: 'Write content to a file in a sandboxed directory. DANGEROUS: Runs in dry-run mode only.',
    intent: 'Allows agents to persist data, create configurations, or generate output files. Marked as dangerous due to filesystem mutation - all executions simulate the write without actually performing it.',
    inputSchema: fileWriteInputSchema,
    safety: 'dangerous',
};
