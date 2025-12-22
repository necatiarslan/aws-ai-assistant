"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpDispatcher = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const Session_1 = require("../common/Session");
const S3Tool_1 = require("../s3/S3Tool");
const SNSTool_1 = require("../sns/SNSTool");
const SQSTool_1 = require("../sqs/SQSTool");
const EC2Tool_1 = require("../ec2/EC2Tool");
const FileOperationsTool_1 = require("../common/FileOperationsTool");
const SessionTool_1 = require("../common/SessionTool");
const CloudWatchLogTool_1 = require("../cloudwatch/CloudWatchLogTool");
const LambdaTool_1 = require("../lambda/LambdaTool");
const StepFuncTool_1 = require("../stepfunc/StepFuncTool");
const GlueTool_1 = require("../glue/GlueTool");
const IAMTool_1 = require("../iam/IAMTool");
const DynamoDBTool_1 = require("../dynamodb/DynamoDBTool");
const APIGatewayTool_1 = require("../apigateway/APIGatewayTool");
const RDSTool_1 = require("../rds/RDSTool");
const RDSDataTool_1 = require("../rdsdata/RDSDataTool");
const CloudFormationTool_1 = require("../cloudformation/CloudFormationTool");
const EMRTool_1 = require("../emr/EMRTool");
const STSTool_1 = require("../sts/STSTool");
const TestAwsConnectionTool_1 = require("../sts/TestAwsConnectionTool");
const ActionGuard_1 = require("../common/ActionGuard");
class McpDispatcher {
    constructor(enabledTools) {
        this.tools = new Map();
        this.toolMetadata = new Map();
        try {
            this.loadToolsFromPackageJson();
        }
        catch (error) {
            throw new Error(`Failed to load MCP tool definitions: ${error.message}`);
        }
        const allTools = [
            { name: 'TestAwsConnectionTool', instance: new TestAwsConnectionTool_1.TestAwsConnectionTool() },
            { name: 'STSTool', instance: new STSTool_1.STSTool() },
            { name: 'S3Tool', instance: new S3Tool_1.S3Tool() },
            { name: 'SNSTool', instance: new SNSTool_1.SNSTool() },
            { name: 'SQSTool', instance: new SQSTool_1.SQSTool() },
            { name: 'EC2Tool', instance: new EC2Tool_1.EC2Tool() },
            { name: 'FileOperationsTool', instance: new FileOperationsTool_1.FileOperationsTool() },
            { name: 'SessionTool', instance: new SessionTool_1.SessionTool() },
            { name: 'CloudWatchLogTool', instance: new CloudWatchLogTool_1.CloudWatchLogTool() },
            { name: 'LambdaTool', instance: new LambdaTool_1.LambdaTool() },
            { name: 'StepFuncTool', instance: new StepFuncTool_1.StepFuncTool() },
            { name: 'GlueTool', instance: new GlueTool_1.GlueTool() },
            { name: 'IAMTool', instance: new IAMTool_1.IAMTool() },
            { name: 'DynamoDBTool', instance: new DynamoDBTool_1.DynamoDBTool() },
            { name: 'APIGatewayTool', instance: new APIGatewayTool_1.APIGatewayTool() },
            { name: 'RDSTool', instance: new RDSTool_1.RDSTool() },
            { name: 'RDSDataTool', instance: new RDSDataTool_1.RDSDataTool() },
            { name: 'CloudFormationTool', instance: new CloudFormationTool_1.CloudFormationTool() },
            { name: 'EMRTool', instance: new EMRTool_1.EMRTool() }
        ];
        for (const t of allTools) {
            if (enabledTools.has(t.name)) {
                this.tools.set(t.name, t);
            }
        }
    }
    listTools() {
        return Array.from(this.tools.keys())
            .map(name => {
            const metadata = this.toolMetadata.get(name);
            if (!metadata) {
                return null; // Skip tools without metadata
            }
            return {
                name: metadata.name,
                description: metadata.modelDescription || metadata.userDescription || '',
                inputSchema: metadata.inputSchema || { type: 'object' }
            };
        })
            .filter(tool => tool !== null);
    }
    loadToolsFromPackageJson() {
        const packageJsonPath = path.join(__dirname, '../../package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found');
        }
        let packageJson;
        try {
            const raw = fs.readFileSync(packageJsonPath, 'utf8');
            packageJson = JSON.parse(raw);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON in package.json');
            }
            throw error;
        }
        const languageModelTools = packageJson?.contributes?.languageModelTools;
        if (!Array.isArray(languageModelTools)) {
            throw new Error('languageModelTools section missing in package.json');
        }
        for (const tool of languageModelTools) {
            if (tool.name) {
                this.toolMetadata.set(tool.name, tool);
            }
        }
    }
    async handle(request) {
        try {
            if (request.method === 'initialize') {
                return {
                    id: request.id,
                    jsonrpc: '2.0',
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            tools: {},
                            resources: {},
                            prompts: {}
                        },
                        serverInfo: {
                            name: 'awsflow',
                            version: '1.0.3'
                        }
                    }
                };
            }
            if (request.method === 'notifications/initialized' || request.method === 'initialized') {
                return undefined;
            }
            if (request.id === undefined || request.id === null) {
                return undefined;
            }
            if (request.method === 'list_tools' || request.method === 'tools/list') {
                return {
                    id: request.id,
                    jsonrpc: '2.0',
                    result: {
                        tools: this.listTools()
                    }
                };
            }
            if (request.method === 'call_tool' || request.method === 'tools/call') {
                const toolName = (request.params?.tool || request.params?.name);
                const args = (request.params?.params || request.params?.arguments) || {};
                const command = (request.params?.command || args?.command);
                const params = (args?.params || args);
                if (!toolName || !command) {
                    return { id: request.id, jsonrpc: '2.0', error: { message: 'tool and command (or name and arguments) are required', code: -32602 } };
                }
                const tool = this.tools.get(toolName);
                if (!tool) {
                    return { id: request.id, jsonrpc: '2.0', error: { message: `Tool ${toolName} is not enabled for MCP`, code: -32601 } };
                }
                if (!Session_1.Session.Current) {
                    return { id: request.id, jsonrpc: '2.0', error: { message: 'Session not initialized in VS Code', code: -32000 } };
                }
                if ((0, ActionGuard_1.needsConfirmation)(command)) {
                    const ok = await (0, ActionGuard_1.confirmProceed)(command, params);
                    if (!ok) {
                        return { id: request.id, jsonrpc: '2.0', error: { message: 'User cancelled action command', code: -32000 } };
                    }
                }
                const s = Session_1.Session.Current;
                const originalDisabledTools = s.DisabledTools;
                const originalDisabledCommands = s.DisabledCommands;
                s.DisabledTools = new Set();
                s.DisabledCommands = new Map();
                const tokenSource = new vscode.CancellationTokenSource();
                try {
                    const result = await tool.instance.invoke({
                        input: { command, params }
                    }, tokenSource.token);
                    const raw = result.output ?? result.content ?? result;
                    const content = Array.isArray(raw?.content) ? raw.content : Array.isArray(raw) ? raw : undefined;
                    let text;
                    if (content && content.length > 0) {
                        text = content.map((c) => c.value ?? c.text ?? '').join('');
                    }
                    else if (typeof raw === 'string') {
                        text = raw;
                    }
                    if (!text) {
                        return { id: request.id, jsonrpc: '2.0', result: { content: [{ type: 'text', text: JSON.stringify(raw) }] } };
                    }
                    let parsed = text;
                    try {
                        parsed = JSON.parse(text);
                    }
                    catch (e) {
                        parsed = text;
                    }
                    return {
                        id: request.id,
                        jsonrpc: '2.0',
                        result: {
                            content: [{ type: 'text', text: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2) }]
                        }
                    };
                }
                finally {
                    tokenSource.dispose();
                    s.DisabledTools = originalDisabledTools;
                    s.DisabledCommands = originalDisabledCommands;
                }
            }
            return { id: request.id, jsonrpc: '2.0', error: { message: `Method not found: ${request.method}`, code: -32601 } };
        }
        catch (error) {
            return { id: request.id, jsonrpc: '2.0', error: { message: error?.message || 'Internal error', code: -32603, data: error?.stack } };
        }
    }
}
exports.McpDispatcher = McpDispatcher;
//# sourceMappingURL=McpDispatcher.js.map