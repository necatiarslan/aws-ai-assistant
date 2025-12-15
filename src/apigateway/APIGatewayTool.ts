import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  APIGatewayClient,
  GetAccountCommand,
  GetApiKeyCommand,
  GetApiKeysCommand,
  GetAuthorizerCommand,
  GetAuthorizersCommand,
  GetBasePathMappingCommand,
  GetBasePathMappingsCommand,
  GetClientCertificateCommand,
  GetClientCertificatesCommand,
  GetDeploymentCommand,
  GetDeploymentsCommand,
  GetDocumentationPartCommand,
  GetDocumentationPartsCommand,
  GetDocumentationVersionCommand,
  GetDocumentationVersionsCommand,
  GetDomainNameCommand,
  GetDomainNamesCommand,
  GetExportCommand,
  GetGatewayResponseCommand,
  GetGatewayResponsesCommand,
  GetIntegrationCommand,
  GetIntegrationResponseCommand,
  GetMethodCommand,
  GetModelCommand,
  GetModelsCommand,
  GetRequestValidatorCommand,
  GetRequestValidatorsCommand,
  GetResourceCommand,
  GetResourcesCommand,
  GetRestApiCommand,
  GetRestApisCommand,
  GetSdkCommand,
  GetSdkTypeCommand,
  GetSdkTypesCommand,
  GetStageCommand,
  GetStagesCommand,
  GetTagsCommand,
  GetUsageCommand,
  GetUsagePlanCommand,
  GetUsagePlanKeyCommand,
  GetUsagePlanKeysCommand,
  GetUsagePlansCommand,
  GetVpcLinkCommand,
  GetVpcLinksCommand,
  GetAccountCommandOutput,
  GetApiKeyCommandOutput,
  GetApiKeysCommandOutput,
  GetAuthorizerCommandOutput,
  GetAuthorizersCommandOutput,
  GetBasePathMappingCommandOutput,
  GetBasePathMappingsCommandOutput,
  GetClientCertificateCommandOutput,
  GetClientCertificatesCommandOutput,
  GetDeploymentCommandOutput,
  GetDeploymentsCommandOutput,
  GetDocumentationPartCommandOutput,
  GetDocumentationPartsCommandOutput,
  GetDocumentationVersionCommandOutput,
  GetDocumentationVersionsCommandOutput,
  GetDomainNameCommandOutput,
  GetDomainNamesCommandOutput,
  GetExportCommandOutput,
  GetGatewayResponseCommandOutput,
  GetGatewayResponsesCommandOutput,
  GetIntegrationCommandOutput,
  GetIntegrationResponseCommandOutput,
  GetMethodCommandOutput,
  GetModelCommandOutput,
  GetModelsCommandOutput,
  GetRequestValidatorCommandOutput,
  GetRequestValidatorsCommandOutput,
  GetResourceCommandOutput,
  GetResourcesCommandOutput,
  GetRestApiCommandOutput,
  GetRestApisCommandOutput,
  GetSdkCommandOutput,
  GetSdkTypeCommandOutput,
  GetSdkTypesCommandOutput,
  GetStageCommandOutput,
  GetStagesCommandOutput,
  GetTagsCommandOutput,
  GetUsageCommandOutput,
  GetUsagePlanCommandOutput,
  GetUsagePlanKeyCommandOutput,
  GetUsagePlanKeysCommandOutput,
  GetUsagePlansCommandOutput,
  GetVpcLinkCommandOutput,
  GetVpcLinksCommandOutput,
} from '@aws-sdk/client-api-gateway';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentClient: APIGatewayClient | undefined;

