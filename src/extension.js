"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const ui = require("./common/UI");
const StatusBarItem_1 = require("./statusbar/StatusBarItem");
const Session_1 = require("./common/Session");
const ClientManager_1 = require("./common/ClientManager");
const TestAwsConnectionTool_1 = require("./sts/TestAwsConnectionTool");
const STSTool_1 = require("./sts/STSTool");
const stsAPI = require("./sts/API");
const AIHandler_1 = require("./chat/AIHandler");
const S3Tool_1 = require("./s3/S3Tool");
const SNSTool_1 = require("./sns/SNSTool");
const SQSTool_1 = require("./sqs/SQSTool");
const EC2Tool_1 = require("./ec2/EC2Tool");
const FileOperationsTool_1 = require("./common/FileOperationsTool");
const SessionTool_1 = require("./common/SessionTool");
const CloudWatchLogTool_1 = require("./cloudwatch/CloudWatchLogTool");
const LambdaTool_1 = require("./lambda/LambdaTool");
const StepFuncTool_1 = require("./stepfunc/StepFuncTool");
const GlueTool_1 = require("./glue/GlueTool");
const IAMTool_1 = require("./iam/IAMTool");
const DynamoDBTool_1 = require("./dynamodb/DynamoDBTool");
const APIGatewayTool_1 = require("./apigateway/APIGatewayTool");
const RDSTool_1 = require("./rds/RDSTool");
const RDSDataTool_1 = require("./rdsdata/RDSDataTool");
const CloudFormationTool_1 = require("./cloudformation/CloudFormationTool");
const CloudWatchLogView_1 = require("./cloudwatch/CloudWatchLogView");
const S3Explorer_1 = require("./s3/S3Explorer");
const CommandHistoryView_1 = require("./common/CommandHistoryView");
const ServiceAccessView_1 = require("./common/ServiceAccessView");
const EMRTool_1 = require("./emr/EMRTool");
const McpManager_1 = require("./mcp/McpManager");
const McpManageView_1 = require("./mcp/McpManageView");
function activate(context) {
    ui.logToOutput('Awsflow is now active!');
    // Initialize Core Services
    const session = new Session_1.Session(context);
    new AIHandler_1.AIHandler();
    const statusBar = new StatusBarItem_1.StatusBarItem();
    const clientManager = ClientManager_1.ClientManager.Instance;
    const mcpManager = new McpManager_1.McpManager(context);
    // Register disposables
    context.subscriptions.push(session, statusBar, clientManager, mcpManager, { dispose: () => ui.dispose() });
    if (Session_1.Session.Current?.IsHostSupportLanguageTools()) {
        // Register language model tools
        context.subscriptions.push(vscode.lm.registerTool('TestAwsConnectionTool', new TestAwsConnectionTool_1.TestAwsConnectionTool()), vscode.lm.registerTool('STSTool', new STSTool_1.STSTool()), vscode.lm.registerTool('SQSTool', new SQSTool_1.SQSTool()), vscode.lm.registerTool('EC2Tool', new EC2Tool_1.EC2Tool()), vscode.lm.registerTool('S3Tool', new S3Tool_1.S3Tool()), vscode.lm.registerTool('SNSTool', new SNSTool_1.SNSTool()), vscode.lm.registerTool('APIGatewayTool', new APIGatewayTool_1.APIGatewayTool()), vscode.lm.registerTool('RDSTool', new RDSTool_1.RDSTool()), vscode.lm.registerTool('RDSDataTool', new RDSDataTool_1.RDSDataTool()), vscode.lm.registerTool('CloudFormationTool', new CloudFormationTool_1.CloudFormationTool()), vscode.lm.registerTool('FileOperationsTool', new FileOperationsTool_1.FileOperationsTool()), vscode.lm.registerTool('session', new SessionTool_1.SessionTool()), vscode.lm.registerTool('CloudWatchLogTool', new CloudWatchLogTool_1.CloudWatchLogTool()), vscode.lm.registerTool('LambdaTool', new LambdaTool_1.LambdaTool()), vscode.lm.registerTool('StepFuncTool', new StepFuncTool_1.StepFuncTool()), vscode.lm.registerTool('GlueTool', new GlueTool_1.GlueTool()), vscode.lm.registerTool('IAMTool', new IAMTool_1.IAMTool()), vscode.lm.registerTool('DynamoDBTool', new DynamoDBTool_1.DynamoDBTool()), vscode.lm.registerTool('EMRTool', new EMRTool_1.EMRTool()));
    }
    else {
        ui.logToOutput(`Language model tools registration skipped for ${Session_1.Session.Current?.HostAppName}`);
    }
    ui.logToOutput('Language model tools registered');
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('awsflow.SetAwsEndpoint', async () => { Session_1.Session.Current?.SetAwsEndpoint(); }), vscode.commands.registerCommand('awsflow.SetDefaultRegion', async () => { Session_1.Session.Current?.SetAwsRegion(); }), vscode.commands.registerCommand('awsflow.RefreshCredentials', () => { Session_1.Session.Current?.RefreshCredentials(); }), vscode.commands.registerCommand('awsflow.ListAwsProfiles', () => { StatusBarItem_1.StatusBarItem.Current.ListAwsProfiles(); }), vscode.commands.registerCommand('awsflow.SetAwsProfile', () => { StatusBarItem_1.StatusBarItem.Current.SetAwsProfile(); }), vscode.commands.registerCommand('awsflow.TestAwsConnectivity', async () => {
        const result = await stsAPI.TestAwsConnection();
        if (result.isSuccessful) {
            ui.showInfoMessage('AWS connectivity test successful.');
        }
        else {
            ui.showErrorMessage('AWS connectivity test failed.', result.error);
        }
    }), vscode.commands.registerCommand('awsflow.OpenCloudWatchView', async (logGroup, logStream) => {
        if (!Session_1.Session.Current) {
            ui.showErrorMessage('Session not initialized', new Error('No session'));
            return;
        }
        const region = Session_1.Session.Current.AwsRegion;
        const stream = logStream || '';
        CloudWatchLogView_1.CloudWatchLogView.Render(Session_1.Session.Current.ExtensionUri, region, logGroup, stream);
    }), vscode.commands.registerCommand('awsflow.OpenS3ExplorerView', async (bucket, key) => {
        if (!Session_1.Session.Current) {
            ui.showErrorMessage('Session not initialized', new Error('No session'));
            return;
        }
        S3Explorer_1.S3Explorer.Render(Session_1.Session.Current.ExtensionUri, bucket, key);
    }), vscode.commands.registerCommand('awsflow.ShowCommandHistory', () => {
        if (!Session_1.Session.Current) {
            ui.showErrorMessage('Session not initialized', new Error('No session'));
            return;
        }
        CommandHistoryView_1.CommandHistoryView.Render(Session_1.Session.Current.ExtensionUri);
    }), vscode.commands.registerCommand('awsflow.OpenServiceAccessView', () => {
        if (!Session_1.Session.Current) {
            ui.showErrorMessage('Session not initialized', new Error('No session'));
            return;
        }
        ServiceAccessView_1.ServiceAccessView.Render(Session_1.Session.Current.ExtensionUri);
    }), vscode.commands.registerCommand('awsflow.StartMcpServer', async () => {
        if (!Session_1.Session.Current) {
            ui.showErrorMessage('Session not initialized', new Error('No session'));
            return;
        }
        if (Session_1.Session.Current.IsHostSupportLanguageTools()) {
            ui.showInfoMessage('MCP server is not required in this environment.');
            return;
        }
        await mcpManager.startSession();
    }), vscode.commands.registerCommand('awsflow.StopMcpServers', () => {
        if (!Session_1.Session.Current) {
            return;
        }
        if (Session_1.Session.Current.IsHostSupportLanguageTools()) {
            ui.showInfoMessage('MCP server is not required in this environment.');
            return;
        }
        mcpManager.stopAll();
        ui.showInfoMessage('All MCP sessions stopped.');
    }), vscode.commands.registerCommand('awsflow.OpenMcpManageView', () => {
        if (!Session_1.Session.Current) {
            return;
        }
        if (Session_1.Session.Current.IsHostSupportLanguageTools()) {
            ui.showInfoMessage('MCP server is not required in this environment.');
            return;
        }
        McpManageView_1.McpManageView.Render(context.extensionUri, mcpManager);
    }), vscode.commands.registerCommand('awsflow.LoadMoreResults', async (paginationContext) => {
        if (!paginationContext) {
            ui.showErrorMessage('Pagination context not available', new Error('No pagination context'));
            return;
        }
        // Add pagination token to params based on tokenType
        const updatedParams = { ...paginationContext.params };
        if (paginationContext.tokenType === 'NextContinuationToken') {
            updatedParams.ContinuationToken = paginationContext.paginationToken;
        }
        else if (paginationContext.tokenType === 'NextToken') {
            updatedParams.NextToken = paginationContext.paginationToken;
        }
        else if (paginationContext.tokenType === 'NextMarker') {
            updatedParams.Marker = paginationContext.paginationToken;
        }
        // Create and send a new chat request with the pagination params
        const prompt = `Continue loading more results for: ${paginationContext.command} with previous parameters`;
        await AIHandler_1.AIHandler.Current.askAI(prompt);
    }));
}
function deactivate() {
    ui.logToOutput('Awsflow is now de-active!');
}
//# sourceMappingURL=extension.js.map