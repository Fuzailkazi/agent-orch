import { join, resolve, normalize } from 'path';
import type { ToolExecutor, ToolExecutionResult } from '../../types/mcp.js';
import type { FileWriteInput } from '../definitions/file-write.js';

/**
 * File Write Tool Executor
 * 
 * IMPORTANT: This executor is marked as DANGEROUS in its definition.
 * The MCP server will ALWAYS run this in dry-run mode.
 * 
 * In dry-run mode, it describes what WOULD happen without doing it.
 */

const SANDBOX_DIR = process.env.MCP_SANDBOX_DIR || '/tmp/mcp-sandbox';

interface FileWriteOutput {
    path: string;
    bytesWritten: number;
    mode: string;
}

export const fileWriteExecutor: ToolExecutor<FileWriteInput, FileWriteOutput> = async (
    input,
    context
): Promise<ToolExecutionResult<FileWriteOutput>> => {
    // Resolve and validate path is within sandbox
    const normalizedPath = normalize(input.path);
    const fullPath = resolve(join(SANDBOX_DIR, normalizedPath));

    if (!fullPath.startsWith(resolve(SANDBOX_DIR))) {
        return {
            success: false,
            error: 'Path escapes sandbox directory',
        };
    }

    // DANGEROUS tools ALWAYS run in dry-run mode
    // The context.dryRun flag will be forced to true by the server
    if (context.dryRun) {
        return {
            success: true,
            data: {
                path: normalizedPath,
                bytesWritten: Buffer.byteLength(input.content, 'utf-8'),
                mode: input.mode,
            },
            simulatedAction: `Would ${input.mode} ${Buffer.byteLength(input.content, 'utf-8')} bytes to ${fullPath}${input.createDirs ? ' (creating parent directories)' : ''}`,
        };
    }

    // This code path is never reached for dangerous tools
    // But included for completeness if safety is ever changed
    return {
        success: false,
        error: 'Write operations are disabled. This tool runs in dry-run mode only.',
    };
};
