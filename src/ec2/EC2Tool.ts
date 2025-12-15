import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  EC2Client,
  DescribeAccountAttributesCommand,
  DescribeAddressesCommand,
  DescribeAvailabilityZonesCommand,
  DescribeImagesCommand,
  DescribeInstancesCommand,
  DescribeInstanceStatusCommand,
  DescribeKeyPairsCommand,
  DescribeRegionsCommand,
  DescribeSecurityGroupsCommand,
  DescribeSnapshotsCommand,
  DescribeSubnetsCommand,
  DescribeTagsCommand,
  DescribeVolumesCommand,
  DescribeVpcsCommand,
  GetConsoleOutputCommand,
  GetHostReservationPurchasePreviewCommand,
  GetLaunchTemplateDataCommand,
  GetPasswordDataCommand,
  DescribeAccountAttributesCommandOutput,
  DescribeAddressesCommandOutput,
  DescribeAvailabilityZonesCommandOutput,
  DescribeImagesCommandOutput,
  DescribeInstancesCommandOutput,
  DescribeInstanceStatusCommandOutput,
  DescribeKeyPairsCommandOutput,
  DescribeRegionsCommandOutput,
  DescribeSecurityGroupsCommandOutput,
  DescribeSnapshotsCommandOutput,
  DescribeSubnetsCommandOutput,
  DescribeTagsCommandOutput,
  DescribeVolumesCommandOutput,
  DescribeVpcsCommandOutput,
  GetConsoleOutputCommandOutput,
  GetHostReservationPurchasePreviewCommandOutput,
  GetLaunchTemplateDataCommandOutput,
  GetPasswordDataCommandOutput,
} from '@aws-sdk/client-ec2';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentEC2Client: EC2Client | undefined;

type EC2Command =
  | 'DescribeAccountAttributes'
  | 'DescribeAddresses'
  | 'DescribeAvailabilityZones'
  | 'DescribeImages'
  | 'DescribeInstances'
  | 'DescribeInstanceStatus'
  | 'DescribeKeyPairs'
  | 'DescribeRegions'
  | 'DescribeSecurityGroups'
  | 'DescribeSnapshots'
  | 'DescribeSubnets'
  | 'DescribeTags'
  | 'DescribeVolumes'
  | 'DescribeVpcs'
  | 'GetConsoleOutput'
  | 'GetHostReservationPurchasePreview'
  | 'GetLaunchTemplateData'
  | 'GetPasswordData';

interface EC2ToolInput {
  command: EC2Command;
  params: Record<string, any>;
}

