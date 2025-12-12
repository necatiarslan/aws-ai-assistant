import * as vscode from 'vscode';
import * as ui from './common/UI';
import { StatusBarItem } from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { TestAwsConnectionTool } from './sts/TestAwsConnectionTool';
import * as stsAPI from './sts/API';
import { AIHandler } from './chat/AIHandler';
import { S3GenericTool } from './s3/S3GenericTool';
import { FileOperationsTool } from './common/FileOperationsTool';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	new Session(context);
	new AIHandler();
	new StatusBarItem(context);

	
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
		StatusBarItem.Current.GetCredentials();
	});

	vscode.commands.registerCommand('aws-ai-assistant.ListAwsProfiles', () => {
		StatusBarItem.Current.ListAwsProfiles();
	});

	vscode.commands.registerCommand('aws-ai-assistant.SetAwsProfile', () => {
		StatusBarItem.Current.SetAwsProfile();
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
