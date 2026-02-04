import { readFile } from 'fs/promises';
import { join, resolve, normalize } from 'path';
import type { ToolExecutor, ToolExecutionResult } from '../../types/mcp.js';
import type { FileReadInput } from '../definitions/file-read.js';

/**
 * File Read Tool Executor
 * 
 * Reads file contents from a sandboxed directory.
 * Security: Validates paths stay within sandbox.
 */

// Sandboxed directory - files can only be read from here
const SANDBOX_DIR = process.env.MCP_SANDBOX_DIR || '/tmp/mcp-sandbox';

interface FileReadOutput {
    path: string;
    content: string;
    size: number;
    encoding: string;
}

export const fileReadExecutor: ToolExecutor<FileReadInput, FileReadOutput> = async (
    input,
    context
): Promise<ToolExecutionResult<FileReadOutput>> => {
    try {
        // Resolve and validate path is within sandbox
        const normalizedPath = normalize(input.path);
        const fullPath = resolve(join(SANDBOX_DIR, normalizedPath));

        if (!fullPath.startsWith(resolve(SANDBOX_DIR))) {
            return {
                success: false,
                error: 'Path escapes sandbox directory',
            };
        }

        // Read file with size limit
        const buffer = await readFile(fullPath);

        if (buffer.length > input.maxBytes) {
            return {
                success: false,
                error: `File size (${buffer.length} bytes) exceeds limit (${input.maxBytes} bytes)`,
            };
        }

        const content = input.encoding === 'base64'
            ? buffer.toString('base64')
            : buffer.toString('utf-8');

        return {
            success: true,
            data: {
                path: normalizedPath,
                content,
                size: buffer.length,
                encoding: input.encoding,
            },
        };
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to read file: ${error}`,
        };
    }
};
