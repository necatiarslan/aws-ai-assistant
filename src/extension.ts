import * as vscode from 'vscode';
import * as ui from './common/UI';
import * as StatusBar from './access/StatusBarItem';
import { Session } from './common/Session';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	Session.Current = new Session(context);

	new StatusBar.StatusBarItem(context);
	
	vscode.commands.registerCommand('aws-ai-assistant.RefreshCredentials', () => {
		StatusBar.StatusBarItem.Current.GetCredentials();
	});

	vscode.commands.registerCommand('aws-ai-assistant.SetAwsLoginCommand', () => {
		StatusBar.StatusBarItem.Current.SetAwsLoginCommand();
	});

	vscode.commands.registerCommand('aws-ai-assistant.ListAwsProfiles', () => {
		StatusBar.StatusBarItem.Current.ListAwsProfiles();
	});

	vscode.commands.registerCommand('aws-ai-assistant.RunLoginCommand', () => {
		StatusBar.StatusBarItem.Current.RunLoginCommand();
	});

	vscode.commands.registerCommand('aws-ai-assistant.PauseAutoLogin', () => {
		StatusBar.StatusBarItem.Current.PauseAutoLogin();
	});

	vscode.commands.registerCommand('aws-ai-assistant.SetActiveProfile', () => {
		StatusBar.StatusBarItem.Current.SetActiveProfile();
	});

	vscode.commands.registerCommand('aws-ai-assistant.ShowActiveCredentials', () => {
		StatusBar.StatusBarItem.Current.ShowActiveCredentials();
	});

	vscode.commands.registerCommand('aws-ai-assistant.ShowDefaultCredentials', () => {
		StatusBar.StatusBarItem.Current.ShowDefaultCredentials();
	});

	vscode.commands.registerCommand('aws-ai-assistant.OpenCredentialsFile', () => {
		StatusBar.StatusBarItem.Current.OpenCredentialsFile();
	});

	vscode.commands.registerCommand('aws-ai-assistant.OpenConfigFile', () => {
		StatusBar.StatusBarItem.Current.OpenConfigFile();
	});

	vscode.commands.registerCommand('aws-ai-assistant.TestAwsConnectivity', () => {
		StatusBar.StatusBarItem.Current.TestAwsConnectivity();
	});

	vscode.commands.registerCommand('aws-ai-assistant.CopyCredentialsToDefaultProfile', () => {
		StatusBar.StatusBarItem.Current.CopyCredentialsToDefaultProfile();
	});

	vscode.window.onDidCloseTerminal((terminal) => {
			StatusBar.StatusBarItem.Current.onDidCloseTerminal(terminal);
	});

}

export function deactivate() {
	ui.logToOutput('Aws AI Assistant is now de-active!');
}
