import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { MethodResult } from '../common/MethodResult';
import { Session } from '../common/Session';
import { 
  S3Client, 
  HeadBucketCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  GetBucketPolicyCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadBucketCommandOutput,
  HeadObjectCommandOutput,
  ListBucketsCommandOutput,
  ListObjectsV2CommandOutput,
  ListObjectVersionsCommandOutput,
  GetBucketPolicyCommandOutput,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  CopyObjectCommandOutput,
  MetadataDirective
} from '@aws-sdk/client-s3';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AIHandler } from '../chat/AIHandler';

// Cached credentials and client
let CurrentCredentials: AwsCredentialIdentity | undefined;
let CurrentS3Client: S3Client | undefined;

// Command type definition
type S3Command = 
  | 'PutObject'
  | 'DeleteObject'
  | 'CopyObject'
  | 'HeadBucket'
  | 'HeadObject'
  | 'ListBuckets'
  | 'ListObjectsV2'
  | 'ListObjectVersions'
  | 'GetBucketPolicy';

// Input interface - command + params object
interface S3ToolInput {
  command: S3Command;
  params: Record<string, any>;
}

// Command parameter interfaces for type safety
interface HeadBucketParams {
  Bucket: string;
}

interface HeadObjectParams {
  Bucket: string;
  Key: string;
  VersionId?: string;
  IfMatch?: string;
  IfModifiedSince?: Date;
  IfNoneMatch?: string;
  IfUnmodifiedSince?: Date;
}

interface ListBucketsParams {
  // ListBuckets has no required parameters
}

interface ListObjectsV2Params {
  Bucket: string;
  Prefix?: string;
  Delimiter?: string;
  MaxKeys?: number;
  ContinuationToken?: string;
  StartAfter?: string;
}

interface ListObjectVersionsParams {
  Bucket: string;
  Prefix?: string;
  Delimiter?: string;
  MaxKeys?: number;
  KeyMarker?: string;
  VersionIdMarker?: string;
}


interface PutObjectParams {
  Bucket: string;
  Key: string;
  Body?: string; // File content as string or base64
  ContentType?: string;
  Metadata?: Record<string, string>;
}

interface DeleteObjectParams {
  Bucket: string;
  Key: string;
  VersionId?: string;
}

interface CopyObjectParams {
  Bucket: string;
  CopySource: string;
  Key: string;
  Metadata?: Record<string, string>;
  MetadataDirective?: MetadataDirective;
}
interface GetBucketPolicyParams {
  Bucket: string;
}

export class S3Tool implements vscode.LanguageModelTool<S3ToolInput> {
  
  /**
   * Get AWS credentials with caching
   */
  private async getCredentials(): Promise<AwsCredentialIdentity | undefined> {
    if (CurrentCredentials !== undefined) {
      ui.logToOutput(`S3Tool: Using cached credentials (AccessKeyId=${CurrentCredentials.accessKeyId})`);
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

      ui.logToOutput(`S3Tool: Credentials loaded (AccessKeyId=${CurrentCredentials.accessKeyId})`);
      return CurrentCredentials;
    } catch (error: any) {
      ui.logToOutput('S3Tool: Failed to get credentials', error);
      throw error;
    }
  }

  /**
   * Get S3 Client with session configuration
   */
  private async getS3Client(): Promise<S3Client> {
    if (CurrentS3Client !== undefined) {
      return CurrentS3Client;
    }

    const credentials = await this.getCredentials();

    CurrentS3Client = new S3Client({
      credentials,
      endpoint: Session.Current?.AwsEndPoint,
      forcePathStyle: true,
      region: Session.Current?.AwsRegion,
    });

    ui.logToOutput(`S3Tool: S3 client created (region=${Session.Current?.AwsRegion})`);
    return CurrentS3Client;
  }

  /**
   * Execute HeadBucket command
   */
  private async executeHeadBucket(params: HeadBucketParams): Promise<HeadBucketCommandOutput> {
    const client = await this.getS3Client();
    const command = new HeadBucketCommand(params);
    return await client.send(command);
  }

