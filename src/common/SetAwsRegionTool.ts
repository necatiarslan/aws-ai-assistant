import * as vscode from 'vscode';
import * as ui from './UI';
import { Session } from './Session';

interface SetAwsRegionInput {
  region: string;
}

export class SetAwsRegionTool implements vscode.LanguageModelTool<SetAwsRegionInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SetAwsRegionInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      const region = options.input?.region;

      if (!region || region.trim().length === 0) {
        const errorResponse = {
          success: false,
          message: 'Region parameter is required'
        };
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
        ]);
      }

      ui.logToOutput(`SetAwsRegionTool: Setting region to ${region}`);

      if (!Session.Current) {
        throw new Error('Session not initialized');
      }

      Session.Current.AwsRegion = region.trim();
      Session.Current.SaveState();

      const response = {
        success: true,
        message: 'AWS region updated successfully',
        awsRegion: Session.Current.AwsRegion
      };

      ui.logToOutput(`SetAwsRegionTool: Region set to ${Session.Current.AwsRegion}`);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errorResponse = {
        success: false,
        message: 'Error setting AWS region',
        error: error?.message || 'Unknown error'
      };
      ui.logToOutput('SetAwsRegionTool: Error', error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
