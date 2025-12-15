import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { MethodResult } from '../common/MethodResult';
import { Session } from '../common/Session';
import { 
  SQSClient,
  ListQueuesCommand,
  ListDeadLetterSourceQueuesCommand,
  ListQueueTagsCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ListQueuesCommandOutput,
  ListDeadLetterSourceQueuesCommandOutput,
  ListQueueTagsCommandOutput,
  GetQueueAttributesCommandOutput,
  GetQueueUrlCommandOutput,
  SendMessageCommandOutput,
  ReceiveMessageCommandOutput,
  DeleteMessageCommandOutput,
  QueueAttributeName,
  MessageSystemAttributeNameForSends,
} from '@aws-sdk/client-sqs';
import { AIHandler } from '../chat/AIHandler';
import { needsConfirmation, confirmProceed } from '../common/ActionGuard';

// Cached client
let CurrentSQSClient: SQSClient | undefined;

// Command type definition
type SQSCommand = 
  | 'ListQueues'
  | 'ListDeadLetterSourceQueues'
  | 'ListQueueTags'
  | 'GetQueueAttributes'
  | 'GetQueueUrl'
  | 'SendMessage'
  | 'ReceiveMessage'
  | 'DeleteMessage';

// Input interface - command + params object
interface SQSToolInput {
  command: SQSCommand;
  params: Record<string, any>;
}

// Command parameter interfaces for type safety
interface ListQueuesParams {
  QueueNamePrefix?: string;
  MaxResults?: number;
  NextToken?: string;
}

interface ListDeadLetterSourceQueuesParams {
  QueueUrl: string;
  MaxResults?: number;
  NextToken?: string;
}

interface ListQueueTagsParams {
  QueueUrl: string;
}

interface GetQueueAttributesParams {
  QueueUrl: string;
  AttributeNames?: QueueAttributeName[];
}

interface GetQueueUrlParams {
  QueueName: string;
  QueueOwnerAWSAccountId?: string;
}

interface SendMessageParams {
  QueueUrl: string;
  MessageBody: string;
  DelaySeconds?: number;
  MessageAttributes?: Record<string, any>;
  MessageSystemAttributes?: Record<string, any>;
  MessageDeduplicationId?: string;
  MessageGroupId?: string;
}

interface ReceiveMessageParams {
  QueueUrl: string;
  AttributeNames?: QueueAttributeName[];
  MessageAttributeNames?: string[];
  MaxNumberOfMessages?: number;
  VisibilityTimeout?: number;
  WaitTimeSeconds?: number;
  ReceiveRequestAttemptId?: string;
}

interface DeleteMessageParams {
  QueueUrl: string;
  ReceiptHandle: string;
}

export class SQSTool implements vscode.LanguageModelTool<SQSToolInput> {
  /**
   * Get SQS Client with session configuration
   */
  private async getSQSClient(): Promise<SQSClient> {
    if (CurrentSQSClient !== undefined) {
      return CurrentSQSClient;
    }

    const credentials = await Session.Current?.GetCredentials();

    CurrentSQSClient = new SQSClient({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`SQSTool: SQS client created (region=${Session.Current?.AwsRegion})`);
    return CurrentSQSClient;
  }

  /**
   * Execute ListQueues command
   */
  private async executeListQueues(params: ListQueuesParams): Promise<ListQueuesCommandOutput> {
    const client = await this.getSQSClient();
    const command = new ListQueuesCommand(params);
    return await client.send(command);
  }

  /**
   * Execute ListDeadLetterSourceQueues command
   */
  private async executeListDeadLetterSourceQueues(params: ListDeadLetterSourceQueuesParams): Promise<ListDeadLetterSourceQueuesCommandOutput> {
    const client = await this.getSQSClient();
    const command = new ListDeadLetterSourceQueuesCommand(params);
    return await client.send(command);
  }

  /**
   * Execute ListQueueTags command
   */
  private async executeListQueueTags(params: ListQueueTagsParams): Promise<ListQueueTagsCommandOutput> {
    const client = await this.getSQSClient();
    const command = new ListQueueTagsCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetQueueAttributes command
   */
  private async executeGetQueueAttributes(params: GetQueueAttributesParams): Promise<GetQueueAttributesCommandOutput> {
    const client = await this.getSQSClient();
    const command = new GetQueueAttributesCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetQueueUrl command
   */
  private async executeGetQueueUrl(params: GetQueueUrlParams): Promise<GetQueueUrlCommandOutput> {
    const client = await this.getSQSClient();
    const command = new GetQueueUrlCommand(params);
    return await client.send(command);
  }

  /**
   * Execute SendMessage command
   */
  private async executeSendMessage(params: SendMessageParams): Promise<SendMessageCommandOutput> {
    const client = await this.getSQSClient();
    const command = new SendMessageCommand(params);
    return await client.send(command);
  }

  /**
   * Execute ReceiveMessage command
   */
  private async executeReceiveMessage(params: ReceiveMessageParams): Promise<ReceiveMessageCommandOutput> {
    const client = await this.getSQSClient();
    const command = new ReceiveMessageCommand(params);
    return await client.send(command);
  }

  /**
   * Execute DeleteMessage command
   */
  private async executeDeleteMessage(params: DeleteMessageParams): Promise<DeleteMessageCommandOutput> {
    const client = await this.getSQSClient();
    const command = new DeleteMessageCommand(params);
    return await client.send(command);
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: SQSCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`SQSTool: Executing command: ${command}`);
    ui.logToOutput(`SQSTool: Command parameters: ${JSON.stringify(params)}`);

    if ("QueueUrl" in params) {
      AIHandler.Current.updateLatestResource({ type: "SQS Queue", name: params.QueueUrl });
    } else if ("QueueName" in params) {
      AIHandler.Current.updateLatestResource({ type: "SQS Queue", name: params.QueueName });
    }

    switch (command) {
      case 'ListQueues':
        return await this.executeListQueues(params as ListQueuesParams);
      
      case 'ListDeadLetterSourceQueues':
        return await this.executeListDeadLetterSourceQueues(params as ListDeadLetterSourceQueuesParams);
      
      case 'ListQueueTags':
        return await this.executeListQueueTags(params as ListQueueTagsParams);
      
      case 'GetQueueAttributes':
        return await this.executeGetQueueAttributes(params as GetQueueAttributesParams);
      
      case 'GetQueueUrl':
        return await this.executeGetQueueUrl(params as GetQueueUrlParams);
      
      case 'SendMessage':
        return await this.executeSendMessage(params as SendMessageParams);
      
      case 'ReceiveMessage':
        return await this.executeReceiveMessage(params as ReceiveMessageParams);
      
      case 'DeleteMessage':
        return await this.executeDeleteMessage(params as DeleteMessageParams);
      
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SQSToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`SQSTool: Executing ${command} with params: ${JSON.stringify(params)}`);

      if (needsConfirmation(command)) {
        const ok = await confirmProceed(command);
        if (!ok) {
          const cancelled = { success: false, command, message: 'User cancelled action command' };
          return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(cancelled, null, 2))
          ]);
        }
      }

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

      ui.logToOutput(`SQSTool: ${command} completed successfully`);
      
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

      ui.logToOutput(`SQSTool: ${command} failed`, error);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
