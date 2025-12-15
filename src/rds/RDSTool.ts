import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  RDSClient,
  DescribeAccountAttributesCommand,
  DescribeBlueGreenDeploymentsCommand,
  DescribeCertificatesCommand,
  DescribeDBClusterAutomatedBackupsCommand,
  DescribeDBClusterParameterGroupsCommand,
  DescribeDBClustersCommand,
  DescribeDBClusterSnapshotsCommand,
  DescribeDBEngineVersionsCommand,
  DescribeDBInstanceAutomatedBackupsCommand,
  DescribeDBInstancesCommand,
  DescribeDBLogFilesCommand,
  DescribeDBParameterGroupsCommand,
  DescribeDBProxiesCommand,
  DescribeDBProxyEndpointsCommand,
  DescribeDBRecommendationsCommand,
  DescribeDBSecurityGroupsCommand,
  DescribeDBSnapshotAttributesCommand,
  DescribeDBSnapshotsCommand,
  DescribeDBSubnetGroupsCommand,
  DescribeEngineDefaultParametersCommand,
  DescribeEventsCommand,
  DescribeEventSubscriptionsCommand,
  DescribeExportTasksCommand,
  DescribeGlobalClustersCommand,
  DescribeIntegrationsCommand,
  DescribeOptionGroupsCommand,
  DescribeOrderableDBInstanceOptionsCommand,
  DescribePendingMaintenanceActionsCommand,
  DescribeReservedDBInstancesCommand,
  DescribeReservedDBInstancesOfferingsCommand,
  DescribeSourceRegionsCommand,
  DescribeTenantDatabasesCommand,
  DescribeValidDBInstanceModificationsCommand,
  DownloadDBLogFilePortionCommand,
  ListTagsForResourceCommand,
  DescribeAccountAttributesCommandOutput,
  DescribeBlueGreenDeploymentsCommandOutput,
  DescribeCertificatesCommandOutput,
  DescribeDBClusterAutomatedBackupsCommandOutput,
  DescribeDBClusterParameterGroupsCommandOutput,
  DescribeDBClustersCommandOutput,
  DescribeDBClusterSnapshotsCommandOutput,
  DescribeDBEngineVersionsCommandOutput,
  DescribeDBInstanceAutomatedBackupsCommandOutput,
  DescribeDBInstancesCommandOutput,
  DescribeDBLogFilesCommandOutput,
  DescribeDBParameterGroupsCommandOutput,
  DescribeDBProxiesCommandOutput,
  DescribeDBProxyEndpointsCommandOutput,
  DescribeDBRecommendationsCommandOutput,
  DescribeDBSecurityGroupsCommandOutput,
  DescribeDBSnapshotAttributesCommandOutput,
  DescribeDBSnapshotsCommandOutput,
  DescribeDBSubnetGroupsCommandOutput,
  DescribeEngineDefaultParametersCommandOutput,
  DescribeEventsCommandOutput,
  DescribeEventSubscriptionsCommandOutput,
  DescribeExportTasksCommandOutput,
  DescribeGlobalClustersCommandOutput,
  DescribeIntegrationsCommandOutput,
  DescribeOptionGroupsCommandOutput,
  DescribeOrderableDBInstanceOptionsCommandOutput,
  DescribePendingMaintenanceActionsCommandOutput,
  DescribeReservedDBInstancesCommandOutput,
  DescribeReservedDBInstancesOfferingsCommandOutput,
  DescribeSourceRegionsCommandOutput,
  DescribeTenantDatabasesCommandOutput,
  DescribeValidDBInstanceModificationsCommandOutput,
  DownloadDBLogFilePortionCommandOutput,
  ListTagsForResourceCommandOutput,
} from '@aws-sdk/client-rds';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentClient: RDSClient | undefined;

