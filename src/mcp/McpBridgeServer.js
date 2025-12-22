"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpBridgeServer = void 0;
const net = require("net");
const McpDispatcher_1 = require("./McpDispatcher");
const ui = require("../common/UI");
class McpBridgeServer {
    constructor(getEnabledTools, getCap, getActiveSessionCount, options) {
        this.getEnabledTools = getEnabledTools;
        this.getCap = getCap;
        this.getActiveSessionCount = getActiveSessionCount;
        this.running = false;
        this.active = 0;
        this.queued = [];
        this.port = options?.port ?? (parseInt(process.env.AWS_AI_ASSISTANT_MCP_PORT || '37114', 10) || 37114);
        this.host = options?.host || process.env.AWS_AI_ASSISTANT_MCP_HOST || '127.0.0.1';
    }
    start() {
        if (this.running)
            return;
        this.server = net.createServer((socket) => this.handleConnection(socket));
        this.server.listen(this.port, this.host, () => {
            ui.showInfoMessage(`MCP bridge listening on ${this.host}:${this.port}`);
        });
        this.running = true;
    }
    stop() {
        if (!this.running)
            return;
        try {
            this.server?.close();
            for (const s of this.queued) {
                try {
                    s.destroy();
                }
                catch { }
            }
            this.queued = [];
            this.active = 0;
        }
        finally {
            this.server = undefined;
            this.running = false;
        }
    }
    isRunning() {
        return this.running;
    }
    getAddress() {
        return { host: this.host, port: this.port };
    }
    getMetrics() {
        return { active: this.active, queued: this.queued.length, cap: Math.max(1, this.getCap()) };
    }
    notifyCapacityChange() {
        this.tryPromoteQueued();
    }
    dispose() {
        this.stop();
    }
    totalActive() {
        return this.getActiveSessionCount() + this.active;
    }
    handleConnection(socket) {
        const cap = Math.max(1, this.getCap());
        if (this.totalActive() >= cap) {
            // Queue the connection and inform client it's queued
            this.queued.push(socket);
            ui.logToOutput(`MCP bridge: capacity reached (${cap}). Queuing connection.`);
            socket.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/status', params: { status: 'queued', cap, message: 'Queued until capacity frees' } }) + '\n');
            socket.on('close', () => this.removeQueued(socket));
            socket.on('end', () => this.removeQueued(socket));
            return;
        }
        this.beginSession(socket);
    }
    removeQueued(socket) {
        this.queued = this.queued.filter(s => s !== socket);
    }
    tryPromoteQueued() {
        const cap = Math.max(1, this.getCap());
        while (this.queued.length > 0 && this.totalActive() < cap) {
            const s = this.queued.shift();
            if (s) {
                this.beginSession(s);
            }
        }
    }
    beginSession(socket) {
        this.active++;
        ui.logToOutput(`MCP bridge: session started. Total active: ${this.totalActive()}`);
        const dispatcher = new McpDispatcher_1.McpDispatcher(this.getEnabledTools());
        let buffer = '';
        const writeLine = (obj) => {
            socket.write(JSON.stringify(obj) + '\n');
        };
        socket.on('data', async (chunk) => {
            buffer += chunk.toString('utf-8');
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed)
                    continue;
                let req;
                try {
                    req = JSON.parse(trimmed);
                }
                catch (e) {
                    writeLine({ jsonrpc: '2.0', error: { message: 'Invalid JSON', data: e?.message } });
                    continue;
                }
                try {
                    const res = await dispatcher.handle(req);
                    if (res) {
                        writeLine(res);
                    }
                }
                catch (e) {
                    writeLine({ jsonrpc: '2.0', id: req?.id || null, error: { message: e?.message || 'Internal error', code: -32603 } });
                }
            }
        });
        const close = () => {
            this.active = Math.max(0, this.active - 1);
            try {
                socket.destroy();
            }
            catch { }
            this.tryPromoteQueued();
        };
        socket.on('error', close);
        socket.on('close', close);
        socket.on('end', close);
        // No initial banner - real MCP clients start with initialize request
    }
}
exports.McpBridgeServer = McpBridgeServer;
//# sourceMappingURL=McpBridgeServer.js.map