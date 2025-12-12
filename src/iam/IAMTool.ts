import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  IAMClient,
  GetRoleCommand,
  GetRolePolicyCommand,
  ListAttachedRolePoliciesCommand,
  ListRolePoliciesCommand,
  ListRolesCommand,
  ListRoleTagsCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  ListPoliciesCommand,
  ListPolicyVersionsCommand,
  GetRoleCommandOutput,
  GetRolePolicyCommandOutput,
  ListAttachedRolePoliciesCommandOutput,
  ListRolePoliciesCommandOutput,
  ListRolesCommandOutput,
  ListRoleTagsCommandOutput,
  GetPolicyCommandOutput,
  GetPolicyVersionCommandOutput,
  ListPoliciesCommandOutput,
  ListPolicyVersionsCommandOutput
} from '@aws-sdk/client-iam';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentIamClient: IAMClient | undefined;

// Command type definition
type IAMCommand =
  | 'GetRole'
  | 'GetRolePolicy'
  | 'ListAttachedRolePolicies'
  | 'ListRolePolicies'
  | 'ListRoles'
  | 'ListRoleTags'
  | 'GetPolicy'
  | 'GetPolicyVersion'
  | 'ListPolicies'
  | 'ListPolicyVersions';

// Input interface - command + params object
interface IAMToolInput {
  command: IAMCommand;
  params: Record<string, any>;
}

// Command parameter interfaces
interface GetRoleParams {
  RoleName: string;
}

interface GetRolePolicyParams {
  RoleName: string;
  PolicyName: string;
}

interface ListAttachedRolePoliciesParams {
  RoleName: string;
  PathPrefix?: string;
  Marker?: string;
  MaxItems?: number;
}

interface ListRolePoliciesParams {
  RoleName: string;
  Marker?: string;
  MaxItems?: number;
}

interface ListRolesParams {
  PathPrefix?: string;
  Marker?: string;
  MaxItems?: number;
}

interface ListRoleTagsParams {
  RoleName: string;
  Marker?: string;
  MaxItems?: number;
}

interface GetPolicyParams {
  PolicyArn: string;
}

interface GetPolicyVersionParams {
  PolicyArn: string;
  VersionId: string;
}

interface ListPoliciesParams {
  Scope?: 'All' | 'AWS' | 'Local';
  OnlyAttached?: boolean;
  PathPrefix?: string;
  Marker?: string;
  MaxItems?: number;
  PolicyUsageFilter?: 'PermissionsPolicy' | 'PermissionsBoundary';
}

interface ListPolicyVersionsParams {
  PolicyArn: string;
  Marker?: string;
  MaxItems?: number;
}

export class IAMTool implements vscode.LanguageModelTool<IAMToolInput> {
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`IAMTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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

    ui.logToOutput(`IAMTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
    return CurrentCredentials;
  }

  /**
   * Get IAM client with session configuration
   */
  private async getClient(): Promise<IAMClient> {
    if (CurrentIamClient !== undefined) {
      return CurrentIamClient;
    }

    const credentials = await this.getCredentials();

    CurrentIamClient = new IAMClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`IAMTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentIamClient;
  }

  private async executeGetRole(params: GetRoleParams): Promise<GetRoleCommandOutput> {
    const client = await this.getClient();
    return await client.send(new GetRoleCommand(params));
  }

  private async executeGetRolePolicy(params: GetRolePolicyParams): Promise<GetRolePolicyCommandOutput> {
    const client = await this.getClient();
    return await client.send(new GetRolePolicyCommand(params));
  }

  private async executeListAttachedRolePolicies(params: ListAttachedRolePoliciesParams): Promise<ListAttachedRolePoliciesCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListAttachedRolePoliciesCommand(params));
  }

  private async executeListRolePolicies(params: ListRolePoliciesParams): Promise<ListRolePoliciesCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListRolePoliciesCommand(params));
  }

  private async executeListRoles(params: ListRolesParams): Promise<ListRolesCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListRolesCommand(params));
  }

  private async executeListRoleTags(params: ListRoleTagsParams): Promise<ListRoleTagsCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListRoleTagsCommand(params));
  }

  private async executeGetPolicy(params: GetPolicyParams): Promise<GetPolicyCommandOutput> {
    const client = await this.getClient();
    return await client.send(new GetPolicyCommand(params));
  }

  private async executeGetPolicyVersion(params: GetPolicyVersionParams): Promise<GetPolicyVersionCommandOutput> {
    const client = await this.getClient();
    return await client.send(new GetPolicyVersionCommand(params));
  }

  private async executeListPolicies(params: ListPoliciesParams): Promise<ListPoliciesCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListPoliciesCommand(params));
  }

  private async executeListPolicyVersions(params: ListPolicyVersionsParams): Promise<ListPolicyVersionsCommandOutput> {
    const client = await this.getClient();
    return await client.send(new ListPolicyVersionsCommand(params));
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: IAMCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`IAMTool: Executing command: ${command}`);
    ui.logToOutput(`IAMTool: Command parameters: ${JSON.stringify(params)}`);

    switch (command) {
      case 'GetRole':
        return await this.executeGetRole(params as GetRoleParams);
      case 'GetRolePolicy':
        return await this.executeGetRolePolicy(params as GetRolePolicyParams);
      case 'ListAttachedRolePolicies':
        return await this.executeListAttachedRolePolicies(params as ListAttachedRolePoliciesParams);
      case 'ListRolePolicies':
        return await this.executeListRolePolicies(params as ListRolePoliciesParams);
      case 'ListRoles':
        return await this.executeListRoles(params as ListRolesParams);
      case 'ListRoleTags':
        return await this.executeListRoleTags(params as ListRoleTagsParams);
      case 'GetPolicy':
        return await this.executeGetPolicy(params as GetPolicyParams);
      case 'GetPolicyVersion':
        return await this.executeGetPolicyVersion(params as GetPolicyVersionParams);
      case 'ListPolicies':
        return await this.executeListPolicies(params as ListPoliciesParams);
      case 'ListPolicyVersions':
        return await this.executeListPolicyVersions(params as ListPolicyVersionsParams);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IAMToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`IAMTool: Executing ${command} with params: ${JSON.stringify(params)}`);

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

      ui.logToOutput(`IAMTool: ${command} completed successfully`);

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

      ui.logToOutput(`IAMTool: ${command} failed`, error);

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
