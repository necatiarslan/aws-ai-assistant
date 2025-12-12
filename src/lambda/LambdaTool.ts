import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  LambdaClient,
  ListFunctionsCommand,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
  UpdateFunctionCodeCommand,
  ListTagsCommand,
  TagResourceCommand,
  UntagResourceCommand,
  InvokeCommand,
  ListFunctionsCommandOutput,
  GetFunctionCommandOutput,
  GetFunctionConfigurationCommandOutput,
  UpdateFunctionCodeCommandOutput,
  ListTagsCommandOutput,
  TagResourceCommandOutput,
  UntagResourceCommandOutput,
  InvokeCommandOutput
} from '@aws-sdk/client-lambda';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentLambdaClient: LambdaClient | undefined;

// Command type definition
type LambdaCommand =
  | 'ListFunctions'
  | 'GetFunction'
  | 'GetFunctionConfiguration'
  | 'UpdateFunctionCode'
  | 'ListTags'
  | 'TagResource'
  | 'UntagResource'
  | 'Invoke';

// Input interface - command + params object
interface LambdaToolInput {
  command: LambdaCommand;
  params: Record<string, any>;
}

// Command parameter interfaces for type safety
interface ListFunctionsParams {
  FunctionVersion?: 'ALL';
  Marker?: string;
  MaxItems?: number;
  MasterRegion?: string;
}

interface GetFunctionParams {
  FunctionName: string;
  Qualifier?: string;
}

interface GetFunctionConfigurationParams {
  FunctionName: string;
  Qualifier?: string;
}

interface UpdateFunctionCodeParams {
  FunctionName: string;
  ZipFile?: Uint8Array | string; // base64 encoded zip
  S3Bucket?: string;
  S3Key?: string;
  S3ObjectVersion?: string;
  ImageUri?: string;
  Publish?: boolean;
  DryRun?: boolean;
  RevisionId?: string;
  Architectures?: string[];
}

interface ListTagsParams {
  Resource: string; // Function ARN
}

interface TagResourceParams {
  Resource: string; // Function ARN
  Tags: Record<string, string>;
}

interface UntagResourceParams {
  Resource: string; // Function ARN
  TagKeys: string[];
}

interface InvokeParams {
  FunctionName: string;
  InvocationType?: 'Event' | 'RequestResponse' | 'DryRun';
  LogType?: 'None' | 'Tail';
  ClientContext?: string;
  Payload?: string; // JSON string
  Qualifier?: string;
}

export class LambdaTool implements vscode.LanguageModelTool<LambdaToolInput> {
  
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`LambdaTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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

      ui.logToOutput(`LambdaTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('LambdaTool: Failed to get credentials', error);
      throw error;
    }
  }

  /**
   * Get Lambda Client with session configuration
   */
  private async getLambdaClient(): Promise<LambdaClient> {
    if (CurrentLambdaClient !== undefined) {
      return CurrentLambdaClient;
    }

    const credentials = await this.getCredentials();

    CurrentLambdaClient = new LambdaClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`LambdaTool: Lambda client created (region=${Session.Current?.AwsRegion})`);
    return CurrentLambdaClient;
  }

  /**
   * Execute ListFunctions command
   */
  private async executeListFunctions(params: ListFunctionsParams): Promise<ListFunctionsCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new ListFunctionsCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetFunction command
   */
  private async executeGetFunction(params: GetFunctionParams): Promise<GetFunctionCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new GetFunctionCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetFunctionConfiguration command
   */
  private async executeGetFunctionConfiguration(params: GetFunctionConfigurationParams): Promise<GetFunctionConfigurationCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new GetFunctionConfigurationCommand(params);
    return await client.send(command);
  }

  /**
   * Execute UpdateFunctionCode command
   */
  private async executeUpdateFunctionCode(params: UpdateFunctionCodeParams): Promise<UpdateFunctionCodeCommandOutput> {
    const client = await this.getLambdaClient();
    
    // Convert base64 string to Uint8Array if ZipFile is provided as string
    const commandParams: any = { ...params };
    if (commandParams.ZipFile && typeof commandParams.ZipFile === 'string') {
      commandParams.ZipFile = Uint8Array.from(Buffer.from(commandParams.ZipFile, 'base64'));
    }
    
    const command = new UpdateFunctionCodeCommand(commandParams);
    return await client.send(command);
  }

  /**
   * Execute ListTags command
   */
  private async executeListTags(params: ListTagsParams): Promise<ListTagsCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new ListTagsCommand(params);
    return await client.send(command);
  }

  /**
   * Execute TagResource command
   */
  private async executeTagResource(params: TagResourceParams): Promise<TagResourceCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new TagResourceCommand(params);
    return await client.send(command);
  }

  /**
   * Execute UntagResource command
   */
  private async executeUntagResource(params: UntagResourceParams): Promise<UntagResourceCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new UntagResourceCommand(params);
    return await client.send(command);
  }

  /**
   * Execute Invoke command
   */
  private async executeInvoke(params: InvokeParams): Promise<InvokeCommandOutput> {
    const client = await this.getLambdaClient();
    const command = new InvokeCommand(params);
    const result = await client.send(command);
    
    // Decode the payload if present
    if (result.Payload) {
      const decoder = new TextDecoder();
      const payloadString = decoder.decode(result.Payload);
      return {
        ...result,
        Payload: payloadString as any // Return as string for easier consumption
      };
    }
    
    return result;
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: LambdaCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`LambdaTool: Executing command: ${command}`);
    ui.logToOutput(`LambdaTool: Command parameters: ${JSON.stringify(params)}`);

    switch (command) {
      case 'ListFunctions':
        return await this.executeListFunctions(params as ListFunctionsParams);
      
      case 'GetFunction':
        return await this.executeGetFunction(params as GetFunctionParams);
      
      case 'GetFunctionConfiguration':
        return await this.executeGetFunctionConfiguration(params as GetFunctionConfigurationParams);
      
      case 'UpdateFunctionCode':
        return await this.executeUpdateFunctionCode(params as UpdateFunctionCodeParams);
      
      case 'ListTags':
        return await this.executeListTags(params as ListTagsParams);
      
      case 'TagResource':
        return await this.executeTagResource(params as TagResourceParams);
      
      case 'UntagResource':
        return await this.executeUntagResource(params as UntagResourceParams);
      
      case 'Invoke':
        return await this.executeInvoke(params as InvokeParams);
      
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<LambdaToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`LambdaTool: Executing ${command} with params: ${JSON.stringify(params)}`);

      // Execute the command
      const result = await this.executeCommand(command, params);

      // Build success response
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

      ui.logToOutput(`LambdaTool: ${command} completed successfully`);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);

    } catch (error: any) {
      // Build error response
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

      ui.logToOutput(`LambdaTool: ${command} failed`, error);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
