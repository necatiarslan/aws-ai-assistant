import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  CloudFormationClient,
  BatchDescribeTypeConfigurationsCommand,
  DescribeAccountLimitsCommand,
  DescribeChangeSetCommand,
  DescribeChangeSetHooksCommand,
  DescribeOrganizationsAccessCommand,
  DescribePublisherCommand,
  DescribeStackDriftDetectionStatusCommand,
  DescribeStackEventsCommand,
  DescribeStackInstanceCommand,
  DescribeStackResourceCommand,
  DescribeStackResourceDriftsCommand,
  DescribeStackResourcesCommand,
  DescribeStacksCommand,
  DescribeStackSetCommand,
  DescribeStackSetOperationCommand,
  DescribeTypeCommand,
  DescribeTypeRegistrationCommand,
  DetectStackDriftCommand,
  DetectStackResourceDriftCommand,
  DetectStackSetDriftCommand,
  GetStackPolicyCommand,
  GetTemplateCommand,
  GetTemplateSummaryCommand,
  ListChangeSetsCommand,
  ListExportsCommand,
  ListImportsCommand,
  ListStackInstanceResourceDriftsCommand,
  ListStackInstancesCommand,
  ListStackResourcesCommand,
  ListStacksCommand,
  ListStackSetOperationResultsCommand,
  ListStackSetOperationsCommand,
  ListStackSetsCommand,
  ListTypeRegistrationsCommand,
  ListTypesCommand,
  ListTypeVersionsCommand
} from '@aws-sdk/client-cloudformation';
import { AIHandler } from '../chat/AIHandler';
let CurrentClient: CloudFormationClient | undefined;

type CFNCommand =
  | 'BatchDescribeTypeConfigurations'
  | 'DescribeAccountLimits'
  | 'DescribeChangeSet'
  | 'DescribeChangeSetHooks'
  | 'DescribeGeneratedTemplate'
  | 'DescribeOrganizationsAccess'
  | 'DescribePublisher'
  | 'DescribeResourceScan'
  | 'DescribeStackDriftDetectionStatus'
  | 'DescribeStackEvents'
  | 'DescribeStackInstance'
  | 'DescribeStackRefactor'
  | 'DescribeStackResource'
  | 'DescribeStackResourceDrifts'
  | 'DescribeStackResources'
  | 'DescribeStacks'
  | 'DescribeStackSet'
  | 'DescribeStackSetOperation'
  | 'DescribeType'
  | 'DescribeTypeRegistration'
  | 'DetectStackDrift'
  | 'DetectStackResourceDrift'
  | 'DetectStackSetDrift'
  | 'GetGeneratedTemplate'
  | 'GetHookResult'
  | 'GetStackPolicy'
  | 'GetTemplate'
  | 'GetTemplateSummary'
  | 'ListChangeSets'
  | 'ListExports'
  | 'ListGeneratedTemplates'
  | 'ListHookResults'
  | 'ListImports'
  | 'ListResourceScanRelatedResources'
  | 'ListResourceScanResources'
  | 'ListResourceScans'
  | 'ListStackInstanceResourceDrifts'
  | 'ListStackInstances'
  | 'ListStackRefactorActions'
  | 'ListStackRefactors'
  | 'ListStackResources'
  | 'ListStacks'
  | 'ListStackSetAutoDeploymentTargets'
  | 'ListStackSetOperationResults'
  | 'ListStackSetOperations'
  | 'ListStackSets'
  | 'ListTypeRegistrations'
  | 'ListTypes'
  | 'ListTypeVersions';

interface CloudFormationToolInput {
  command: CFNCommand;
  params: Record<string, any>;
}

export class CloudFormationTool implements vscode.LanguageModelTool<CloudFormationToolInput> {

