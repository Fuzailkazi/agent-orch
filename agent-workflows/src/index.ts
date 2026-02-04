/**
 * Agent Workflows - Entry Point
 *
 * This is the main entry point demonstrating orchestrator usage.
 *
 * PREREQUISITES:
 * 1. MCP server must be running: cd ../mcp-server && npm run dev
 * 2. OPENAI_API_KEY environment variable must be set
 *
 * USAGE:
 *   npm run dev
 *
 * TRUST BOUNDARIES:
 * - This process runs untrusted agent code
 * - All tool calls go through MCP server (trust boundary)
 * - Dangerous tools (file-write) are forced to dry-run by MCP server
 */

import { createOrchestrator, type OrchestratorResult } from './orchestration/orchestrator.js';

async function main() {
    console.log('🚀 Agent Workflows - LangChain Orchestration System\n');

    // Verify OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY environment variable is not set.');
        console.error('   Please set it before running: export OPENAI_API_KEY=your-key');
        process.exit(1);
    }

    // Create the orchestrator
    const orchestrator = createOrchestrator();

    // Example tasks to demonstrate the system
    const tasks = [
        {
            name: 'System Diagnostic',
            task: 'Check the system memory usage and platform information.',
        },
        {
            name: 'File Analysis',
            task: 'Read and analyze the contents of config.json file.',
        },
        {
            name: 'Change Proposal',
            task: 'Propose creating a new file called hello.txt with greeting content.',
        },
    ];

    console.log('📋 Running demonstration tasks...\n');
    console.log('='.repeat(60) + '\n');

    for (const { name, task } of tasks) {
        console.log(`\n📌 Task: ${name}`);
        console.log(`   "${task}"\n`);

        try {
            const result = await orchestrator.run({ task });
            printResult(result);
        } catch (error) {
            console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        console.log('\n' + '='.repeat(60));
    }

    console.log('\n✅ Demonstration complete!\n');
}

function printResult(result: OrchestratorResult) {
    if (!result.success) {
        console.log(`   ❌ Failed: ${result.error}`);
        return;
    }

    console.log(`   ✅ Success (${result.totalDurationMs}ms)`);
    console.log(`   📊 Task Type: ${result.taskType}`);
    console.log(`   🤖 Agents Used: ${result.agentResults.map(r => r.agentName).join(', ')}`);

    // Show tool calls
    for (const agentResult of result.agentResults) {
        if (agentResult.toolCalls.length > 0) {
            console.log(`\n   🔧 Tool Calls by ${agentResult.agentName}:`);
            for (const call of agentResult.toolCalls) {
                const status = call.response.success ? '✓' : '✗';
                const dryRun = call.response.dryRun ? ' [DRY-RUN]' : '';
                console.log(`      ${status} ${call.tool}${dryRun}`);
            }
        }
    }

    // Show output (truncated)
    console.log('\n   📝 Output:');
    const lines = result.finalOutput.split('\n').slice(0, 10);
    for (const line of lines) {
        console.log(`      ${line}`);
    }
    if (result.finalOutput.split('\n').length > 10) {
        console.log('      ...(truncated)');
    }
}

// Run the main function
main().catch(console.error);
