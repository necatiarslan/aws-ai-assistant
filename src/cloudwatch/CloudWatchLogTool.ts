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
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentCwClient: CloudWatchLogsClient | undefined;

// Command type definition
type CloudWatchCommand =
  | 'DescribeLogGroups'
  | 'DescribeLogStreams'
  | 'GetLogEvents';

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

export class CloudWatchLogTool implements vscode.LanguageModelTool<CloudWatchToolInput> {
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`CloudWatchLogTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    }

    if (Session.Current) {
      process.env.AWS_PROFILE = Session.Current.AwsProfile;
    }

    const provider = fromNodeProviderChain({ ignoreCache: true });
    CurrentCredentials = await provider();

    if (!CurrentCredentials) {
      throw new Error('AWS credentials not found');
    }

    ui.logToOutput(`CloudWatchLogTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
    return CurrentCredentials;
  }

  /**
   * Get CloudWatch Logs client with session configuration
   */
  private async getClient(): Promise<CloudWatchLogsClient> {
    if (CurrentCwClient !== undefined) {
      return CurrentCwClient;
    }

    const credentials = await this.getCredentials();

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
