# Agent Workflows

LangChainJS-based agent orchestration system for MCP tools.

## Prerequisites

1. **MCP Server running** at `http://localhost:3000`
2. **OpenAI API key** set as environment variable

## Quick Start

```bash
# Terminal 1: Start MCP server
cd ../mcp-server
npm run dev

# Terminal 2: Run agent workflows
export OPENAI_API_KEY=your-key
npm run dev
```

## Architecture

```
agent-workflows/
├── src/
│   ├── mcp/
│   │   ├── client.ts       # Shared MCP HTTP client
│   │   └── types.ts        # MCP response types
│   ├── agents/
│   │   ├── base.ts         # Base agent with permission enforcement
│   │   ├── systemInspector/  # system-info tool only
│   │   ├── fileAnalyst/      # file-read tool only
│   │   └── changeProposer/   # file-write (dry-run) only
│   ├── orchestration/
│   │   └── orchestrator.ts # Task routing & coordination
│   └── index.ts            # Entry point
```

## Agents

| Agent | Allowed Tools | Purpose |
|-------|--------------|---------|
| SystemInspector | `system-info` | Read-only diagnostics |
| FileAnalyst | `file-read` | File analysis |
| ChangeProposer | `file-write` | Propose changes (dry-run only) |

## Trust Boundaries

- **MCP Server** = Trust boundary (executes tools safely)
- **Agents** = Untrusted (permission-constrained)
- **Dangerous tools** = Always dry-run (enforced by MCP server)
