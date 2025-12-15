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
  GetBucketNotificationConfigurationCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadBucketCommandOutput,
  HeadObjectCommandOutput,
  ListBucketsCommandOutput,
  ListObjectsV2CommandOutput,
  ListObjectVersionsCommandOutput,
  GetBucketPolicyCommandOutput,
  GetBucketNotificationConfigurationCommandOutput,
  GetObjectCommandOutput,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  CopyObjectCommandOutput,
  MetadataDirective
} from '@aws-sdk/client-s3';
import { AIHandler } from '../chat/AIHandler';
import { needsConfirmation, confirmProceed } from '../common/ActionGuard';
import { S3Explorer } from './S3Explorer';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// Cached client
let CurrentS3Client: S3Client | undefined;

// Command type definition
type S3Command = 
  | 'PutObject'
  | 'DeleteObject'
  | 'CopyObject'
  | 'GetObject'
  | 'HeadBucket'
  | 'HeadObject'
  | 'ListBuckets'
  | 'ListObjectsV2'
  | 'ListObjectVersions'
  | 'GetBucketPolicy'
  | 'GetBucketNotificationConfiguration'
  | 'OpenS3Explorer';

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

interface GetBucketNotificationConfigurationParams {
  Bucket: string;
}

interface GetObjectParams {
  Bucket: string;
  Key: string;
  VersionId?: string;
  DownloadToTemp?: boolean; // If true, download to temp folder and return path
  AsText?: boolean; // If true, return content as text for analysis
}

interface OpenS3ExplorerParams {
  Bucket: string;
  Key?: string; // Optional file/folder path or key
}

export class S3Tool implements vscode.LanguageModelTool<S3ToolInput> {
  /**
   * Get S3 Client with session configuration
   */
  private async getS3Client(): Promise<S3Client> {
    if (CurrentS3Client !== undefined) {
      return CurrentS3Client;
    }

    const credentials = await Session.Current?.GetCredentials();

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
   * Execute GetBucketNotificationConfiguration command
   */
  private async executeGetBucketNotificationConfiguration(params: GetBucketNotificationConfigurationParams): Promise<GetBucketNotificationConfigurationCommandOutput> {
    const client = await this.getS3Client();
    const command = new GetBucketNotificationConfigurationCommand(params);
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
   * Execute GetObject command
   */
  private async executeGetObject(params: GetObjectParams): Promise<any> {
    const client = await this.getS3Client();
    const command = new GetObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key,
      VersionId: params.VersionId
    });
    const result = await client.send(command);

    // Convert body stream to buffer
    const bodyBuffer = await this.streamToBuffer(result.Body as any);

    // Extract only serializable metadata
    const metadata = {
      ContentType: result.ContentType,
      ContentLength: result.ContentLength,
      ETag: result.ETag,
      LastModified: result.LastModified,
      VersionId: result.VersionId,
      Metadata: result.Metadata,
      $metadata: {
        httpStatusCode: result.$metadata?.httpStatusCode,
        requestId: result.$metadata?.requestId,
      }
    };

    if (params.DownloadToTemp) {
      // Download to temp folder
      const tempDir = os.tmpdir();
      const fileName = path.basename(params.Key);
      const filePath = path.join(tempDir, fileName);
      fs.writeFileSync(filePath, bodyBuffer);
      
      return {
        ...metadata,
        LocalPath: filePath,
        FileSize: bodyBuffer.length,
        Message: `File downloaded to ${filePath}`
      };
    } else if (params.AsText) {
      // Return content as text
      const textContent = bodyBuffer.toString('utf-8');
      return {
        ...metadata,
        TextContent: textContent,
        ContentLength: textContent.length
      };
    } else {
      // Return metadata with base64 content
      return {
        ...metadata,
        Body: bodyBuffer.toString('base64'),
        ContentLength: bodyBuffer.length,
        Message: 'File content returned as base64'
      };
    }
  }

  /**
   * Execute OpenS3Explorer command - Opens S3Explorer view
   */
  private async executeOpenS3Explorer(params: OpenS3ExplorerParams): Promise<any> {
    if (!Session.Current) {
      throw new Error('Session not initialized');
    }

    // Open the S3Explorer view
    S3Explorer.Render(Session.Current.ExtensionUri, params.Bucket, params.Key);

    return {
      success: true,
      message: `S3 Explorer opened for bucket: ${params.Bucket}${params.Key ? `, key: ${params.Key}` : ''}`,
      Bucket: params.Bucket,
      Key: params.Key
    };
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
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

      case 'GetBucketNotificationConfiguration':
        return await this.executeGetBucketNotificationConfiguration(params as GetBucketNotificationConfigurationParams);
      
      case 'GetObject':
        return await this.executeGetObject(params as GetObjectParams);
      
      case 'PutObject':
        return await this.executePutObject(params as PutObjectParams);
      
      case 'DeleteObject':
        return await this.executeDeleteObject(params as DeleteObjectParams);
      
      case 'CopyObject':
        return await this.executeCopyObject(params as CopyObjectParams);
      
      case 'OpenS3Explorer':
        return await this.executeOpenS3Explorer(params as OpenS3ExplorerParams);
      
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
