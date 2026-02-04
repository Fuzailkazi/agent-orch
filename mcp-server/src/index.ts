import { startServer } from './server.js';

/**
 * MCP Server Entry Point
 * 
 * Starts the Model Context Protocol server on the configured port.
 */

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

startServer(PORT, HOST).catch((err) => {
    console.error('Failed to start MCP server:', err);
    process.exit(1);
});