type RDSCommand =
  | 'DescribeAccountAttributes'
  | 'DescribeBlueGreenDeployments'
  | 'DescribeCertificates'
  | 'DescribeDBClusterAutomatedBackups'
  | 'DescribeDBClusterParameterGroups'
  | 'DescribeDBClusters'
  | 'DescribeDBClusterSnapshots'
  | 'DescribeDBEngineVersions'
  | 'DescribeDBInstanceAutomatedBackups'
  | 'DescribeDBInstances'
  | 'DescribeDBLogFiles'
  | 'DescribeDBParameterGroups'
  | 'DescribeDBProxies'
  | 'DescribeDBProxyEndpoints'
  | 'DescribeDBRecommendations'
  | 'DescribeDBSecurityGroups'
  | 'DescribeDBSnapshotAttributes'
  | 'DescribeDBSnapshots'
  | 'DescribeDBSubnetGroups'
  | 'DescribeEngineDefaultParameters'
  | 'DescribeEvents'
  | 'DescribeEventSubscriptions'
  | 'DescribeExportTasks'
  | 'DescribeGlobalClusters'
  | 'DescribeIntegrations'
  | 'DescribeOptionGroups'
  | 'DescribeOrderableDBInstanceOptions'
  | 'DescribePendingMaintenanceActions'
  | 'DescribeReservedDBInstances'
  | 'DescribeReservedDBInstancesOfferings'
  | 'DescribeSourceRegions'
  | 'DescribeTenantDatabases'
  | 'DescribeValidDBInstanceModifications'
  | 'DownloadDBLogFilePortion'
  | 'ListTagsForResource';

interface RDSToolInput {
  command: RDSCommand;
  params: Record<string, any>;
}

