import * as vscode from 'vscode';
import * as ui from './common/UI';
import * as StatusBar from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { registerChatParticipant } from './chat/ChatParticipant';
import { AIHandler } from './chat/AIHandler';
import * as session from './common/SessionToolsRegister';
import * as s3 from './s3/S3ToolsRegister';
import * as sts from './sts/STSToolsRegister';


export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	new Session(context);
	new AIHandler();

	// Register chat participant
	registerChatParticipant(context);
	s3.Register(context);
	sts.Register(context);
	session.Register(context);

	new StatusBar.StatusBarItem(context);

	// Command to set AWS Endpoint
	vscode.commands.registerCommand('aws-ai-assistant.SetAwsEndpoint', async () => {Session.Current?.SetAwsEndpoint();});
	vscode.commands.registerCommand('aws-ai-assistant.SetAwsRegion', async () => {Session.Current?.SetAwsRegion();});	
	vscode.commands.registerCommand('aws-ai-assistant.RefreshCredentials', () => {StatusBar.StatusBarItem.Current.GetCredentials();});
	vscode.commands.registerCommand('aws-ai-assistant.ListAwsProfiles', () => {StatusBar.StatusBarItem.Current.ListAwsProfiles();});
	vscode.commands.registerCommand('aws-ai-assistant.SetAwsProfile', () => {StatusBar.StatusBarItem.Current.SetAwsProfile();});
	vscode.commands.registerCommand('aws-ai-assistant.TestAwsConnectivity', async () => { StatusBar.StatusBarItem.Current.TestAwsConnection();});

}

export function deactivate() {
	ui.logToOutput('Aws AI Assistant is now de-active!');
}
