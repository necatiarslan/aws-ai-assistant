import * as vscode from 'vscode';
import { McpConfig } from './McpConfig';
import { McpDispatcher } from './McpDispatcher';
import { McpSession } from './McpSession';
import { McpBridgeServer } from './McpBridgeServer';

interface QueuedRequest {
    resolve: (value: McpSession | undefined) => void;
    reject: (reason?: any) => void;
}

export class McpManager implements vscode.Disposable {
    private readonly config: McpConfig;
    private nextSessionId = 1;
    private activeSessions: Map<number, { terminal: vscode.Terminal; session: McpSession }> = new Map();
    private queue: QueuedRequest[] = [];
    private disposed = false;
    private bridge?: McpBridgeServer;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.config = new McpConfig(context.globalState);
    }

    public dispose(): void {
        this.disposed = true;
        this.stopAll();
    }

    public async startSession(): Promise<McpSession | undefined> {
        if (this.disposed) {
            return undefined;
        }

        const state = this.effectiveState();
        if (!state.enabled) {
            await this.config.updateEnabled(true);
        }

        // Start bridge on demand when first session is requested
        if (!this.bridge) {
            this.bridge = new McpBridgeServer(
                () => new Set(this.enabledTools()),
                () => Math.max(1, this.effectiveState().sessionCap || 3),
                () => this.getActiveSessionCount()
            );
            this.bridge.start();
        }

        const cap = Math.max(1, state.sessionCap || 3);

        if (this.activeSessions.size >= cap) {
            return new Promise<McpSession | undefined>((resolve, reject) => {
                this.queue.push({ resolve, reject });
                vscode.window.showInformationMessage(`MCP sessions at capacity (${cap}). Request queued.`);
            });
        }

        const sessionId = this.nextSessionId++;
        const dispatcher = new McpDispatcher(new Set(this.enabledTools()));
        const session = new McpSession(sessionId, dispatcher, (id) => this.onSessionClosed(id));
        const pty: vscode.Pseudoterminal = session;
        const terminal = vscode.window.createTerminal({ name: `MCP ${sessionId}`, pty });
        this.activeSessions.set(sessionId, { terminal, session });
        terminal.show(false);
        vscode.window.showInformationMessage(`MCP session ${sessionId} started.`);
        return session;
    }

    public stopAll(): void {
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

    public async setEnabled(enabled: boolean): Promise<void> {
        await this.config.updateEnabled(enabled);
    }

    public async setSessionCap(cap: number): Promise<void> {
        await this.config.updateSessionCap(cap);
    }

    public async setDisabledTools(disabledTools: string[]): Promise<void> {
        await this.config.updateDisabledTools(disabledTools);
    }

    public loadState() {
        return this.config.load();
    }

    public getActiveSessionCount(): number {
        return this.activeSessions.size;
    }

    private enabledTools(): string[] {
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

    private effectiveState() {
        const stored = this.config.load();
        const config = vscode.workspace.getConfiguration('aws-ai-assistant.mcp');
        const enabled = config.get<boolean>('enabled', stored.enabled);
        const sessionCap = config.get<number>('sessionCap', stored.sessionCap);
        const disabledTools = config.get<string[]>('disabledTools', stored.disabledTools);
        return { enabled, sessionCap, disabledTools };
    }

    private onSessionClosed(sessionId: number): void {
        this.activeSessions.delete(sessionId);
        if (this.queue.length > 0) {
            const queued = this.queue.shift();
            if (queued) {
                this.startSession().then(queued.resolve).catch(queued.reject);
            }
        }
        this.bridge?.notifyCapacityChange();
    }
}
