import type { RegisteredTool, ToolDefinition, ToolExecutor } from '../types/mcp.js';

// Import tool definitions
import { systemInfoDefinition } from './definitions/system-info.js';
import { fileReadDefinition } from './definitions/file-read.js';
import { fileWriteDefinition } from './definitions/file-write.js';

// Import tool executors
import { systemInfoExecutor } from './executors/system-info.js';
import { fileReadExecutor } from './executors/file-read.js';
import { fileWriteExecutor } from './executors/file-write.js';

/**
 * Tool Registry
 * 
 * Central registry that pairs tool definitions with their executors.
 * This maintains strict separation between WHAT a tool does (definition)
 * and HOW it does it (executor).
 */

class ToolRegistry {
    private tools = new Map<string, RegisteredTool>();

    /**
     * Register a tool with its definition and executor
     */
    register<TInput, TOutput>(
        definition: ToolDefinition,
        executor: ToolExecutor<TInput, TOutput>
    ): void {
        if (this.tools.has(definition.name)) {
            throw new Error(`Tool already registered: ${definition.name}`);
        }

        this.tools.set(definition.name, {
            definition,
            executor: executor as ToolExecutor,
        });
    }

    /**
     * Get a registered tool by name
     */
    get(name: string): RegisteredTool | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all registered tool definitions (no executors exposed)
     */
    listDefinitions(): ToolDefinition[] {
        return Array.from(this.tools.values()).map(t => t.definition);
    }

    /**
     * Check if a tool is registered
     */
    has(name: string): boolean {
        return this.tools.has(name);
    }
}

// Create and populate the registry
export const toolRegistry = new ToolRegistry();

// Register all tools
toolRegistry.register(systemInfoDefinition, systemInfoExecutor);
toolRegistry.register(fileReadDefinition, fileReadExecutor);
toolRegistry.register(fileWriteDefinition, fileWriteExecutor);

export { ToolRegistry };
