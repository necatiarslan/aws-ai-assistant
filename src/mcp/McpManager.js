"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpManager = void 0;
const vscode = require("vscode");
const net = require("net");
const McpConfig_1 = require("./McpConfig");
const McpDispatcher_1 = require("./McpDispatcher");
const McpSession_1 = require("./McpSession");
const McpBridgeServer_1 = require("./McpBridgeServer");
const ui = require("../common/UI");
class McpManager {
    constructor(context) {
        this.context = context;
        this.nextSessionId = 1;
        this.activeSessions = new Map();
        this.queue = [];
        this.disposed = false;
        this.config = new McpConfig_1.McpConfig(context.globalState);
    }
    dispose() {
        this.disposed = true;
        this.stopAll();
    }
    async startSession() {
        if (this.disposed) {
            return undefined;
        }
        const state = this.effectiveState();
        if (!state.enabled) {
            await this.config.updateEnabled(true);
        }
        this.ensureBridge(state);
        const cap = Math.max(1, state.sessionCap || 20);
        if (this.activeSessions.size >= cap) {
            return new Promise((resolve, reject) => {
                this.queue.push({ resolve, reject });
                ui.showInfoMessage(`MCP sessions at capacity (${cap}). Request queued.`);
            });
        }
        const sessionId = this.nextSessionId++;
        const dispatcher = new McpDispatcher_1.McpDispatcher(new Set(this.enabledTools()));
        const session = new McpSession_1.McpSession(sessionId, dispatcher, (id) => this.onSessionClosed(id));
        const pty = session;
        const terminal = vscode.window.createTerminal({ name: `Awsflow MCP ${sessionId}`, pty });
        this.activeSessions.set(sessionId, { terminal, session });
        terminal.show(false);
        //ui.showInformationMessage(`MCP session ${sessionId} started.`);
        return session;
    }
    async startBridge() {
        if (this.disposed) {
            return;
        }
        const state = this.effectiveState();
        if (!state.enabled) {
            await this.config.updateEnabled(true);
        }
        this.ensureBridge(state);
    }
    stopAll() {
        for (const entry of this.activeSessions.values()) {
            entry.terminal.dispose();
        }
        this.activeSessions.clear();
        while (this.queue.length) {
            const item = this.queue.shift();
            item?.resolve(undefined);
        }
        this.bridge?.stop();
        this.bridge = undefined;
    }
    async setEnabled(enabled) {
        await this.config.updateEnabled(enabled);
    }
    async setSessionCap(cap) {
        await this.config.updateSessionCap(cap);
    }
    async setDisabledTools(disabledTools) {
        await this.config.updateDisabledTools(disabledTools);
    }
    async updateEndpoint(host, port) {
        await this.config.updateEndpoint(host, port);
        if (this.bridge) {
            this.bridge.stop();
            this.bridge = undefined;
            const state = this.effectiveState();
            this.ensureBridge(state);
        }
    }
    loadState() {
        return this.config.load();
    }
    getSettingsSnapshot() {
        return this.effectiveState();
    }
    getActiveSessionCount() {
        return this.activeSessions.size;
    }
    async checkStatus() {
        const state = this.effectiveState();
        const host = state.host || '127.0.0.1';
        const port = state.port || 37114;
        const running = !!this.bridge?.isRunning();
        const metrics = this.bridge?.getMetrics() || { active: 0, queued: 0, cap: Math.max(1, state.sessionCap || 20) };
        const activeSessions = this.getActiveSessionCount() + (metrics.active || 0);
        const reachable = await this.tryProbe(host, port);
        let message;
        if (!running) {
            message = 'Bridge is not started yet. Use Start Server to launch it.';
        }
        else if (running && !reachable) {
            message = 'Bridge is running but not reachable on the configured host/port.';
        }
        return {
            running,
            reachable,
            host,
            port,
            activeSessions,
            queuedConnections: metrics.queued,
            sessionCap: Math.max(1, state.sessionCap || 20),
            message
        };
    }
    enabledTools() {
        const state = this.effectiveState();
        const disabled = new Set(state.disabledTools || []);
        const allToolNames = [
            'TestAwsConnectionTool',
            'STSTool',
            'S3Tool',
            'SNSTool',
            'SQSTool',
            'EC2Tool',
            'FileOperationsTool',
            'SessionTool',
            'CloudWatchLogTool',
            'LambdaTool',
            'StepFuncTool',
            'GlueTool',
            'IAMTool',
            'DynamoDBTool',
            'APIGatewayTool',
            'RDSTool',
            'RDSDataTool',
            'CloudFormationTool',
            'EMRTool'
        ];
        return allToolNames.filter(name => !disabled.has(name));
    }
    effectiveState() {
        const stored = this.config.load();
        const config = vscode.workspace.getConfiguration('awsflow.mcp');
        const enabled = config.get('enabled', stored.enabled);
        const sessionCap = config.get('sessionCap', stored.sessionCap);
        const disabledTools = config.get('disabledTools', stored.disabledTools);
        const host = config.get('host', stored.host);
        const port = config.get('port', stored.port);
        return { enabled, sessionCap, disabledTools, host, port };
    }
    onSessionClosed(sessionId) {
        this.activeSessions.delete(sessionId);
        if (this.queue.length > 0) {
            const queued = this.queue.shift();
            if (queued) {
                this.startSession().then(queued.resolve).catch(queued.reject);
            }
        }
        this.bridge?.notifyCapacityChange();
    }
    ensureBridge(state) {
        const effective = state ?? this.effectiveState();
        const host = effective.host || '127.0.0.1';
        const port = effective.port || 37114;
        if (this.bridge) {
            const address = this.bridge.getAddress();
            if (address.host === host && address.port === port && this.bridge.isRunning()) {
                return;
            }
            this.bridge.stop();
            this.bridge = undefined;
        }
        this.bridge = new McpBridgeServer_1.McpBridgeServer(() => new Set(this.enabledTools()), () => Math.max(1, this.effectiveState().sessionCap || 20), () => this.getActiveSessionCount(), { host, port });
        this.bridge.start();
    }
    tryProbe(host, port) {
        return new Promise((resolve) => {
            const socket = net.createConnection({ host, port }, () => {
                socket.destroy();
                resolve(true);
            });
            socket.setTimeout(1200);
            const handleFail = () => {
                try {
                    socket.destroy();
                }
                catch { }
                resolve(false);
            };
            socket.on('error', handleFail);
            socket.on('timeout', handleFail);
        });
    }
}
exports.McpManager = McpManager;
//# sourceMappingURL=McpManager.js.map