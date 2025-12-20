import * as vscode from 'vscode';

interface McpState {
    enabled: boolean;
    sessionCap: number;
    disabledTools: string[];
}

const STATE_KEY = 'aws-ai-assistant.mcp.state';
const DEFAULT_STATE: McpState = {
    enabled: false,
    sessionCap: 3,
    disabledTools: []
};

export class McpConfig {
    constructor(private readonly memento: vscode.Memento) {}

    public load(): McpState {
        const stored = this.memento.get<McpState>(STATE_KEY);
        if (!stored) {
            return { ...DEFAULT_STATE };
        }
        return {
            enabled: stored.enabled ?? DEFAULT_STATE.enabled,
            sessionCap: stored.sessionCap ?? DEFAULT_STATE.sessionCap,
            disabledTools: stored.disabledTools ?? []
        };
    }

    public async updateEnabled(enabled: boolean): Promise<void> {
        const current = this.load();
        await this.memento.update(STATE_KEY, { ...current, enabled });
    }

    public async updateSessionCap(sessionCap: number): Promise<void> {
        const current = this.load();
        await this.memento.update(STATE_KEY, { ...current, sessionCap });
    }

    public async updateDisabledTools(disabledTools: string[]): Promise<void> {
        const current = this.load();
        await this.memento.update(STATE_KEY, { ...current, disabledTools });
    }
}
