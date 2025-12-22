"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpSession = void 0;
const vscode = require("vscode");
class McpSession {
    constructor(sessionId, dispatcher, onSessionClosed) {
        this.sessionId = sessionId;
        this.dispatcher = dispatcher;
        this.onSessionClosed = onSessionClosed;
        this.writeEmitter = new vscode.EventEmitter();
        this.closeEmitter = new vscode.EventEmitter();
        this.onDidWrite = this.writeEmitter.event;
        this.buffer = '';
        this.onDidClose = this.closeEmitter.event;
    }
    open() {
        this.writeLine(`MCP session ${this.sessionId} started. Send JSON per line.`);
        this.writeLine('Methods: list_tools, call_tool {tool, command, params}');
        this.writeLine('Type Ctrl+C to close this session.');
    }
    close() {
        this.writeLine(`MCP session ${this.sessionId} closed.`);
        this.closeEmitter.fire();
        this.onSessionClosed(this.sessionId);
    }
    handleInput(data) {
        if (data === '\u0003') {
            this.close();
            return;
        }
        this.buffer += data;
        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() || '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                continue;
            }
            let request;
            try {
                request = JSON.parse(trimmed);
            }
            catch (error) {
                this.writeLine(JSON.stringify({ error: { message: 'Invalid JSON', detail: error?.message } }));
                continue;
            }
            if (request) {
                this.dispatch(request);
            }
        }
    }
    async dispatch(request) {
        const response = await this.dispatcher.handle(request);
        if (response) {
            this.writeLine(JSON.stringify(response));
        }
    }
    writeLine(text) {
        this.writeEmitter.fire(text + '\r\n');
    }
}
exports.McpSession = McpSession;
//# sourceMappingURL=McpSession.js.map