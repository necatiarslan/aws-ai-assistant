import * as vscode from 'vscode';
import * as ui from './common/UI';
import * as StatusBar from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { registerS3BucketsTool } from './language_tools/S3BucketsTool';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	Session.Current = new Session(context);

	new StatusBar.StatusBarItem(context);

	// Register language tools
	registerS3BucketsTool(context);

	// Command to set AWS Endpoint
	vscode.commands.registerCommand('aws-ai-assistant.SetAwsEndpoint', async () => {
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
	});

	// Command to set default AWS Region
	vscode.commands.registerCommand('aws-ai-assistant.SetDefaultRegion', async () => {
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
	});
	
	vscode.commands.registerCommand('aws-ai-assistant.RefreshCredentials', () => {
		StatusBar.StatusBarItem.Current.GetCredentials();
	});

	vscode.commands.registerCommand('aws-ai-assistant.ListAwsProfiles', () => {
		StatusBar.StatusBarItem.Current.ListAwsProfiles();
	});

	vscode.commands.registerCommand('aws-ai-assistant.SetActiveProfile', () => {
		StatusBar.StatusBarItem.Current.SetActiveProfile();
	});

	vscode.commands.registerCommand('aws-ai-assistant.TestAwsConnectivity', () => {
		StatusBar.StatusBarItem.Current.TestAwsConnectivity();
	});

}

export function deactivate() {
	ui.logToOutput('Aws AI Assistant is now de-active!');
}
