import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  GlueClient,
  CreateJobCommand,
  GetJobCommand,
  GetJobRunCommand,
  GetJobRunsCommand,
  GetTagsCommand,
  GetTriggerCommand,
  GetTriggersCommand,
  ListJobsCommand,
  ListTriggersCommand,
  StartJobRunCommand,
  CreateJobCommandOutput,
  GetJobCommandOutput,
  GetJobRunCommandOutput,
  GetJobRunsCommandOutput,
  GetTagsCommandOutput,
  GetTriggerCommandOutput,
  GetTriggersCommandOutput,
  ListJobsCommandOutput,
  ListTriggersCommandOutput,
  StartJobRunCommandOutput
} from '@aws-sdk/client-glue';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentGlueClient: GlueClient | undefined;

// Command type definition
type GlueCommand =
  | 'CreateJob'
  | 'GetJob'
  | 'GetJobRun'
  | 'GetJobRuns'
  | 'GetTags'
  | 'GetTrigger'
  | 'GetTriggers'
  | 'ListJobs'
  | 'ListTriggers'
  | 'StartJobRun';

// Input interface - command + params object
interface GlueToolInput {
  command: GlueCommand;
  params: Record<string, any>;
}

// Command parameter interfaces for type safety
interface CreateJobParams {
  Name: string;
  Role: string;
  Command: any;
  Description?: string;
  LogUri?: string;
  DefaultArguments?: Record<string, string>;
  Connections?: any;
  MaxRetries?: number;
  Timeout?: number;
  MaxCapacity?: number;
  WorkerType?: 'Standard' | 'G.1X' | 'G.2X' | 'G.025X';
  NumberOfWorkers?: number;
  Tags?: Record<string, string>;
}

interface GetJobParams {
  JobName: string;
}

interface GetJobRunParams {
  JobName: string;
  RunId: string;
}

interface GetJobRunsParams {
  JobName: string;
  nextToken?: string;
  MaxResults?: number;
}

interface GetTagsParams {
  ResourceArn: string;
}

interface GetTriggerParams {
  Name: string;
}

interface GetTriggersParams {
  nextToken?: string;
  MaxResults?: number;
  DependencyJobName?: string;
}

interface ListJobsParams {
  nextToken?: string;
  MaxResults?: number;
}

interface ListTriggersParams {
  nextToken?: string;
  MaxResults?: number;
  DependentJobName?: string;
}

interface StartJobRunParams {
  JobName: string;
  JobRunId?: string;
  Arguments?: Record<string, string>;
  AllocatedCapacity?: number;
  MaxCapacity?: number;
  Timeout?: number;
  SecurityConfiguration?: string;
}

export class GlueTool implements vscode.LanguageModelTool<GlueToolInput> {
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`GlueTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    }

    try {
      if (Session.Current) {
        process.env.AWS_PROFILE = Session.Current.AwsProfile;
      }

      const provider = fromNodeProviderChain({ ignoreCache: true });
      CurrentCredentials = await provider();

      if (!CurrentCredentials) {
        throw new Error('AWS credentials not found');
      }

      ui.logToOutput(`GlueTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('GlueTool: Failed to get credentials', error);
      throw error;
    }
  }

  /**
   * Get Glue client with session configuration
   */
  private async getClient(): Promise<GlueClient> {
    if (CurrentGlueClient !== undefined) {
      return CurrentGlueClient;
    }

    const credentials = await this.getCredentials();

    CurrentGlueClient = new GlueClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`GlueTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentGlueClient;
  }

  private async executeCreateJob(params: CreateJobParams): Promise<CreateJobCommandOutput> {
    const client = await this.getClient();
    const command = new CreateJobCommand(params);
    return await client.send(command);
  }

  private async executeGetJob(params: GetJobParams): Promise<GetJobCommandOutput> {
    const client = await this.getClient();
    const command = new GetJobCommand(params);
    return await client.send(command);
  }

  private async executeGetJobRun(params: GetJobRunParams): Promise<GetJobRunCommandOutput> {
    const client = await this.getClient();
    const command = new GetJobRunCommand(params);
    return await client.send(command);
  }

  private async executeGetJobRuns(params: GetJobRunsParams): Promise<GetJobRunsCommandOutput> {
    const client = await this.getClient();
    const command = new GetJobRunsCommand(params);
    return await client.send(command);
  }

  private async executeGetTags(params: GetTagsParams): Promise<GetTagsCommandOutput> {
    const client = await this.getClient();
    const command = new GetTagsCommand(params);
    return await client.send(command);
  }

  private async executeGetTrigger(params: GetTriggerParams): Promise<GetTriggerCommandOutput> {
    const client = await this.getClient();
    const command = new GetTriggerCommand(params);
    return await client.send(command);
  }

  private async executeGetTriggers(params: GetTriggersParams): Promise<GetTriggersCommandOutput> {
    const client = await this.getClient();
    const command = new GetTriggersCommand(params);
    return await client.send(command);
  }

  private async executeListJobs(params: ListJobsParams): Promise<ListJobsCommandOutput> {
    const client = await this.getClient();
    const command = new ListJobsCommand(params);
    return await client.send(command);
  }

  private async executeListTriggers(params: ListTriggersParams): Promise<ListTriggersCommandOutput> {
    const client = await this.getClient();
    const command = new ListTriggersCommand(params);
    return await client.send(command);
  }

  private async executeStartJobRun(params: StartJobRunParams): Promise<StartJobRunCommandOutput> {
    const client = await this.getClient();
    const command = new StartJobRunCommand(params);
    return await client.send(command);
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: GlueCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`GlueTool: Executing command: ${command}`);
    ui.logToOutput(`GlueTool: Command parameters: ${JSON.stringify(params)}`);

    if("JobName" in params) {
      AIHandler.Current.updateLatestResource({ type: "Glue Job", name: params["JobName"] });
    }

    switch (command) {
      case 'CreateJob':
        return await this.executeCreateJob(params as CreateJobParams);
      case 'GetJob':
        return await this.executeGetJob(params as GetJobParams);
      case 'GetJobRun':
        return await this.executeGetJobRun(params as GetJobRunParams);
      case 'GetJobRuns':
        return await this.executeGetJobRuns(params as GetJobRunsParams);
      case 'GetTags':
        return await this.executeGetTags(params as GetTagsParams);
      case 'GetTrigger':
        return await this.executeGetTrigger(params as GetTriggerParams);
      case 'GetTriggers':
        return await this.executeGetTriggers(params as GetTriggersParams);
      case 'ListJobs':
        return await this.executeListJobs(params as ListJobsParams);
      case 'ListTriggers':
        return await this.executeListTriggers(params as ListTriggersParams);
      case 'StartJobRun':
        return await this.executeStartJobRun(params as StartJobRunParams);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<GlueToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`GlueTool: Executing ${command} with params: ${JSON.stringify(params)}`);
      
      const result = await this.executeCommand(command, params);

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

      ui.logToOutput(`GlueTool: ${command} completed successfully`);

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errorResponse = {
        success: false,
        command,
        message: `Failed to execute ${command}`,
        error: {
          name: error.name || 'Error',
          message: error.message || 'Unknown error',
          code: error.Code || error.$metadata?.httpStatusCode,
        }
      };

      ui.logToOutput(`GlueTool: ${command} failed`, error);

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
