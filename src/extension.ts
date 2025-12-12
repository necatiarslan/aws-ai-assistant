import * as vscode from 'vscode';
import * as ui from './common/UI';
import * as StatusBar from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { registerChatParticipant } from './chat/ChatParticipant';
import { TestAwsConnectionTool } from './sts/TestAwsConnectionTool';
import * as stsAPI from './sts/API';
import { AIHandler } from './chat/AIHandler';
import { S3GenericTool } from './s3/S3GenericTool';
import { FileOperationsTool } from './common/FileOperationsTool';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	Session.Current = new Session(context);
	AIHandler.Current = new AIHandler();

	new StatusBar.StatusBarItem(context);

	// Register chat participant
	const chatParticipant = registerChatParticipant(context);
	context.subscriptions.push(chatParticipant);
	ui.logToOutput('Chat participant registered');

	// Register language model tools
	const testAwsConnectionTool = vscode.lm.registerTool('aws-ai-assistant_testAwsConnection', new TestAwsConnectionTool());
	context.subscriptions.push(testAwsConnectionTool);

	const s3GenericTool = vscode.lm.registerTool('aws-ai-assistant_s3Generic', new S3GenericTool());
	context.subscriptions.push(s3GenericTool);

	const fileOperationsTool = vscode.lm.registerTool('aws-ai-assistant_fileOperations', new FileOperationsTool());
	context.subscriptions.push(fileOperationsTool);

	ui.logToOutput('Language model tools registered');

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
