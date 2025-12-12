import * as vscode from 'vscode';
import * as ui from './UI';
import { Session } from './Session';

interface SetAwsProfileInput {
  profile: string;
}

export class SetAwsProfileTool implements vscode.LanguageModelTool<SetAwsProfileInput> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SetAwsProfileInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    try {
      const profile = options.input?.profile;

      if (!profile || profile.trim().length === 0) {
        const errorResponse = {
          success: false,
          message: 'Profile parameter is required'
        };
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
        ]);
      }

      ui.logToOutput(`SetAwsProfileTool: Setting profile to ${profile}`);

      if (!Session.Current) {
        throw new Error('Session not initialized');
      }

      Session.Current.AwsProfile = profile.trim();
      Session.Current.SaveState();

      const response = {
        success: true,
        message: 'AWS profile updated successfully',
        awsProfile: Session.Current.AwsProfile,
        note: 'Credentials cache has been cleared'
      };

      ui.logToOutput(`SetAwsProfileTool: Profile set to ${Session.Current.AwsProfile}`);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errorResponse = {
        success: false,
        message: 'Error setting AWS profile',
        error: error?.message || 'Unknown error'
      };
      ui.logToOutput('SetAwsProfileTool: Error', error);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
