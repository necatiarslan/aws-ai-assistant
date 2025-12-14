import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { MethodResult } from '../common/MethodResult';
import { Session } from '../common/Session';
import { 
  STSClient,
  GetCallerIdentityCommand,
  GetAccessKeyInfoCommand,
  GetDelegatedAccessTokenCommand,
  GetFederationTokenCommand,
  GetSessionTokenCommand,
  GetWebIdentityTokenCommand,
  GetCallerIdentityCommandOutput,
  GetAccessKeyInfoCommandOutput,
  GetDelegatedAccessTokenCommandOutput,
  GetFederationTokenCommandOutput,
  GetSessionTokenCommandOutput,
  GetWebIdentityTokenCommandOutput,
} from '@aws-sdk/client-sts';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentSTSClient: STSClient | undefined;

// Command type definition
type STSCommand = 
  | 'GetCallerIdentity'
  | 'GetAccessKeyInfo'
  | 'GetDelegatedAccessToken'
  | 'GetFederationToken'
  | 'GetSessionToken'
  | 'GetWebIdentityToken';

// Input interface - command + params object
interface STSToolInput {
  command: STSCommand;
  params: Record<string, any>;
}

// Command parameter interfaces for type safety
interface GetCallerIdentityParams {
  // GetCallerIdentity has no required parameters
}

interface GetAccessKeyInfoParams {
  AccessKeyId: string;
}

interface GetDelegatedAccessTokenParams {
  TradeInToken: string;
  DelegationTokenLifetimeSeconds?: number;
}

interface GetFederationTokenParams {
  Name: string;
  DurationSeconds?: number;
  Policy?: string;
  Tags?: Array<{ Key: string; Value: string }>;
  PolicyDescriptors?: Array<{ arn?: string }>;
}

interface GetSessionTokenParams {
  DurationSeconds?: number;
  SerialNumber?: string;
  TokenCode?: string;
}

interface GetWebIdentityTokenParams {
  RoleArn: string;
  RoleSessionName: string;
  WebIdentityToken: string;
  Audience: string[];
  SigningAlgorithm: string;
  DurationSeconds?: number;
  ProviderId?: string;
}

export class STSTool implements vscode.LanguageModelTool<STSToolInput> {
  
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`STSTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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

      ui.logToOutput(`STSTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('STSTool: Failed to get credentials', error);
      throw error;
    }
  }

  /**
   * Get STS Client with session configuration
   */
  private async getSTSClient(): Promise<STSClient> {
    if (CurrentSTSClient !== undefined) {
      return CurrentSTSClient;
    }

    const credentials = await this.getCredentials();

    CurrentSTSClient = new STSClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`STSTool: STS client created (region=${Session.Current?.AwsRegion})`);
    return CurrentSTSClient;
  }

  /**
   * Execute GetCallerIdentity command
   */
  private async executeGetCallerIdentity(params: GetCallerIdentityParams): Promise<GetCallerIdentityCommandOutput> {
    const client = await this.getSTSClient();
    const command = new GetCallerIdentityCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetAccessKeyInfo command
   */
  private async executeGetAccessKeyInfo(params: GetAccessKeyInfoParams): Promise<GetAccessKeyInfoCommandOutput> {
    const client = await this.getSTSClient();
    const command = new GetAccessKeyInfoCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetDelegatedAccessToken command
   */
  private async executeGetDelegatedAccessToken(params: GetDelegatedAccessTokenParams): Promise<GetDelegatedAccessTokenCommandOutput> {
    const client = await this.getSTSClient();
    const command = new GetDelegatedAccessTokenCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetFederationToken command
   */
  private async executeGetFederationToken(params: GetFederationTokenParams): Promise<GetFederationTokenCommandOutput> {
    const client = await this.getSTSClient();
    const command = new GetFederationTokenCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetSessionToken command
   */
  private async executeGetSessionToken(params: GetSessionTokenParams): Promise<GetSessionTokenCommandOutput> {
    const client = await this.getSTSClient();
    const command = new GetSessionTokenCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetWebIdentityToken command
   */
  private async executeGetWebIdentityToken(params: GetWebIdentityTokenParams): Promise<GetWebIdentityTokenCommandOutput> {
    const client = await this.getSTSClient();
    const command = new GetWebIdentityTokenCommand(params);
    return await client.send(command);
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: STSCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`STSTool: Executing command: ${command}`);
    ui.logToOutput(`STSTool: Command parameters: ${JSON.stringify(params)}`);

    if ("RoleArn" in params) {
      AIHandler.Current.updateLatestResource({ type: "IAM Role", name: params.RoleArn });
    }

    switch (command) {
      case 'GetCallerIdentity':
        return await this.executeGetCallerIdentity(params as GetCallerIdentityParams);
      
      case 'GetAccessKeyInfo':
        return await this.executeGetAccessKeyInfo(params as GetAccessKeyInfoParams);
      
      case 'GetDelegatedAccessToken':
        return await this.executeGetDelegatedAccessToken(params as GetDelegatedAccessTokenParams);
      
      case 'GetFederationToken':
        return await this.executeGetFederationToken(params as GetFederationTokenParams);
      
      case 'GetSessionToken':
        return await this.executeGetSessionToken(params as GetSessionTokenParams);
      
      case 'GetWebIdentityToken':
        return await this.executeGetWebIdentityToken(params as GetWebIdentityTokenParams);
      
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<STSToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`STSTool: Executing ${command} with params: ${JSON.stringify(params)}`);

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

      ui.logToOutput(`STSTool: ${command} completed successfully`);
      
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

      ui.logToOutput(`STSTool: ${command} failed`, error);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
