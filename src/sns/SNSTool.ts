import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import {
  SNSClient,
  CheckIfPhoneNumberIsOptedOutCommand,
  GetEndpointAttributesCommand,
  GetPlatformApplicationAttributesCommand,
  GetSMSAttributesCommand,
  GetSubscriptionAttributesCommand,
  GetTopicAttributesCommand,
  ListPhoneNumbersOptedOutCommand,
  ListSubscriptionsByTopicCommand,
  ListSubscriptionsCommand,
  ListTagsForResourceCommand,
  ListTopicsCommand,
  PublishCommand,
  CheckIfPhoneNumberIsOptedOutCommandOutput,
  GetEndpointAttributesCommandOutput,
  GetPlatformApplicationAttributesCommandOutput,
  GetSMSAttributesCommandOutput,
  GetSubscriptionAttributesCommandOutput,
  GetTopicAttributesCommandOutput,
  ListPhoneNumbersOptedOutCommandOutput,
  ListSubscriptionsByTopicCommandOutput,
  ListSubscriptionsCommandOutput,
  ListTagsForResourceCommandOutput,
  ListTopicsCommandOutput,
  PublishCommandOutput,
} from '@aws-sdk/client-sns';
import { AIHandler } from '../chat/AIHandler';
import { needsConfirmation, confirmProceed } from '../common/ActionGuard';

let CurrentSNSClient: SNSClient | undefined;

type SNSCommand =
  | 'CheckIfPhoneNumberIsOptedOut'
  | 'GetEndpointAttributes'
  | 'GetPlatformApplicationAttributes'
  | 'GetSMSAttributes'
  | 'GetSubscriptionAttributes'
  | 'GetTopicAttributes'
  | 'ListPhoneNumbersOptedOut'
  | 'ListSubscriptionsByTopic'
  | 'ListSubscriptions'
  | 'ListTagsForResource'
  | 'ListTopics'
  | 'Publish';

interface SNSToolInput {
  command: SNSCommand;
  params: Record<string, any>;
}

interface CheckIfPhoneNumberIsOptedOutParams { PhoneNumber: string; }
interface CheckIfPhoneNumberIsOptedOutParams { phoneNumber: string; }
interface GetEndpointAttributesParams { EndpointArn: string; }
interface GetPlatformApplicationAttributesParams { PlatformApplicationArn: string; }
interface GetSMSAttributesParams { attributes?: string[]; }
interface GetSubscriptionAttributesParams { SubscriptionArn: string; }
interface GetTopicAttributesParams { TopicArn: string; }
interface ListPhoneNumbersOptedOutParams { nextToken?: string; }
interface ListPhoneNumbersOptedOutParams { NextToken?: string; }
interface ListSubscriptionsByTopicParams { TopicArn: string; NextToken?: string; }
interface ListSubscriptionsParams { nextToken?: string; }
interface ListSubscriptionsParams { NextToken?: string; }
interface ListTagsForResourceParams { ResourceArn: string; }
interface ListTopicsParams { nextToken?: string; }
interface ListTopicsParams { NextToken?: string; }
interface PublishParams {
  Message: string;
  TopicArn?: string;
  TargetArn?: string;
  PhoneNumber?: string;
  Subject?: string;
  MessageStructure?: string;
  MessageAttributes?: Record<string, any>;
}

export class SNSTool implements vscode.LanguageModelTool<SNSToolInput> {

