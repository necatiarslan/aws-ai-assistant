import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  RDSDataClient,
  BatchExecuteStatementCommand,
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RollbackTransactionCommand,
  BatchExecuteStatementCommandOutput,
  BeginTransactionCommandOutput,
  CommitTransactionCommandOutput,
  ExecuteStatementCommandOutput,
  RollbackTransactionCommandOutput
} from '@aws-sdk/client-rds-data';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentClient: RDSDataClient | undefined;

type RDSDataCommand =
  | 'BatchExecuteStatement'
  | 'BeginTransaction'
  | 'CommitTransaction'
  | 'ExecuteStatement'
  | 'RollbackTransaction';

interface RDSDataToolInput {
  command: RDSDataCommand;
  params: Record<string, any>;
}

export class RDSDataTool implements vscode.LanguageModelTool<RDSDataToolInput> {
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials) {
      ui.logToOutput(`RDSDataTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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
      ui.logToOutput(`RDSDataTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('RDSDataTool: Failed to get credentials', error);
      throw error;
    }
  }

  private async getClient(): Promise<RDSDataClient> {
    if (CurrentClient) {
      return CurrentClient;
    }
    const credentials = await this.getCredentials();
    CurrentClient = new RDSDataClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });
    ui.logToOutput(`RDSDataTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentClient;
  }

  private async send<COut>(ctor: new (input: any) => {}, params: Record<string, any>): Promise<any> {
    const client = await this.getClient();
    const command = new (ctor as any)(params as any);
    return await (client as any).send(command);
  }

  private async executeCommand(command: RDSDataCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`RDSDataTool: Executing command: ${command}`);
    ui.logToOutput(`RDSDataTool: Command parameters: ${JSON.stringify(params)}`);

    if (params?.database) {
      AIHandler.Current.updateLatestResource({ type: 'RDS Data database', name: params.database });
    }

    switch (command) {
      case 'BatchExecuteStatement': return await this.send<BatchExecuteStatementCommandOutput>(BatchExecuteStatementCommand, params);
      case 'BeginTransaction': return await this.send<BeginTransactionCommandOutput>(BeginTransactionCommand, params);
      case 'CommitTransaction': return await this.send<CommitTransactionCommandOutput>(CommitTransactionCommand, params);
      case 'ExecuteStatement': return await this.send<ExecuteStatementCommandOutput>(ExecuteStatementCommand, params);
      case 'RollbackTransaction': return await this.send<RollbackTransactionCommandOutput>(RollbackTransactionCommand, params);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<RDSDataToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;
    try {
      ui.logToOutput(`RDSDataTool: Executing ${command} with params: ${JSON.stringify(params)}`);
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
      ui.logToOutput(`RDSDataTool: ${command} completed successfully`);
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
      ui.logToOutput(`RDSDataTool: ${command} failed`, error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
