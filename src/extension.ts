import * as vscode from 'vscode';
import * as ui from './common/UI';
import * as StatusBar from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { registerS3BucketsTool } from './language_tools/S3BucketsTool';
import { registerChatParticipant } from './language_tools/ChatParticipant';
import { TestAwsConnectionTool } from './language_tools/TestAwsConnectionTool';
import * as stsAPI from './sts/API';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	Session.Current = new Session(context);

	new StatusBar.StatusBarItem(context);

	// Register chat participant
	const chatParticipant = registerChatParticipant(context);
	context.subscriptions.push(chatParticipant);
	ui.logToOutput('Chat participant registered');

	// Register language model tools
	const testAwsConnectionTool = vscode.lm.registerTool('aws-ai-assistant_testAwsConnection', new TestAwsConnectionTool());
	context.subscriptions.push(testAwsConnectionTool);
	ui.logToOutput('Language model tools registered');

	// Register language tools
	registerS3BucketsTool(context);

	// Command to set AWS Endpoint
	vscode.commands.registerCommand('aws-ai-assistant.SetAwsEndpoint', async () => {
		Session.Current?.SetAwsEndpoint();
	});

	// Command to set default AWS Region
	vscode.commands.registerCommand('aws-ai-assistant.SetDefaultRegion', async () => {
		Session.Current?.SetAwsRegion();
	});
	
	vscode.commands.registerCommand('aws-ai-assistant.RefreshCredentials', () => {
		StatusBar.StatusBarItem.Current.GetCredentials();
	});

	vscode.commands.registerCommand('aws-ai-assistant.ListAwsProfiles', () => {
		StatusBar.StatusBarItem.Current.ListAwsProfiles();
	});

	vscode.commands.registerCommand('aws-ai-assistant.SetAwsProfile', () => {
		StatusBar.StatusBarItem.Current.SetAwsProfile();
	});

	vscode.commands.registerCommand('aws-ai-assistant.TestAwsConnectivity', async () => {
		let result = await stsAPI.TestAwsConnection();
		if (result.isSuccessful) {
			ui.showInfoMessage('AWS connectivity test successful.');
		} else {
			ui.showErrorMessage('AWS connectivity test failed.', result.error);
		}
	});

}

export function deactivate() {
	ui.logToOutput('Aws AI Assistant is now de-active!');
}
