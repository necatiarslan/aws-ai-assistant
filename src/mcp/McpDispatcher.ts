import * as vscode from 'vscode';
import { BaseTool } from '../common/BaseTool';
import { Session } from '../common/Session';
import { McpRequest, McpResponse } from './types';
import { S3Tool } from '../s3/S3Tool';
import { SNSTool } from '../sns/SNSTool';
import { SQSTool } from '../sqs/SQSTool';
import { EC2Tool } from '../ec2/EC2Tool';
import { FileOperationsTool } from '../common/FileOperationsTool';
import { SessionTool } from '../common/SessionTool';
import { CloudWatchLogTool } from '../cloudwatch/CloudWatchLogTool';
import { LambdaTool } from '../lambda/LambdaTool';
import { StepFuncTool } from '../stepfunc/StepFuncTool';
import { GlueTool } from '../glue/GlueTool';
import { IAMTool } from '../iam/IAMTool';
import { DynamoDBTool } from '../dynamodb/DynamoDBTool';
import { APIGatewayTool } from '../apigateway/APIGatewayTool';
import { RDSTool } from '../rds/RDSTool';
import { RDSDataTool } from '../rdsdata/RDSDataTool';
import { CloudFormationTool } from '../cloudformation/CloudFormationTool';
import { EMRTool } from '../emr/EMRTool';
import { STSTool } from '../sts/STSTool';
import { TestAwsConnectionTool } from '../sts/TestAwsConnectionTool';
import { needsConfirmation, confirmProceed } from '../common/ActionGuard';

interface ToolRecord {
    name: string;
    instance: BaseTool<any>;
}

export class McpDispatcher {
    private readonly tools: Map<string, ToolRecord>;

    constructor(enabledTools: Set<string>) {
        this.tools = new Map<string, ToolRecord>();
        const allTools: ToolRecord[] = [
            { name: 'TestAwsConnectionTool', instance: new TestAwsConnectionTool() as BaseTool<any> },
            { name: 'STSTool', instance: new STSTool() as BaseTool<any> },
            { name: 'S3Tool', instance: new S3Tool() as BaseTool<any> },
            { name: 'SNSTool', instance: new SNSTool() as BaseTool<any> },
            { name: 'SQSTool', instance: new SQSTool() as BaseTool<any> },
            { name: 'EC2Tool', instance: new EC2Tool() as BaseTool<any> },
            { name: 'FileOperationsTool', instance: new FileOperationsTool() as BaseTool<any> },
            { name: 'SessionTool', instance: new SessionTool() as BaseTool<any> },
            { name: 'CloudWatchLogTool', instance: new CloudWatchLogTool() as BaseTool<any> },
            { name: 'LambdaTool', instance: new LambdaTool() as BaseTool<any> },
            { name: 'StepFuncTool', instance: new StepFuncTool() as BaseTool<any> },
            { name: 'GlueTool', instance: new GlueTool() as BaseTool<any> },
            { name: 'IAMTool', instance: new IAMTool() as BaseTool<any> },
            { name: 'DynamoDBTool', instance: new DynamoDBTool() as BaseTool<any> },
            { name: 'APIGatewayTool', instance: new APIGatewayTool() as BaseTool<any> },
            { name: 'RDSTool', instance: new RDSTool() as BaseTool<any> },
            { name: 'RDSDataTool', instance: new RDSDataTool() as BaseTool<any> },
            { name: 'CloudFormationTool', instance: new CloudFormationTool() as BaseTool<any> },
            { name: 'EMRTool', instance: new EMRTool() as BaseTool<any> }
        ];

        for (const t of allTools) {
            if (enabledTools.has(t.name)) {
                this.tools.set(t.name, t);
            }
        }
    }

    public listTools(): string[] {
        return Array.from(this.tools.keys());
    }

    public async handle(request: McpRequest): Promise<McpResponse> {
        try {
            if (request.method === 'list_tools') {
                return { id: request.id, result: { tools: this.listTools() } };
            }

            if (request.method === 'call_tool') {
                const toolName = request.params?.tool as string;
                const command = request.params?.command as string;
                const params = (request.params?.params as Record<string, any>) || {};

                if (!toolName || !command) {
                    return { id: request.id, error: { message: 'tool and command are required', code: 400 } };
                }

                const tool = this.tools.get(toolName);
                if (!tool) {
                    return { id: request.id, error: { message: `Tool ${toolName} is not enabled for MCP`, code: 404 } };
                }

                if (!Session.Current) {
                    return { id: request.id, error: { message: 'Session not initialized', code: 500 } };
                }

                if (needsConfirmation(command)) {
                    const ok = await confirmProceed(command);
                    if (!ok) {
                        return { id: request.id, error: { message: 'User cancelled action command', code: 499 } };
                    }
                }

                const s = Session.Current;
                const originalDisabledTools = s.DisabledTools;
                const originalDisabledCommands = s.DisabledCommands;

                s.DisabledTools = new Set();
                s.DisabledCommands = new Map();

                try {
                    const result = await tool.instance.invoke({
                        input: { command, params }
                    } as any, new vscode.CancellationTokenSource().token);

                    const raw = (result as any).output ?? (result as any).content ?? result;
                    const content = Array.isArray(raw?.content) ? raw.content : Array.isArray(raw) ? raw : undefined;
                    let text: string | undefined;
                    if (content && content.length > 0) {
                        text = content.map((c: any) => c.value ?? c.text ?? '').join('');
                    } else if (typeof raw === 'string') {
                        text = raw;
                    }

                    if (!text) {
                        return { id: request.id, result: raw };
                    }

                    let parsed: any = text;
                    try {
                        parsed = JSON.parse(text);
                    } catch (e) {
                        parsed = text;
                    }

                    return { id: request.id, result: parsed };
                } finally {
                    s.DisabledTools = originalDisabledTools;
                    s.DisabledCommands = originalDisabledCommands;
                }
            }

            return { id: request.id, error: { message: `Unknown method ${request.method}`, code: 404 } };
        } catch (error: any) {
            return { id: request.id, error: { message: error?.message || 'Unexpected error', code: 500, data: error?.stack } };
        }
    }
}