  private async getSNSClient(): Promise<SNSClient> {
    if (CurrentSNSClient) {
      return CurrentSNSClient;
    }
    const credentials = await Session.Current?.GetCredentials();
    CurrentSNSClient = new SNSClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });
    ui.logToOutput(`SNSTool: SNS client created (region=${Session.Current?.AwsRegion})`);
    return CurrentSNSClient;
  }

  private async executeCheckIfPhoneNumberIsOptedOut(params: CheckIfPhoneNumberIsOptedOutParams): Promise<CheckIfPhoneNumberIsOptedOutCommandOutput> {
    const client = await this.getSNSClient();
    const command = new CheckIfPhoneNumberIsOptedOutCommand(params);
    return await client.send(command);
  }
  private async executeGetEndpointAttributes(params: GetEndpointAttributesParams): Promise<GetEndpointAttributesCommandOutput> {
    const client = await this.getSNSClient();
    const command = new GetEndpointAttributesCommand(params);
    return await client.send(command);
  }
  private async executeGetPlatformApplicationAttributes(params: GetPlatformApplicationAttributesParams): Promise<GetPlatformApplicationAttributesCommandOutput> {
    const client = await this.getSNSClient();
    const command = new GetPlatformApplicationAttributesCommand(params);
    return await client.send(command);
  }
  private async executeGetSMSAttributes(params: GetSMSAttributesParams): Promise<GetSMSAttributesCommandOutput> {
    const client = await this.getSNSClient();
    const command = new GetSMSAttributesCommand(params);
    return await client.send(command);
  }
  private async executeGetSubscriptionAttributes(params: GetSubscriptionAttributesParams): Promise<GetSubscriptionAttributesCommandOutput> {
    const client = await this.getSNSClient();
    const command = new GetSubscriptionAttributesCommand(params);
    return await client.send(command);
  }
  private async executeGetTopicAttributes(params: GetTopicAttributesParams): Promise<GetTopicAttributesCommandOutput> {
    const client = await this.getSNSClient();
    const command = new GetTopicAttributesCommand(params);
    return await client.send(command);
  }
  private async executeListPhoneNumbersOptedOut(params: ListPhoneNumbersOptedOutParams): Promise<ListPhoneNumbersOptedOutCommandOutput> {
    const client = await this.getSNSClient();
    const command = new ListPhoneNumbersOptedOutCommand(params);
    return await client.send(command);
  }
  private async executeListSubscriptionsByTopic(params: ListSubscriptionsByTopicParams): Promise<ListSubscriptionsByTopicCommandOutput> {
    const client = await this.getSNSClient();
    const command = new ListSubscriptionsByTopicCommand(params);
    return await client.send(command);
  }
  private async executeListSubscriptions(params: ListSubscriptionsParams): Promise<ListSubscriptionsCommandOutput> {
    const client = await this.getSNSClient();
    const command = new ListSubscriptionsCommand(params);
    return await client.send(command);
  }
  private async executeListTagsForResource(params: ListTagsForResourceParams): Promise<ListTagsForResourceCommandOutput> {
    const client = await this.getSNSClient();
    const command = new ListTagsForResourceCommand(params);
    return await client.send(command);
  }
  private async executeListTopics(params: ListTopicsParams): Promise<ListTopicsCommandOutput> {
    const client = await this.getSNSClient();
    const command = new ListTopicsCommand(params);
    return await client.send(command);
  }
  private async executePublish(params: PublishParams): Promise<PublishCommandOutput> {
    const client = await this.getSNSClient();
    const command = new PublishCommand(params);
    return await client.send(command);
  }

  private async executeCommand(command: SNSCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`SNSTool: Executing command: ${command}`);
    ui.logToOutput(`SNSTool: Command parameters: ${JSON.stringify(params)}`);

    if ("TopicArn" in params) {
      AIHandler.Current.updateLatestResource({ type: 'SNS Topic', name: params.TopicArn });
    } else if ("TargetArn" in params) {
      AIHandler.Current.updateLatestResource({ type: 'SNS Target', name: params.TargetArn });
    } else if ("EndpointArn" in params) {
      AIHandler.Current.updateLatestResource({ type: 'SNS Endpoint', name: params.EndpointArn });
    }

    switch (command) {
      case 'CheckIfPhoneNumberIsOptedOut':
        return await this.executeCheckIfPhoneNumberIsOptedOut(params as CheckIfPhoneNumberIsOptedOutParams);
      case 'GetEndpointAttributes':
        return await this.executeGetEndpointAttributes(params as GetEndpointAttributesParams);
      case 'GetPlatformApplicationAttributes':
        return await this.executeGetPlatformApplicationAttributes(params as GetPlatformApplicationAttributesParams);
      case 'GetSMSAttributes':
        return await this.executeGetSMSAttributes(params as GetSMSAttributesParams);
      case 'GetSubscriptionAttributes':
        return await this.executeGetSubscriptionAttributes(params as GetSubscriptionAttributesParams);
      case 'GetTopicAttributes':
        return await this.executeGetTopicAttributes(params as GetTopicAttributesParams);
      case 'ListPhoneNumbersOptedOut':
        return await this.executeListPhoneNumbersOptedOut(params as ListPhoneNumbersOptedOutParams);
      case 'ListSubscriptionsByTopic':
        return await this.executeListSubscriptionsByTopic(params as ListSubscriptionsByTopicParams);
      case 'ListSubscriptions':
        return await this.executeListSubscriptions(params as ListSubscriptionsParams);
      case 'ListTagsForResource':
        return await this.executeListTagsForResource(params as ListTagsForResourceParams);
      case 'ListTopics':
        return await this.executeListTopics(params as ListTopicsParams);
      case 'Publish':
        return await this.executePublish(params as PublishParams);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SNSToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`SNSTool: Executing ${command} with params: ${JSON.stringify(params)}`);
      if (needsConfirmation(command)) {
        const ok = await confirmProceed(command);
        if (!ok) {
          const cancelled = { success: false, command, message: 'User cancelled action command' };
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(cancelled, null, 2))
          ]);
        }
      }
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
      ui.logToOutput(`SNSTool: ${command} completed successfully`);
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
      ui.logToOutput(`SNSTool: ${command} failed`, error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
