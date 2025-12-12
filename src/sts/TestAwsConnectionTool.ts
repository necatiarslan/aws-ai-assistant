import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import * as stsAPI from '../sts/API';

interface TestAwsConnectionInput {
  region?: string;
}

export class TestAwsConnectionTool implements vscode.LanguageModelTool<TestAwsConnectionInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<TestAwsConnectionInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      // Get region from session if not provided in input
      const region = options.input?.region || Session.Current?.AwsRegion || 'us-east-1';
      const awsProfile = Session.Current?.AwsProfile || 'default';
      const awsEndpoint = Session.Current?.AwsEndPoint || 'default';

      ui.logToOutput(`TestAwsConnection: Testing AWS connectivity (profile=${awsProfile}, region=${region}, endpoint=${awsEndpoint})`);

      const result = await stsAPI.TestAwsConnection(region);
      
      if (result.isSuccessful) {
        const response = {
          success: true,
          message: 'AWS connectivity test successful',
          profile: awsProfile,
          region: region,
          endpoint: awsEndpoint
        };
        ui.logToOutput('TestAwsConnection: AWS connectivity test successful');
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
        ]);
      } else {
        const errorResponse = {
          success: false,
          message: 'AWS connectivity test failed',
          error: result.error?.message || 'Unknown error',
          profile: awsProfile,
          region: region,
          endpoint: awsEndpoint
        };
        ui.logToOutput('TestAwsConnection: AWS connectivity test failed', result.error);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
        ]);
      }
    } catch (error: any) {
      ui.logToOutput('TestAwsConnection: Error', error);
      const errorResponse = {
        success: false,
        message: 'Error executing TestAwsConnection tool',
        error: error.message || 'Unknown error'
      };
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
