import * as vscode from 'vscode';
import * as ui from './UI';
import { Session } from './Session';

interface SetAwsEndpointInput {
  endpoint: string;
}

export class SetAwsEndpointTool implements vscode.LanguageModelTool<SetAwsEndpointInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SetAwsEndpointInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      const endpoint = options.input?.endpoint;

      if (!endpoint || endpoint.trim().length === 0) {
        const errorResponse = {
          success: false,
          message: 'Endpoint parameter is required'
        };
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
        ]);
      }

      ui.logToOutput(`SetAwsEndpointTool: Setting endpoint to ${endpoint}`);

      if (!Session.Current) {
        throw new Error('Session not initialized');
      }

      const trimmedEndpoint = endpoint.trim();
      Session.Current.AwsEndPoint = trimmedEndpoint || undefined;
      Session.Current.SaveState();

      const response = {
        success: true,
        message: 'AWS endpoint updated successfully',
        awsEndpoint: Session.Current.AwsEndPoint || 'default (AWS)',
        note: 'Endpoint updated for S3 API calls'
      };

      ui.logToOutput(`SetAwsEndpointTool: Endpoint set to ${Session.Current.AwsEndPoint || 'default'}`);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errorResponse = {
        success: false,
        message: 'Error setting AWS endpoint',
        error: error?.message || 'Unknown error'
      };
      ui.logToOutput('SetAwsEndpointTool: Error', error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