  private async getClient(): Promise<CloudFormationClient> {
    if (CurrentClient) {
      return CurrentClient;
    }
    const credentials = await Session.Current?.GetCredentials();
    CurrentClient = new CloudFormationClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });
    ui.logToOutput(`CloudFormationTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentClient;
  }

  private async send(ctor: new (input: any) => {}, params: Record<string, any>): Promise<any> {
    const client = await this.getClient();
    const command = new (ctor as any)(params as any);
    return await (client as any).send(command);
  }

  private unsupported(command: CFNCommand): never {
    throw new Error(`${command} is not supported in this SDK version`);
  }

  private async executeCommand(command: CFNCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`CloudFormationTool: Executing command: ${command}`);
    ui.logToOutput(`CloudFormationTool: Command parameters: ${JSON.stringify(params)}`);

    if (params?.StackName) {
      AIHandler.Current.updateLatestResource({ type: 'CloudFormation Stack', name: params.StackName });
    }

    switch (command) {
      case 'BatchDescribeTypeConfigurations': return await this.send(BatchDescribeTypeConfigurationsCommand, params);
      case 'DescribeAccountLimits': return await this.send(DescribeAccountLimitsCommand, params);
      case 'DescribeChangeSet': return await this.send(DescribeChangeSetCommand, params);
      case 'DescribeChangeSetHooks': return await this.send(DescribeChangeSetHooksCommand, params);
      case 'DescribeGeneratedTemplate': return this.unsupported(command);
      case 'DescribeOrganizationsAccess': return await this.send(DescribeOrganizationsAccessCommand, params);
      case 'DescribePublisher': return await this.send(DescribePublisherCommand, params);
      case 'DescribeResourceScan': return this.unsupported(command);
      case 'DescribeStackDriftDetectionStatus': return await this.send(DescribeStackDriftDetectionStatusCommand, params);
      case 'DescribeStackEvents': return await this.send(DescribeStackEventsCommand, params);
      case 'DescribeStackInstance': return await this.send(DescribeStackInstanceCommand, params);
      case 'DescribeStackRefactor': return this.unsupported(command);
      case 'DescribeStackResource': return await this.send(DescribeStackResourceCommand, params);
      case 'DescribeStackResourceDrifts': return await this.send(DescribeStackResourceDriftsCommand, params);
      case 'DescribeStackResources': return await this.send(DescribeStackResourcesCommand, params);
      case 'DescribeStacks': return await this.send(DescribeStacksCommand, params);
      case 'DescribeStackSet': return await this.send(DescribeStackSetCommand, params);
      case 'DescribeStackSetOperation': return await this.send(DescribeStackSetOperationCommand, params);
      case 'DescribeType': return await this.send(DescribeTypeCommand, params);
      case 'DescribeTypeRegistration': return await this.send(DescribeTypeRegistrationCommand, params);
      case 'DetectStackDrift': return await this.send(DetectStackDriftCommand, params);
      case 'DetectStackResourceDrift': return await this.send(DetectStackResourceDriftCommand, params);
      case 'DetectStackSetDrift': return await this.send(DetectStackSetDriftCommand, params);
      case 'GetGeneratedTemplate': return this.unsupported(command);
      case 'GetHookResult': return this.unsupported(command);
      case 'GetStackPolicy': return await this.send(GetStackPolicyCommand, params);
      case 'GetTemplate': return await this.send(GetTemplateCommand, params);
      case 'GetTemplateSummary': return await this.send(GetTemplateSummaryCommand, params);
      case 'ListChangeSets': return await this.send(ListChangeSetsCommand, params);
      case 'ListExports': return await this.send(ListExportsCommand, params);
      case 'ListGeneratedTemplates': return this.unsupported(command);
      case 'ListHookResults': return this.unsupported(command);
      case 'ListImports': return await this.send(ListImportsCommand, params);
      case 'ListResourceScanRelatedResources': return this.unsupported(command);
      case 'ListResourceScanResources': return this.unsupported(command);
      case 'ListResourceScans': return this.unsupported(command);
      case 'ListStackInstanceResourceDrifts': return await this.send(ListStackInstanceResourceDriftsCommand, params);
      case 'ListStackInstances': return await this.send(ListStackInstancesCommand, params);
      case 'ListStackRefactorActions': return this.unsupported(command);
      case 'ListStackRefactors': return this.unsupported(command);
      case 'ListStackResources': return await this.send(ListStackResourcesCommand, params);
      case 'ListStacks': return await this.send(ListStacksCommand, params);
      case 'ListStackSetAutoDeploymentTargets': return this.unsupported(command);
      case 'ListStackSetOperationResults': return await this.send(ListStackSetOperationResultsCommand, params);
      case 'ListStackSetOperations': return await this.send(ListStackSetOperationsCommand, params);
      case 'ListStackSets': return await this.send(ListStackSetsCommand, params);
      case 'ListTypeRegistrations': return await this.send(ListTypeRegistrationsCommand, params);
      case 'ListTypes': return await this.send(ListTypesCommand, params);
      case 'ListTypeVersions': return await this.send(ListTypeVersionsCommand, params);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<CloudFormationToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;
    try {
      ui.logToOutput(`CloudFormationTool: Executing ${command} with params: ${JSON.stringify(params)}`);
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
      ui.logToOutput(`CloudFormationTool: ${command} completed successfully`);
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
      ui.logToOutput(`CloudFormationTool: ${command} failed`, error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
