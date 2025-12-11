import * as ui from './UI';
import * as vscode from 'vscode';

export class Session {
	public static Current: Session | undefined = undefined;

    public Context: vscode.ExtensionContext;
    public ExtensionUri: vscode.Uri;
    public ActiveProfile:string = "default";
    public AwsEndPoint: string | undefined;
	public AwsRegion: string | undefined;

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
            this.Context.globalState.update('ActiveProfile', Session.Current?.ActiveProfile);
        } catch (error) {
            ui.logToOutput("StatusBarItem.SaveState Error !!!");
        }
    }

    public LoadState() {
        ui.logToOutput('Loading state...');

        try {
            let ActiveProfileTemp:string | undefined  = this.Context.globalState.get('ActiveProfile');
            if (ActiveProfileTemp) { Session.Current!.ActiveProfile = ActiveProfileTemp; }

        } catch (error) {
            ui.logToOutput("dagTreeView.LoadState Error !!!");
        }
    }


	public dispose() {
		Session.Current = undefined;
	}
}