  /**
   * Execute HeadObject command
   */
  private async executeHeadObject(params: HeadObjectParams): Promise<HeadObjectCommandOutput> {
    const client = await this.getS3Client();
    const command = new HeadObjectCommand(params);
    return await client.send(command);
  }

  /**
   * Execute ListBuckets command
   */
  private async executeListBuckets(params: ListBucketsParams): Promise<ListBucketsCommandOutput> {
    const client = await this.getS3Client();
    const command = new ListBucketsCommand(params);
    return await client.send(command);
  }

  /**
   * Execute ListObjectsV2 command
   */
  private async executeListObjectsV2(params: ListObjectsV2Params): Promise<ListObjectsV2CommandOutput> {
    const client = await this.getS3Client();
    const command = new ListObjectsV2Command(params);
    return await client.send(command);
  }

  /**
   * Execute ListObjectVersions command
   */
  private async executeListObjectVersions(params: ListObjectVersionsParams): Promise<ListObjectVersionsCommandOutput> {
    const client = await this.getS3Client();
    const command = new ListObjectVersionsCommand(params);
    return await client.send(command);
  }

  /**
   * Execute GetBucketPolicy command
   */
  private async executeGetBucketPolicy(params: GetBucketPolicyParams): Promise<GetBucketPolicyCommandOutput> {
    const client = await this.getS3Client();
    const command = new GetBucketPolicyCommand(params);
    return await client.send(command);
  }

  /**
   * Execute PutObject command
   */
  private async executePutObject(params: PutObjectParams): Promise<PutObjectCommandOutput> {
    const client = await this.getS3Client();
    const command = new PutObjectCommand(params);
    return await client.send(command);
  }

  /**
   * Execute DeleteObject command
   */
  private async executeDeleteObject(params: DeleteObjectParams): Promise<DeleteObjectCommandOutput> {
    const client = await this.getS3Client();
    const command = new DeleteObjectCommand(params);
    return await client.send(command);
  }

  /**
   * Execute CopyObject command
   */
  private async executeCopyObject(params: CopyObjectParams): Promise<CopyObjectCommandOutput> {
    const client = await this.getS3Client();
    const command = new CopyObjectCommand(params);
    return await client.send(command);
  }

  /**
   * Main command dispatcher - easily extensible
   */
  private async executeCommand(command: S3Command, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`S3Tool: Executing command: ${command}`);
    ui.logToOutput(`S3Tool: Command parameters: ${JSON.stringify(params)}`);

    if ("Bucket" in params) {
      AIHandler.Current.updateLatestResource({ type: "S3 Bucket", name: params.Bucket });
    }

    switch (command) {
      case 'HeadBucket':
        return await this.executeHeadBucket(params as HeadBucketParams);
      
      case 'HeadObject':
        return await this.executeHeadObject(params as HeadObjectParams);
      
      case 'ListBuckets':
        return await this.executeListBuckets(params as ListBucketsParams);
      
      case 'ListObjectsV2':
        return await this.executeListObjectsV2(params as ListObjectsV2Params);
      
      case 'ListObjectVersions':
        return await this.executeListObjectVersions(params as ListObjectVersionsParams);
      
      case 'GetBucketPolicy':
        return await this.executeGetBucketPolicy(params as GetBucketPolicyParams);
      
      case 'PutObject':
        return await this.executePutObject(params as PutObjectParams);
      
      case 'DeleteObject':
        return await this.executeDeleteObject(params as DeleteObjectParams);
      
      case 'CopyObject':
        return await this.executeCopyObject(params as CopyObjectParams);
      
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<S3ToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`S3Tool: Executing ${command} with params: ${JSON.stringify(params)}`);

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

      ui.logToOutput(`S3Tool: ${command} completed successfully`);
      
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

      ui.logToOutput(`S3Tool: ${command} failed`, error);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
