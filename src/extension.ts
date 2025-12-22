import * as vscode from 'vscode';
import * as ui from './common/UI';
import { StatusBarItem } from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { ClientManager } from './common/ClientManager';
import { TestAwsConnectionTool } from './sts/TestAwsConnectionTool';
import { STSTool } from './sts/STSTool';
import * as stsAPI from './sts/API';
import { AIHandler } from './chat/AIHandler';
import { S3Tool } from './s3/S3Tool';
import { SNSTool } from './sns/SNSTool';
import { SQSTool } from './sqs/SQSTool';
import { EC2Tool } from './ec2/EC2Tool';
import { FileOperationsTool } from './common/FileOperationsTool';
import { SessionTool } from './common/SessionTool';
import { CloudWatchLogTool } from './cloudwatch/CloudWatchLogTool';
import { LambdaTool } from './lambda/LambdaTool';
import { StepFuncTool } from './stepfunc/StepFuncTool';
import { GlueTool } from './glue/GlueTool';
import { IAMTool } from './iam/IAMTool';
import { DynamoDBTool } from './dynamodb/DynamoDBTool';
import { APIGatewayTool } from './apigateway/APIGatewayTool';
import { RDSTool } from './rds/RDSTool';
import { RDSDataTool } from './rdsdata/RDSDataTool';
import { CloudFormationTool } from './cloudformation/CloudFormationTool';
import { CloudWatchLogView } from './cloudwatch/CloudWatchLogView';
import { S3Explorer } from './s3/S3Explorer';
import { CommandHistoryView } from './common/CommandHistoryView';
import { ServiceAccessView } from './common/ServiceAccessView';
import { EMRTool } from './emr/EMRTool';
import { McpManager } from './mcp/McpManager';
import { McpManageView } from './mcp/McpManageView';

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Aws AI Assistant is now active!');

	// Initialize Core Services
	const session = new Session(context);
	new AIHandler();
	const statusBar = new StatusBarItem();
	const clientManager = ClientManager.Instance;
	const mcpManager = new McpManager(context);

	// Register disposables
	context.subscriptions.push(
		session,
		statusBar,
		clientManager,
		mcpManager,
		{ dispose: () => ui.dispose() }
	);

	if (Session.Current?.IsHostSupportLanguageTools()) {
		// Register language model tools
		context.subscriptions.push(
			vscode.lm.registerTool('TestAwsConnectionTool', new TestAwsConnectionTool()),
			vscode.lm.registerTool('STSTool', new STSTool()),
			vscode.lm.registerTool('SQSTool', new SQSTool()),
			vscode.lm.registerTool('EC2Tool', new EC2Tool()),
			vscode.lm.registerTool('S3Tool', new S3Tool()),
			vscode.lm.registerTool('SNSTool', new SNSTool()),
			vscode.lm.registerTool('APIGatewayTool', new APIGatewayTool()),
			vscode.lm.registerTool('RDSTool', new RDSTool()),
			vscode.lm.registerTool('RDSDataTool', new RDSDataTool()),
			vscode.lm.registerTool('CloudFormationTool', new CloudFormationTool()),
			vscode.lm.registerTool('FileOperationsTool', new FileOperationsTool()),
			vscode.lm.registerTool('session', new SessionTool()),
			vscode.lm.registerTool('CloudWatchLogTool', new CloudWatchLogTool()),
			vscode.lm.registerTool('LambdaTool', new LambdaTool()),
			vscode.lm.registerTool('StepFuncTool', new StepFuncTool()),
			vscode.lm.registerTool('GlueTool', new GlueTool()),
			vscode.lm.registerTool('IAMTool', new IAMTool()),
			vscode.lm.registerTool('DynamoDBTool', new DynamoDBTool()),
			vscode.lm.registerTool('EMRTool', new EMRTool())
		);
	}
	else {
		ui.logToOutput(`Language model tools registration skipped for ${Session.Current?.HostAppName}`);
	}

	ui.logToOutput('Language model tools registered');

	// Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('aws-ai-assistant.SetAwsEndpoint', async () => {
			Session.Current?.SetAwsEndpoint();
		}),

		vscode.commands.registerCommand('aws-ai-assistant.SetDefaultRegion', async () => {
			Session.Current?.SetAwsRegion();
		}),

		vscode.commands.registerCommand('aws-ai-assistant.RefreshCredentials', () => {
			Session.Current?.RefreshCredentials();
		}),

		vscode.commands.registerCommand('aws-ai-assistant.ListAwsProfiles', () => {
			StatusBarItem.Current.ListAwsProfiles();
		}),

		vscode.commands.registerCommand('aws-ai-assistant.SetAwsProfile', () => {
			StatusBarItem.Current.SetAwsProfile();
		}),

		vscode.commands.registerCommand('aws-ai-assistant.TestAwsConnectivity', async () => {
			const result = await stsAPI.TestAwsConnection();
			if (result.isSuccessful) {
				ui.showInfoMessage('AWS connectivity test successful.');
			} else {
				ui.showErrorMessage('AWS connectivity test failed.', result.error);
			}
		}),

		vscode.commands.registerCommand('aws-ai-assistant.OpenCloudWatchView', async (logGroup: string, logStream?: string) => {
			if (!Session.Current) {
				ui.showErrorMessage('Session not initialized', new Error('No session'));
				return;
			}
			const region = Session.Current.AwsRegion;
			const stream = logStream || '';
			CloudWatchLogView.Render(Session.Current.ExtensionUri, region, logGroup, stream);
		}),


		vscode.commands.registerCommand('aws-ai-assistant.OpenS3ExplorerView', async (bucket: string, key?: string) => {
			if (!Session.Current) {
				ui.showErrorMessage('Session not initialized', new Error('No session'));
				return;
			}
			S3Explorer.Render(Session.Current.ExtensionUri, bucket, key);
		}),

        vscode.commands.registerCommand('aws-ai-assistant.ShowCommandHistory', () => {
            if (!Session.Current) {
                ui.showErrorMessage('Session not initialized', new Error('No session'));
                return;
            }
            CommandHistoryView.Render(Session.Current.ExtensionUri);
        }),

        vscode.commands.registerCommand('aws-ai-assistant.OpenServiceAccessView', () => {
            if (!Session.Current) {
                ui.showErrorMessage('Session not initialized', new Error('No session'));
                return;
            }
            ServiceAccessView.Render(Session.Current.ExtensionUri);
        }),

		vscode.commands.registerCommand('aws-ai-assistant.StartMcpServer', async () => {
			if (!Session.Current) {
				ui.showErrorMessage('Session not initialized', new Error('No session'));
				return;
			}
			await mcpManager.startSession();
		}),

		vscode.commands.registerCommand('aws-ai-assistant.StopMcpServers', () => {
			mcpManager.stopAll();
			ui.showInfoMessage('All MCP sessions stopped.');
		}),

		vscode.commands.registerCommand('aws-ai-assistant.OpenMcpManageView', () => {
			McpManageView.Render(context.extensionUri, mcpManager);
		}),

		vscode.commands.registerCommand('aws-ai-assistant.LoadMoreResults', async (paginationContext: any) => {
			if (!paginationContext) {
				ui.showErrorMessage('Pagination context not available', new Error('No pagination context'));
				return;
			}

			// Add pagination token to params based on tokenType
			const updatedParams = { ...paginationContext.params };
			if (paginationContext.tokenType === 'NextContinuationToken') {
				updatedParams.ContinuationToken = paginationContext.paginationToken;
			} else if (paginationContext.tokenType === 'NextToken') {
				updatedParams.NextToken = paginationContext.paginationToken;
			} else if (paginationContext.tokenType === 'NextMarker') {
				updatedParams.Marker = paginationContext.paginationToken;
			}

			// Create and send a new chat request with the pagination params
			const prompt = `Continue loading more results for: ${paginationContext.command} with previous parameters`;
			await AIHandler.Current.askAI(prompt);
		})
	);
}

export function deactivate() {
	ui.logToOutput('Aws AI Assistant is now de-active!');
}

