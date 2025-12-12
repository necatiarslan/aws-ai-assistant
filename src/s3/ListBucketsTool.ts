import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import * as s3API from '../s3/API';

interface ListBucketsInput {
  bucketName?: string;
}

export class ListBucketsTool implements vscode.LanguageModelTool<ListBucketsInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<ListBucketsInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      const bucketName = options.input?.bucketName;
      const awsProfile = Session.Current?.AwsProfile || 'default';
      const awsRegion = Session.Current?.AwsRegion || 'us-east-1';

      ui.logToOutput(`ListBucketsTool: Fetching buckets list (profile=${awsProfile}, region=${awsRegion}, bucketName=${bucketName || 'all'})`);

      const result = await s3API.GetBucketList(bucketName);
      
      if (result.isSuccessful) {
        const response = {
          success: true,
          message: 'Buckets list retrieved successfully',
          profile: awsProfile,
          region: awsRegion,
          buckets: result.result,
          count: result.result?.length || 0
        };
        ui.logToOutput(`ListBucketsTool: Successfully retrieved ${response.count} bucket(s)`);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
        ]);
      } else {
        const errorResponse = {
          success: false,
          message: 'Failed to retrieve buckets list',
          error: result.error?.message || 'Unknown error',
          profile: awsProfile,
          region: awsRegion
        };
        ui.logToOutput('ListBucketsTool: Failed to retrieve buckets list', result.error);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
        ]);
      }
    } catch (error: any) {
      const errorResponse = {
        success: false,
        message: 'Error while listing buckets',
        error: error?.message || 'Unknown error'
      };
      ui.logToOutput('ListBucketsTool: Error while listing buckets', error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
