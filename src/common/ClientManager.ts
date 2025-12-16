import * as vscode from 'vscode';
import { Session } from './Session';
import * as ui from './UI';

/**
 * Manages AWS SDK clients and handles lifecycle/caching.
 * Automatically clears clients when the session (profile/region) changes.
 */
export class ClientManager implements vscode.Disposable {
    private static _instance: ClientManager;
    private _clients: Map<string, any> = new Map();
    private _disposables: vscode.Disposable[] = [];

    private constructor() {
        if (Session.Current) {
           this._disposables.push(Session.Current.onDidChangeSession(() => this.clearClients()));
        }
    }

    public static get Instance(): ClientManager {
        if (!ClientManager._instance) {
            ClientManager._instance = new ClientManager();
        }
        return ClientManager._instance;
    }

    /**
     * Get or create a client for a specific service.
     * @param serviceName Unique key for the service (e.g., 's3', 'ec2')
     * @param factory Factory function to create the client if not cached
     */
    public async getClient<T>(serviceName: string, factory: (session: Session) => Promise<T>): Promise<T> {
        if (this._clients.has(serviceName)) {
            return this._clients.get(serviceName);
        }

        if (!Session.Current) {
            throw new Error('Session not initialized');
        }

        ui.logToOutput(`ClientManager: Creating new client for ${serviceName} (Region: ${Session.Current.AwsRegion})`);
        const client = await factory(Session.Current);
        this._clients.set(serviceName, client);
        return client;
    }

    /**
     * Clears all cached clients. Called when session settings change.
     */
    public clearClients() {
        ui.logToOutput('ClientManager: Clearing all cached AWS clients due to session change.');
        // If clients have destroy/dispose methods, we should call them here.
        // Most AWS SDK v3 clients are stateless but some might hold sockets.
        // For now, we just drop the references.
        this._clients.clear();
    }

    public dispose() {
        this._clients.clear();
        this._disposables.forEach(d => d.dispose());
    }
}
