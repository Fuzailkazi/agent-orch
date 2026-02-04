# MCP Server for Operational Tools

A Model Context Protocol (MCP) server in Node.js + TypeScript that exposes internal operational tools to AI agents in a safe, deterministic, and auditable manner.

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Stateless** | Each request is independent; no session state |
| **Deterministic** | Same inputs produce same outputs |
| **Auditable** | All tool calls logged with timestamp and intent |
| **Safe** | Dangerous actions are dry-run only |
| **Explicit** | No implicit permissions; strict Zod schemas |

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/mcp/tools` | GET | List all available tools |
| `/mcp/tools/:name` | GET | Get specific tool definition |
| `/mcp/call` | POST | Execute a tool call |

## Available Tools

### `system-info` (Safe)
Retrieve basic system information.

```bash
curl -X POST http://localhost:3000/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "system-info", "inputs": {"include": ["platform", "memory"]}}'
```

### `file-read` (Safe)
Read file contents from sandboxed directory.

```bash
curl -X POST http://localhost:3000/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "file-read", "inputs": {"path": "config.json"}}'
```

### `file-write` (Dangerous - Dry-run only)
Write content to file. Always runs in dry-run mode.

```bash
curl -X POST http://localhost:3000/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "file-write", "inputs": {"path": "output.txt", "content": "Hello"}}'
```

## Architecture

```
src/
├── index.ts              # Entry point
├── server.ts             # Fastify MCP server
├── types/
│   └── mcp.ts            # Core type definitions
├── tools/
│   ├── index.ts          # Tool registry
│   ├── definitions/      # Tool schemas (WHAT)
│   └── executors/        # Tool logic (HOW)
└── middleware/
    └── audit-logger.ts   # Audit logging
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `MCP_SANDBOX_DIR` | `/tmp/mcp-sandbox` | Sandboxed directory for file operations |
| `LOG_LEVEL` | `info` | Pino log level |
| `NODE_ENV` | - | Set to `production` for JSON logs |

## Security

- **No agent orchestration** - This is a tool server only
- **Strict input validation** - All inputs validated with Zod schemas
- **Path sandboxing** - File operations restricted to sandbox directory
- **Dangerous tool protection** - Marked tools always run in dry-run mode
- **Audit logging** - Every tool call is logged with full context