export class RDSTool implements vscode.LanguageModelTool<RDSToolInput> {
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials) {
      ui.logToOutput(`RDSTool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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
      ui.logToOutput(`RDSTool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('RDSTool: Failed to get credentials', error);
      throw error;
    }
  }

  private async getClient(): Promise<RDSClient> {
    if (CurrentClient) {
      return CurrentClient;
    }
    const credentials = await this.getCredentials();
    CurrentClient = new RDSClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });
    ui.logToOutput(`RDSTool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentClient;
  }

  private async send<COut>(ctor: new (input: any) => {}, params: Record<string, any>): Promise<any> {
    const client = await this.getClient();
    const command = new (ctor as any)(params as any);
    return await (client as any).send(command);
  }

  private async executeCommand(command: RDSCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`RDSTool: Executing command: ${command}`);
    ui.logToOutput(`RDSTool: Command parameters: ${JSON.stringify(params)}`);

    if (params?.DBInstanceIdentifier) {
      AIHandler.Current.updateLatestResource({ type: 'RDS DB Instance', name: params.DBInstanceIdentifier });
    }

    switch (command) {
      case 'DescribeAccountAttributes': return await this.send<DescribeAccountAttributesCommandOutput>(DescribeAccountAttributesCommand, params);
      case 'DescribeBlueGreenDeployments': return await this.send<DescribeBlueGreenDeploymentsCommandOutput>(DescribeBlueGreenDeploymentsCommand, params);
      case 'DescribeCertificates': return await this.send<DescribeCertificatesCommandOutput>(DescribeCertificatesCommand, params);
      
      case 'DescribeDBClusterAutomatedBackups': return await this.send<DescribeDBClusterAutomatedBackupsCommandOutput>(DescribeDBClusterAutomatedBackupsCommand, params);
      case 'DescribeDBClusterParameterGroups': return await this.send<DescribeDBClusterParameterGroupsCommandOutput>(DescribeDBClusterParameterGroupsCommand, params);
      case 'DescribeDBClusters': return await this.send<DescribeDBClustersCommandOutput>(DescribeDBClustersCommand, params);
      case 'DescribeDBClusterSnapshots': return await this.send<DescribeDBClusterSnapshotsCommandOutput>(DescribeDBClusterSnapshotsCommand, params);
      case 'DescribeDBEngineVersions': return await this.send<DescribeDBEngineVersionsCommandOutput>(DescribeDBEngineVersionsCommand, params);
      case 'DescribeDBInstanceAutomatedBackups': return await this.send<DescribeDBInstanceAutomatedBackupsCommandOutput>(DescribeDBInstanceAutomatedBackupsCommand, params);
      case 'DescribeDBInstances': return await this.send<DescribeDBInstancesCommandOutput>(DescribeDBInstancesCommand, params);
      case 'DescribeDBLogFiles': return await this.send<DescribeDBLogFilesCommandOutput>(DescribeDBLogFilesCommand, params);
      case 'DescribeDBParameterGroups': return await this.send<DescribeDBParameterGroupsCommandOutput>(DescribeDBParameterGroupsCommand, params);
      case 'DescribeDBProxies': return await this.send<DescribeDBProxiesCommandOutput>(DescribeDBProxiesCommand, params);
      case 'DescribeDBProxyEndpoints': return await this.send<DescribeDBProxyEndpointsCommandOutput>(DescribeDBProxyEndpointsCommand, params);
      case 'DescribeDBRecommendations': return await this.send<DescribeDBRecommendationsCommandOutput>(DescribeDBRecommendationsCommand, params);
      case 'DescribeDBSecurityGroups': return await this.send<DescribeDBSecurityGroupsCommandOutput>(DescribeDBSecurityGroupsCommand, params);
      case 'DescribeDBSnapshotAttributes': return await this.send<DescribeDBSnapshotAttributesCommandOutput>(DescribeDBSnapshotAttributesCommand, params);
      case 'DescribeDBSnapshots': return await this.send<DescribeDBSnapshotsCommandOutput>(DescribeDBSnapshotsCommand, params);
      case 'DescribeDBSubnetGroups': return await this.send<DescribeDBSubnetGroupsCommandOutput>(DescribeDBSubnetGroupsCommand, params);
      case 'DescribeEngineDefaultParameters': return await this.send<DescribeEngineDefaultParametersCommandOutput>(DescribeEngineDefaultParametersCommand, params);
      case 'DescribeEvents': return await this.send<DescribeEventsCommandOutput>(DescribeEventsCommand, params);
      case 'DescribeEventSubscriptions': return await this.send<DescribeEventSubscriptionsCommandOutput>(DescribeEventSubscriptionsCommand, params);
      case 'DescribeExportTasks': return await this.send<DescribeExportTasksCommandOutput>(DescribeExportTasksCommand, params);
      case 'DescribeGlobalClusters': return await this.send<DescribeGlobalClustersCommandOutput>(DescribeGlobalClustersCommand, params);
      
      case 'DescribeIntegrations': return await this.send<DescribeIntegrationsCommandOutput>(DescribeIntegrationsCommand, params);
      case 'DescribeOptionGroups': return await this.send<DescribeOptionGroupsCommandOutput>(DescribeOptionGroupsCommand, params);
      case 'DescribeOrderableDBInstanceOptions': return await this.send<DescribeOrderableDBInstanceOptionsCommandOutput>(DescribeOrderableDBInstanceOptionsCommand, params);
      case 'DescribePendingMaintenanceActions': return await this.send<DescribePendingMaintenanceActionsCommandOutput>(DescribePendingMaintenanceActionsCommand, params);
      case 'DescribeReservedDBInstances': return await this.send<DescribeReservedDBInstancesCommandOutput>(DescribeReservedDBInstancesCommand, params);
      case 'DescribeReservedDBInstancesOfferings': return await this.send<DescribeReservedDBInstancesOfferingsCommandOutput>(DescribeReservedDBInstancesOfferingsCommand, params);
      case 'DescribeSourceRegions': return await this.send<DescribeSourceRegionsCommandOutput>(DescribeSourceRegionsCommand, params);
      case 'DescribeTenantDatabases': return await this.send<DescribeTenantDatabasesCommandOutput>(DescribeTenantDatabasesCommand, params);
      case 'DescribeValidDBInstanceModifications': return await this.send<DescribeValidDBInstanceModificationsCommandOutput>(DescribeValidDBInstanceModificationsCommand, params);
      case 'DownloadDBLogFilePortion': return await this.send<DownloadDBLogFilePortionCommandOutput>(DownloadDBLogFilePortionCommand, params);
      case 'ListTagsForResource': return await this.send<ListTagsForResourceCommandOutput>(ListTagsForResourceCommand, params);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<RDSToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;
    try {
      ui.logToOutput(`RDSTool: Executing ${command} with params: ${JSON.stringify(params)}`);
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
      ui.logToOutput(`RDSTool: ${command} completed successfully`);
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
      ui.logToOutput(`RDSTool: ${command} failed`, error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
