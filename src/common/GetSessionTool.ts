import * as vscode from 'vscode';
import * as ui from './UI';
import { Session } from './Session';

interface GetSessionInput {}

export class GetSessionTool implements vscode.LanguageModelTool<GetSessionInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<GetSessionInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      ui.logToOutput('GetSessionTool: Fetching current session');

      const response = {
        success: true,
        message: 'Current session information',
        awsProfile: Session.Current?.AwsProfile || 'default',
        awsRegion: Session.Current?.AwsRegion || 'us-east-1',
        awsEndpoint: Session.Current?.AwsEndPoint || 'default (AWS)',
      };

      ui.logToOutput('GetSessionTool: Session retrieved successfully');
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errorResponse = {
        success: false,
        message: 'Error retrieving session information',
        error: error?.message || 'Unknown error'
      };
      ui.logToOutput('GetSessionTool: Error', error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
