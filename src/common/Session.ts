import * as ui from './UI';
import * as vscode from 'vscode';

export class Session {
	public static Current: Session | undefined = undefined;

    public Context: vscode.ExtensionContext;
    public ExtensionUri: vscode.Uri;
    public ActiveProfile:string = "default";

	public constructor(context: vscode.ExtensionContext) {
		Session.Current = this;
        this.Context = context;
        this.ExtensionUri = context.extensionUri;
        this.LoadState();
	}

    public SaveState() {
        ui.logToOutput('Saving state...');
        
        // this.Context.globalState.update('apiUrl', this.Server?.apiUrl);
        // this.Context.globalState.update('apiUserName', this.Server?.apiUserName);
        // this.Context.globalState.update('apiPassword', this.Server?.apiPassword);
        // this.Context.globalState.update('serverList', this.ServerList);
    }

    public LoadState() {
        ui.logToOutput('Loading state...');

        // const apiUrlTemp: string = this.Context.globalState.get('apiUrl') || '';
        // const apiUserNameTemp: string = this.Context.globalState.get('apiUserName') || '';
        // const apiPasswordTemp: string = this.Context.globalState.get('apiPassword') || '';

    }


	public dispose() {
		Session.Current = undefined;
	}
}