export class EC2Tool implements vscode.LanguageModelTool<EC2ToolInput> {
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials) {
      ui.logToOutput(`EC2Tool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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
      ui.logToOutput(`EC2Tool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('EC2Tool: Failed to get credentials', error);
      throw error;
    }
  }

  private async getClient(): Promise<EC2Client> {
    if (CurrentEC2Client) {
      return CurrentEC2Client;
    }
    const credentials = await this.getCredentials();
    CurrentEC2Client = new EC2Client({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });
    ui.logToOutput(`EC2Tool: Client created (region=${Session.Current?.AwsRegion})`);
    return CurrentEC2Client;
  }

  private async executeDescribeAccountAttributes(params: Record<string, any>): Promise<DescribeAccountAttributesCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeAccountAttributesCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeAddresses(params: Record<string, any>): Promise<DescribeAddressesCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeAddressesCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeAvailabilityZones(params: Record<string, any>): Promise<DescribeAvailabilityZonesCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeAvailabilityZonesCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeImages(params: Record<string, any>): Promise<DescribeImagesCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeImagesCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeInstances(params: Record<string, any>): Promise<DescribeInstancesCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeInstancesCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeInstanceStatus(params: Record<string, any>): Promise<DescribeInstanceStatusCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeInstanceStatusCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeKeyPairs(params: Record<string, any>): Promise<DescribeKeyPairsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeKeyPairsCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeRegions(params: Record<string, any>): Promise<DescribeRegionsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeRegionsCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeSecurityGroups(params: Record<string, any>): Promise<DescribeSecurityGroupsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeSecurityGroupsCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeSnapshots(params: Record<string, any>): Promise<DescribeSnapshotsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeSnapshotsCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeSubnets(params: Record<string, any>): Promise<DescribeSubnetsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeSubnetsCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeTags(params: Record<string, any>): Promise<DescribeTagsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeTagsCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeVolumes(params: Record<string, any>): Promise<DescribeVolumesCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeVolumesCommand(params as any);
    return await client.send(command);
  }
  private async executeDescribeVpcs(params: Record<string, any>): Promise<DescribeVpcsCommandOutput> {
    const client = await this.getClient();
    const command = new DescribeVpcsCommand(params as any);
    return await client.send(command);
  }
  private async executeGetConsoleOutput(params: Record<string, any>): Promise<GetConsoleOutputCommandOutput> {
    const client = await this.getClient();
    const command = new GetConsoleOutputCommand(params as any);
    return await client.send(command);
  }
  private async executeGetHostReservationPurchasePreview(params: Record<string, any>): Promise<GetHostReservationPurchasePreviewCommandOutput> {
    const client = await this.getClient();
    const command = new GetHostReservationPurchasePreviewCommand(params as any);
    return await client.send(command);
  }
  private async executeGetLaunchTemplateData(params: Record<string, any>): Promise<GetLaunchTemplateDataCommandOutput> {
    const client = await this.getClient();
    const command = new GetLaunchTemplateDataCommand(params as any);
    return await client.send(command);
  }
  private async executeGetPasswordData(params: Record<string, any>): Promise<GetPasswordDataCommandOutput> {
    const client = await this.getClient();
    const command = new GetPasswordDataCommand(params as any);
    return await client.send(command);
  }

  private async executeCommand(command: EC2Command, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`EC2Tool: Executing command: ${command}`);
    ui.logToOutput(`EC2Tool: Command parameters: ${JSON.stringify(params)}`);

    if (params?.InstanceId || (Array.isArray(params?.InstanceIds) && params.InstanceIds.length > 0)) {
      const name = params.InstanceId || params.InstanceIds?.[0];
      AIHandler.Current.updateLatestResource({ type: 'EC2 Instance', name });
    }

    switch (command) {
      case 'DescribeAccountAttributes':
        return await this.executeDescribeAccountAttributes(params);
      case 'DescribeAddresses':
        return await this.executeDescribeAddresses(params);
      case 'DescribeAvailabilityZones':
        return await this.executeDescribeAvailabilityZones(params);
      case 'DescribeImages':
        return await this.executeDescribeImages(params);
      case 'DescribeInstances':
        return await this.executeDescribeInstances(params);
      case 'DescribeInstanceStatus':
        return await this.executeDescribeInstanceStatus(params);
      case 'DescribeKeyPairs':
        return await this.executeDescribeKeyPairs(params);
      case 'DescribeRegions':
        return await this.executeDescribeRegions(params);
      case 'DescribeSecurityGroups':
        return await this.executeDescribeSecurityGroups(params);
      case 'DescribeSnapshots':
        return await this.executeDescribeSnapshots(params);
      case 'DescribeSubnets':
        return await this.executeDescribeSubnets(params);
      case 'DescribeTags':
        return await this.executeDescribeTags(params);
      case 'DescribeVolumes':
        return await this.executeDescribeVolumes(params);
      case 'DescribeVpcs':
        return await this.executeDescribeVpcs(params);
      case 'GetConsoleOutput':
        return await this.executeGetConsoleOutput(params);
      case 'GetHostReservationPurchasePreview':
        return await this.executeGetHostReservationPurchasePreview(params);
      case 'GetLaunchTemplateData':
        return await this.executeGetLaunchTemplateData(params);
      case 'GetPasswordData':
        return await this.executeGetPasswordData(params);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<EC2ToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;
    try {
      ui.logToOutput(`EC2Tool: Executing ${command} with params: ${JSON.stringify(params)}`);
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
      ui.logToOutput(`EC2Tool: ${command} completed successfully`);
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
      ui.logToOutput(`EC2Tool: ${command} failed`, error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
