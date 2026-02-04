import os from 'os';
import type { ToolExecutor, ToolExecutionResult } from '../../types/mcp.js';
import type { SystemInfoInput } from '../definitions/system-info.js';

/**
 * System Info Tool Executor
 * 
 * Pure, deterministic execution logic - completely separate from definition.
 * Returns system information based on requested categories.
 */

interface SystemInfoOutput {
    platform?: string;
    arch?: string;
    memory?: {
        total: number;
        free: number;
        used: number;
        usedPercent: number;
    };
    uptime?: number;
    nodeVersion?: string;
}

export const systemInfoExecutor: ToolExecutor<SystemInfoInput, SystemInfoOutput> = async (
    input,
    context
): Promise<ToolExecutionResult<SystemInfoOutput>> => {
    const data: SystemInfoOutput = {};

    for (const category of input.include) {
        switch (category) {
            case 'platform':
                data.platform = os.platform();
                data.arch = os.arch();
                break;

            case 'memory': {
                const total = os.totalmem();
                const free = os.freemem();
                const used = total - free;
                data.memory = {
                    total,
                    free,
                    used,
                    usedPercent: Math.round((used / total) * 100),
                };
                break;
            }

            case 'uptime':
                data.uptime = os.uptime();
                break;

            case 'nodeVersion':
                data.nodeVersion = process.version;
                break;
        }
    }

    return {
        success: true,
        data,
    };
};
