import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  DynamoDBClient,
  ListTablesCommand,
  DescribeTableCommand,
  CreateTableCommand,
  DeleteTableCommand,
  QueryCommand,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  GetItemCommand,
  UpdateTableCommand,
  UpdateTimeToLiveCommand,
  ListTagsOfResourceCommand,
  ListTablesCommandInput,
  DescribeTableCommandInput,
  CreateTableCommandInput,
  DeleteTableCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  PutItemCommandInput,
  UpdateItemCommandInput,
  DeleteItemCommandInput,
  GetItemCommandInput,
  UpdateTableCommandInput,
  UpdateTimeToLiveCommandInput,
  ListTagsOfResourceCommandInput,
  ListTablesCommandOutput,
  DescribeTableCommandOutput,
  CreateTableCommandOutput,
  DeleteTableCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
  PutItemCommandOutput,
  UpdateItemCommandOutput,
  DeleteItemCommandOutput,
  GetItemCommandOutput,
  UpdateTableCommandOutput,
  UpdateTimeToLiveCommandOutput,
  ListTagsOfResourceCommandOutput
} from '@aws-sdk/client-dynamodb';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentDdbClient: DynamoDBClient | undefined;

// Command type definition
type DynamoDBCommand =
  | 'ListTables'
  | 'DescribeTable'
  | 'CreateTable'
  | 'DeleteTable'
  | 'Query'
  | 'Scan'
  | 'PutItem'
  | 'UpdateItem'
  | 'DeleteItem'
  | 'GetItem'
  | 'UpdateTable'
  | 'UpdateTimeToLive'
  | 'ListTagsOfResource';

// Input interface - command + params object
interface DynamoDBToolInput {
  command: DynamoDBCommand;
  params: Record<string, any>;
}

export class DynamoDBTool implements vscode.LanguageModelTool<DynamoDBToolInput> {
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`DynamoDBTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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

    ui.logToOutput(`DynamoDBTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
    return CurrentCredentials;
  }

  /**
   * Get DynamoDB client with session configuration
   */
  private async getClient(): Promise<DynamoDBClient> {
    if (CurrentDdbClient !== undefined) {
      return CurrentDdbClient;
    }

    const credentials = await this.getCredentials();

    CurrentDdbClient = new DynamoDBClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`DynamoDBTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentDdbClient;
  }

  private async executeListTables(params: ListTablesCommandInput): Promise<ListTablesCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListTablesCommand(params));
  }

  private async executeDescribeTable(params: DescribeTableCommandInput): Promise<DescribeTableCommandOutput> {
    const client = await this.getClient();
    return await client.send(new DescribeTableCommand(params));
  }

  private async executeCreateTable(params: CreateTableCommandInput): Promise<CreateTableCommandOutput> {
    const client = await this.getClient();
    return await client.send(new CreateTableCommand(params));
  }

  private async executeDeleteTable(params: DeleteTableCommandInput): Promise<DeleteTableCommandOutput> {
    const client = await this.getClient();
    return await client.send(new DeleteTableCommand(params));
  }

  private async executeQuery(params: QueryCommandInput): Promise<QueryCommandOutput> {
    const client = await this.getClient();
    return await client.send(new QueryCommand(params));
  }

  private async executeScan(params: ScanCommandInput): Promise<ScanCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ScanCommand(params));
  }

  private async executePutItem(params: PutItemCommandInput): Promise<PutItemCommandOutput> {
    const client = await this.getClient();
    return await client.send(new PutItemCommand(params));
  }

  private async executeUpdateItem(params: UpdateItemCommandInput): Promise<UpdateItemCommandOutput> {
    const client = await this.getClient();
    return await client.send(new UpdateItemCommand(params));
  }

  private async executeDeleteItem(params: DeleteItemCommandInput): Promise<DeleteItemCommandOutput> {
    const client = await this.getClient();
    return await client.send(new DeleteItemCommand(params));
  }

  private async executeGetItem(params: GetItemCommandInput): Promise<GetItemCommandOutput> {
    const client = await this.getClient();
    return await client.send(new GetItemCommand(params));
  }

  private async executeUpdateTable(params: UpdateTableCommandInput): Promise<UpdateTableCommandOutput> {
    const client = await this.getClient();
    return await client.send(new UpdateTableCommand(params));
  }

  private async executeUpdateTimeToLive(params: UpdateTimeToLiveCommandInput): Promise<UpdateTimeToLiveCommandOutput> {
    const client = await this.getClient();
    return await client.send(new UpdateTimeToLiveCommand(params));
  }

  private async executeListTagsOfResource(params: ListTagsOfResourceCommandInput): Promise<ListTagsOfResourceCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListTagsOfResourceCommand(params));
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: DynamoDBCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`DynamoDBTool: Executing command: ${command}`);
    ui.logToOutput(`DynamoDBTool: Command parameters: ${JSON.stringify(params)}`);

    switch (command) {
      case 'ListTables':
        return await this.executeListTables(params as ListTablesCommandInput);
      case 'DescribeTable':
        return await this.executeDescribeTable(params as DescribeTableCommandInput);
      case 'CreateTable':
        return await this.executeCreateTable(params as CreateTableCommandInput);
      case 'DeleteTable':
        return await this.executeDeleteTable(params as DeleteTableCommandInput);
      case 'Query':
        return await this.executeQuery(params as QueryCommandInput);
      case 'Scan':
        return await this.executeScan(params as ScanCommandInput);
      case 'PutItem':
        return await this.executePutItem(params as PutItemCommandInput);
      case 'UpdateItem':
        return await this.executeUpdateItem(params as UpdateItemCommandInput);
      case 'DeleteItem':
        return await this.executeDeleteItem(params as DeleteItemCommandInput);
      case 'GetItem':
        return await this.executeGetItem(params as GetItemCommandInput);
      case 'UpdateTable':
        return await this.executeUpdateTable(params as UpdateTableCommandInput);
      case 'UpdateTimeToLive':
        return await this.executeUpdateTimeToLive(params as UpdateTimeToLiveCommandInput);
      case 'ListTagsOfResource':
        return await this.executeListTagsOfResource(params as ListTagsOfResourceCommandInput);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<DynamoDBToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`DynamoDBTool: Executing ${command} with params: ${JSON.stringify(params)}`);

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

      ui.logToOutput(`DynamoDBTool: ${command} completed successfully`);

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

      ui.logToOutput(`DynamoDBTool: ${command} failed`, error);

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
