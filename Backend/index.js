import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { App } from './src/App.js';
import { WebSocketServer } from './src/WebSocketServer.js';

// Configuration
const PORT = 3001;
// Replicate __dirname functionality in ES modules for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialization
try {
    // 1. Initialize the Express Application, passing the directory path for static serving
    const app = new App(__dirname);
    
    // 2. Create the standard HTTP server from the Express app
    const httpServer = http.createServer(app.getExpressApp());

    // 3. Initialize the WebSocket Server and attach it to the HTTP server
    const webSocketServer = new WebSocketServer(httpServer);
    webSocketServer.init();

    // 4. Start the server
    httpServer.listen(PORT, () => {
        console.log(`✅ Backend server is fully operational on http://localhost:${PORT}`);
    });

} catch (error) {
    console.error("❌ Fatal error during server startup:", error);
    process.exit(1);
}