type APIGatewayCommand =
  | 'GetAccount'
  | 'GetApiKey'
  | 'GetApiKeys'
  | 'GetAuthorizer'
  | 'GetAuthorizers'
  | 'GetBasePathMapping'
  | 'GetBasePathMappings'
  | 'GetClientCertificate'
  | 'GetClientCertificates'
  | 'GetDeployment'
  | 'GetDeployments'
  | 'GetDocumentationPart'
  | 'GetDocumentationParts'
  | 'GetDocumentationVersion'
  | 'GetDocumentationVersions'
  | 'GetDomainName'
  | 'GetDomainNames'
  | 'GetExport'
  | 'GetGatewayResponse'
  | 'GetGatewayResponses'
  | 'GetIntegration'
  | 'GetIntegrationResponse'
  | 'GetMethod'
  | 'GetModel'
  | 'GetModels'
  | 'GetRequestValidator'
  | 'GetRequestValidators'
  | 'GetResource'
  | 'GetResources'
  | 'GetRestApi'
  | 'GetRestApis'
  | 'GetSdk'
  | 'GetSdkType'
  | 'GetSdkTypes'
  | 'GetStage'
  | 'GetStages'
  | 'GetTags'
  | 'GetUsage'
  | 'GetUsagePlan'
  | 'GetUsagePlanKey'
  | 'GetUsagePlanKeys'
  | 'GetUsagePlans'
  | 'GetVpcLink'
  | 'GetVpcLinks'
  ;

interface APIGatewayToolInput {
  command: APIGatewayCommand;
  params: Record<string, any>;
}

