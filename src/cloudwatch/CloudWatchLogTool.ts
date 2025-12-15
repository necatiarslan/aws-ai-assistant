import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  GetLogEventsCommand,
  DescribeLogGroupsCommandOutput,
  DescribeLogStreamsCommandOutput,
  GetLogEventsCommandOutput
} from '@aws-sdk/client-cloudwatch-logs';
import { AIHandler } from '../chat/AIHandler';
import { CloudWatchLogView } from './CloudWatchLogView';

// Cached client
let CurrentCwClient: CloudWatchLogsClient | undefined;

// Command type definition
type CloudWatchCommand =
  | 'DescribeLogGroups'
  | 'DescribeLogStreams'
  | 'GetLogEvents'
  | 'OpenCloudWatchLogView';

// Input interface - command + params object
interface CloudWatchToolInput {
  command: CloudWatchCommand;
  params: Record<string, any>;
}

// Parameter interfaces
interface DescribeLogGroupsParams {
  logGroupNamePrefix?: string;
  limit?: number;
  nextToken?: string;
}

interface DescribeLogStreamsParams {
  logGroupName: string;
  logStreamNamePrefix?: string;
  orderBy?: 'LogStreamName' | 'LastEventTime';
  descending?: boolean;
  limit?: number;
  nextToken?: string;
}

interface GetLogEventsParams {
  logGroupName: string;
  logStreamName: string;
  startTime?: number; // millis
  endTime?: number;   // millis
  nextToken?: string;
  limit?: number;
  startFromHead?: boolean;
}

interface OpenCloudWatchLogViewParams {
  logGroupName: string;
  logStreamName?: string; // Optional log stream name
}

export class CloudWatchLogTool implements vscode.LanguageModelTool<CloudWatchToolInput> {
  /**
   * Execute OpenCloudWatchLogView command - Opens CloudWatchLogView
   */
  private async executeOpenCloudWatchLogView(params: OpenCloudWatchLogViewParams): Promise<any> {
    if (!Session.Current) {
      throw new Error('Session not initialized');
    }

    // Open the CloudWatchLogView
    CloudWatchLogView.Render(Session.Current.ExtensionUri, Session.Current.AwsRegion, params.logGroupName, params.logStreamName || '');

    return {
      success: true,
      message: `CloudWatch Log View opened for log group: ${params.logGroupName}${params.logStreamName ? `, log stream: ${params.logStreamName}` : ''}`,
      logGroupName: params.logGroupName,
      logStreamName: params.logStreamName
    };
  }

  /**
   * Get CloudWatch Logs client with session configuration
   */
  private async getClient(): Promise<CloudWatchLogsClient> {
    if (CurrentCwClient !== undefined) {
      return CurrentCwClient;
    }

    const credentials = await Session.Current?.GetCredentials();

    CurrentCwClient = new CloudWatchLogsClient({
      credentials,
      region: Session.Current?.AwsRegion,
      endpoint: Session.Current?.AwsEndPoint,
    });

    ui.logToOutput(`CloudWatchLogTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentCwClient;
  }

  private async describeLogGroups(params: DescribeLogGroupsParams): Promise<DescribeLogGroupsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeLogGroupsCommand(params);
    return await client.send(command);
  }

  private async describeLogStreams(params: DescribeLogStreamsParams): Promise<DescribeLogStreamsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeLogStreamsCommand(params);
    return await client.send(command);
  }

  private async getLogEvents(params: GetLogEventsParams): Promise<GetLogEventsCommandOutput> {
    const client = await this.getClient();
    const command = new GetLogEventsCommand(params);
    return await client.send(command);
  }

  private async dispatch(command: CloudWatchCommand, params: Record<string, any>): Promise<any> {
    switch (command) {
      case 'DescribeLogGroups':
        return await this.describeLogGroups(params as DescribeLogGroupsParams);
      case 'DescribeLogStreams':
        return await this.describeLogStreams(params as DescribeLogStreamsParams);
      case 'GetLogEvents':
        return await this.getLogEvents(params as GetLogEventsParams);
      case 'OpenCloudWatchLogView':
        return await this.executeOpenCloudWatchLogView(params as OpenCloudWatchLogViewParams);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<CloudWatchToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`CloudWatchLogTool: Executing ${command} with params: ${JSON.stringify(params)}`);

      if ("logGroupName" in params) {
        AIHandler.Current.updateLatestResource({ type: "CloudWatch Log Group", name: params.logGroupName });
      }
      if ("logStreamName" in params) {
        AIHandler.Current.updateLatestResource({ type: "CloudWatch Log Stream", name: params.logStreamName });
      }

      const result = await this.dispatch(command, params);

      const response = {
        success: true,
        command,
        message: `${command} executed successfully`,
        data: result,
        metadata: {
          requestId: result.$metadata?.requestId,
          httpStatusCode: result.$metadata?.httpStatusCode,
        }
      };

      ui.logToOutput(`CloudWatchLogTool: ${command} completed successfully`);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errorResponse = {
        success: false,
        command,
        message: `Failed to execute ${command}`,
        error: {
          name: error?.name || 'Error',
          message: error?.message || 'Unknown error',
          code: error?.Code || error?.$metadata?.httpStatusCode,
        }
      };

      ui.logToOutput(`CloudWatchLogTool: ${command} failed`, error instanceof Error ? error : undefined);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
