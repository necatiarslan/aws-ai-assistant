import * as ui from './UI';
import * as vscode from 'vscode';

export class Session {
	public static Current: Session | undefined = undefined;

    public Context: vscode.ExtensionContext;
    public ExtensionUri: vscode.Uri;
    public AwsProfile:string = "default";
    public AwsEndPoint: string | undefined;
	public AwsRegion: string = "us-east-1";

	public constructor(context: vscode.ExtensionContext) {
		Session.Current = this;
        this.Context = context;
        this.ExtensionUri = context.extensionUri;
        this.LoadState();
	}

    public SaveState() {
        ui.logToOutput('Saving state...');
        
        try 
        {
            this.Context.globalState.update('AwsProfile', Session.Current?.AwsProfile);
            this.Context.globalState.update('AwsEndPoint', Session.Current?.AwsEndPoint);
            this.Context.globalState.update('AwsRegion', Session.Current?.AwsRegion);
        } catch (error) {
            ui.logToOutput("Session.SaveState Error !!!");
        }
    }

    public LoadState() {
        ui.logToOutput('Loading state...');

        try {
            let AwsProfileTemp:string | undefined  = this.Context.globalState.get('AwsProfile');
            let AwsEndPointTemp:string | undefined  = this.Context.globalState.get('AwsEndPoint');
            let AwsRegionTemp:string | undefined  = this.Context.globalState.get('AwsRegion');

            if (AwsEndPointTemp) { Session.Current!.AwsEndPoint = AwsEndPointTemp; }
            if (AwsRegionTemp) { Session.Current!.AwsRegion = AwsRegionTemp; }
            if (AwsProfileTemp) { Session.Current!.AwsProfile = AwsProfileTemp; }

        } catch (error) {
            ui.logToOutput("dagTreeView.LoadState Error !!!");
        }
    }

    public async SetAwsEndpoint() {
        const current = Session.Current?.AwsEndPoint || '';
        const value = await vscode.window.showInputBox({
            prompt: 'Enter AWS Endpoint URL (e.g., https://s3.amazonaws.com or custom S3-compatible endpoint)',
            placeHolder: 'https://example-endpoint',
            value: current,
        });
        if (value !== undefined) {
            if (!Session.Current) {
                ui.showErrorMessage('Session not initialized', new Error('No session'));
                return;
            }
            Session.Current.AwsEndPoint = value.trim() || undefined;
            Session.Current.SaveState();
            ui.showInfoMessage('AWS Endpoint updated');
            ui.logToOutput('AWS Endpoint set to ' + (Session.Current.AwsEndPoint || 'undefined'));
        }
    }

    public async SetAwsRegion() {
        const current = Session.Current?.AwsRegion || 'us-east-1';
        const value = await vscode.window.showInputBox({
            prompt: 'Enter default AWS region',
            placeHolder: 'us-east-1',
            value: current,
        });
        if (value !== undefined) {
            if (!Session.Current) {
                ui.showErrorMessage('Session not initialized', new Error('No session'));
                return;
            }
            Session.Current.AwsRegion = value.trim() || 'us-east-1';
            Session.Current.SaveState();
            ui.showInfoMessage('Default AWS Region updated');
            ui.logToOutput('AWS Region set to ' + (Session.Current.AwsRegion || 'us-east-1'));
        }
    }

	public dispose() {
		Session.Current = undefined;
	}
}