export class APIGatewayTool implements vscode.LanguageModelTool<APIGatewayToolInput> {
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials) {
      ui.logToOutput(`APIGatewayTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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
      ui.logToOutput(`APIGatewayTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('APIGatewayTool: Failed to get credentials', error);
      throw error;
    }
  }

  private async getClient(): Promise<APIGatewayClient> {
    if (CurrentClient) {
      return CurrentClient;
    }
    const credentials = await this.getCredentials();
    CurrentClient = new APIGatewayClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });
    ui.logToOutput(`APIGatewayTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentClient;
  }

  // Minimal wrappers: forward params as-is to AWS SDK
  private async send<COut>(ctor: new (input: any) => { }, params: Record<string, any>): Promise<any> {
    const client = await this.getClient();
    const command = new (ctor as any)(params as any);
    return await (client as any).send(command);
  }

  private async executeCommand(command: APIGatewayCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`APIGatewayTool: Executing command: ${command}`);
    ui.logToOutput(`APIGatewayTool: Command parameters: ${JSON.stringify(params)}`);

    if (params?.restApiId) {
      AIHandler.Current.updateLatestResource({ type: 'API Gateway REST API', name: params.restApiId });
    }

    switch (command) {
      case 'GetAccount': return await this.send<GetAccountCommandOutput>(GetAccountCommand, params);
      case 'GetApiKey': return await this.send<GetApiKeyCommandOutput>(GetApiKeyCommand, params);
      case 'GetApiKeys': return await this.send<GetApiKeysCommandOutput>(GetApiKeysCommand, params);
      case 'GetAuthorizer': return await this.send<GetAuthorizerCommandOutput>(GetAuthorizerCommand, params);
      case 'GetAuthorizers': return await this.send<GetAuthorizersCommandOutput>(GetAuthorizersCommand, params);
      case 'GetBasePathMapping': return await this.send<GetBasePathMappingCommandOutput>(GetBasePathMappingCommand, params);
      case 'GetBasePathMappings': return await this.send<GetBasePathMappingsCommandOutput>(GetBasePathMappingsCommand, params);
      case 'GetClientCertificate': return await this.send<GetClientCertificateCommandOutput>(GetClientCertificateCommand, params);
      case 'GetClientCertificates': return await this.send<GetClientCertificatesCommandOutput>(GetClientCertificatesCommand, params);
      case 'GetDeployment': return await this.send<GetDeploymentCommandOutput>(GetDeploymentCommand, params);
      case 'GetDeployments': return await this.send<GetDeploymentsCommandOutput>(GetDeploymentsCommand, params);
      case 'GetDocumentationPart': return await this.send<GetDocumentationPartCommandOutput>(GetDocumentationPartCommand, params);
      case 'GetDocumentationParts': return await this.send<GetDocumentationPartsCommandOutput>(GetDocumentationPartsCommand, params);
      case 'GetDocumentationVersion': return await this.send<GetDocumentationVersionCommandOutput>(GetDocumentationVersionCommand, params);
      case 'GetDocumentationVersions': return await this.send<GetDocumentationVersionsCommandOutput>(GetDocumentationVersionsCommand, params);
      case 'GetDomainName': return await this.send<GetDomainNameCommandOutput>(GetDomainNameCommand, params);
      case 'GetDomainNames': return await this.send<GetDomainNamesCommandOutput>(GetDomainNamesCommand, params);
      case 'GetExport': return await this.send<GetExportCommandOutput>(GetExportCommand, params);
      case 'GetGatewayResponse': return await this.send<GetGatewayResponseCommandOutput>(GetGatewayResponseCommand, params);
      case 'GetGatewayResponses': return await this.send<GetGatewayResponsesCommandOutput>(GetGatewayResponsesCommand, params);
      case 'GetIntegration': return await this.send<GetIntegrationCommandOutput>(GetIntegrationCommand, params);
      case 'GetIntegrationResponse': return await this.send<GetIntegrationResponseCommandOutput>(GetIntegrationResponseCommand, params);
      case 'GetMethod': return await this.send<GetMethodCommandOutput>(GetMethodCommand, params);
      case 'GetModel': return await this.send<GetModelCommandOutput>(GetModelCommand, params);
      case 'GetModels': return await this.send<GetModelsCommandOutput>(GetModelsCommand, params);
      case 'GetRequestValidator': return await this.send<GetRequestValidatorCommandOutput>(GetRequestValidatorCommand, params);
      case 'GetRequestValidators': return await this.send<GetRequestValidatorsCommandOutput>(GetRequestValidatorsCommand, params);
      case 'GetResource': return await this.send<GetResourceCommandOutput>(GetResourceCommand, params);
      case 'GetResources': return await this.send<GetResourcesCommandOutput>(GetResourcesCommand, params);
      case 'GetRestApi': return await this.send<GetRestApiCommandOutput>(GetRestApiCommand, params);
      case 'GetRestApis': return await this.send<GetRestApisCommandOutput>(GetRestApisCommand, params);
      case 'GetSdk': return await this.send<GetSdkCommandOutput>(GetSdkCommand, params);
      case 'GetSdkType': return await this.send<GetSdkTypeCommandOutput>(GetSdkTypeCommand, params);
      case 'GetSdkTypes': return await this.send<GetSdkTypesCommandOutput>(GetSdkTypesCommand, params);
      case 'GetStage': return await this.send<GetStageCommandOutput>(GetStageCommand, params);
      case 'GetStages': return await this.send<GetStagesCommandOutput>(GetStagesCommand, params);
      case 'GetTags': return await this.send<GetTagsCommandOutput>(GetTagsCommand, params);
      case 'GetUsage': return await this.send<GetUsageCommandOutput>(GetUsageCommand, params);
      case 'GetUsagePlan': return await this.send<GetUsagePlanCommandOutput>(GetUsagePlanCommand, params);
      case 'GetUsagePlanKey': return await this.send<GetUsagePlanKeyCommandOutput>(GetUsagePlanKeyCommand, params);
      case 'GetUsagePlanKeys': return await this.send<GetUsagePlanKeysCommandOutput>(GetUsagePlanKeysCommand, params);
      case 'GetUsagePlans': return await this.send<GetUsagePlansCommandOutput>(GetUsagePlansCommand, params);
      case 'GetVpcLink': return await this.send<GetVpcLinkCommandOutput>(GetVpcLinkCommand, params);
      case 'GetVpcLinks': return await this.send<GetVpcLinksCommandOutput>(GetVpcLinksCommand, params);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<APIGatewayToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;
    try {
      ui.logToOutput(`APIGatewayTool: Executing ${command} with params: ${JSON.stringify(params)}`);
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
      ui.logToOutput(`APIGatewayTool: ${command} completed successfully`);
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
      ui.logToOutput(`APIGatewayTool: ${command} failed`, error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
