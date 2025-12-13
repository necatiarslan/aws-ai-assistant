import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  SFNClient,
  DescribeExecutionCommand,
  DescribeStateMachineCommand,
  ListExecutionsCommand,
  ListStateMachinesCommand,
  StartExecutionCommand,
  UpdateStateMachineCommand,
  DescribeExecutionCommandOutput,
  DescribeStateMachineCommandOutput,
  ListExecutionsCommandOutput,
  ListStateMachinesCommandOutput,
  StartExecutionCommandOutput,
  UpdateStateMachineCommandOutput
} from '@aws-sdk/client-sfn';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentSfClient: SFNClient | undefined;

// Command type definition
type StepFuncCommand =
  | 'DescribeExecution'
  | 'DescribeStateMachine'
  | 'ListExecutions'
  | 'ListStateMachines'
  | 'StartExecution'
  | 'UpdateStateMachine';

// Input interface - command + params object
interface StepFuncToolInput {
  command: StepFuncCommand;
  params: Record<string, any>;
}

// Command parameter interfaces for type safety
interface DescribeExecutionParams {
  executionArn: string;
}

interface DescribeStateMachineParams {
  stateMachineArn: string;
}

interface ListExecutionsParams {
  stateMachineArn?: string;
  maxResults?: number;
  nextToken?: string;
  statusFilter?: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED_OUT' | 'ABORTED';
}

interface ListStateMachinesParams {
  maxResults?: number;
  nextToken?: string;
}

interface StartExecutionParams {
  stateMachineArn: string;
  name?: string;
  input?: string | Record<string, any>;
  traceHeader?: string;
}

interface UpdateStateMachineParams {
  stateMachineArn: string;
  definition?: string;
  roleArn?: string;
  loggingConfiguration?: any;
  tracingConfiguration?: any;
  publish?: boolean;
  versionDescription?: string;
}

export class StepFuncTool implements vscode.LanguageModelTool<StepFuncToolInput> {
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`StepFuncTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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

      ui.logToOutput(`StepFuncTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('StepFuncTool: Failed to get credentials', error);
      throw error;
    }
  }

  /**
   * Get Step Functions client with session configuration
   */
  private async getClient(): Promise<SFNClient> {
    if (CurrentSfClient !== undefined) {
      return CurrentSfClient;
    }

    const credentials = await this.getCredentials();

    CurrentSfClient = new SFNClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`StepFuncTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentSfClient;
  }

  private async executeDescribeExecution(params: DescribeExecutionParams): Promise<DescribeExecutionCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeExecutionCommand(params);
    return await client.send(command);
  }

  private async executeDescribeStateMachine(params: DescribeStateMachineParams): Promise<DescribeStateMachineCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeStateMachineCommand(params);
    return await client.send(command);
  }

  private async executeListExecutions(params: ListExecutionsParams): Promise<ListExecutionsCommandOutput> {
    const client = await this.getClient();
    const command = new ListExecutionsCommand(params);
    return await client.send(command);
  }

  private async executeListStateMachines(params: ListStateMachinesParams): Promise<ListStateMachinesCommandOutput> {
    const client = await this.getClient();
    const command = new ListStateMachinesCommand(params);
    return await client.send(command);
  }

  private async executeStartExecution(params: StartExecutionParams): Promise<StartExecutionCommandOutput> {
    const client = await this.getClient();
    const commandParams: any = { ...params };

    // Convert input object to string if necessary
    if (commandParams.input && typeof commandParams.input !== 'string') {
      commandParams.input = JSON.stringify(commandParams.input);
    }

    const command = new StartExecutionCommand(commandParams);
    return await client.send(command);
  }

  private async executeUpdateStateMachine(params: UpdateStateMachineParams): Promise<UpdateStateMachineCommandOutput> {
    const client = await this.getClient();
    const command = new UpdateStateMachineCommand(params);
    return await client.send(command);
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: StepFuncCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`StepFuncTool: Executing command: ${command}`);
    ui.logToOutput(`StepFuncTool: Command parameters: ${JSON.stringify(params)}`);

    if("stateMachineArn" in params){
      AIHandler.Current.updateLatestResource({ type: 'Step Function State Machine', name: params.stateMachineArn });
    }

    switch (command) {
      case 'DescribeExecution':
        return await this.executeDescribeExecution(params as DescribeExecutionParams);
      case 'DescribeStateMachine':
        return await this.executeDescribeStateMachine(params as DescribeStateMachineParams);
      case 'ListExecutions':
        return await this.executeListExecutions(params as ListExecutionsParams);
      case 'ListStateMachines':
        return await this.executeListStateMachines(params as ListStateMachinesParams);
      case 'StartExecution':
        return await this.executeStartExecution(params as StartExecutionParams);
      case 'UpdateStateMachine':
        return await this.executeUpdateStateMachine(params as UpdateStateMachineParams);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<StepFuncToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`StepFuncTool: Executing ${command} with params: ${JSON.stringify(params)}`);

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

      ui.logToOutput(`StepFuncTool: ${command} completed successfully`);

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

      ui.logToOutput(`StepFuncTool: ${command} failed`, error);

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
