import * as vscode from 'vscode';
import * as ui from './UI';
import { Session } from './Session';

// Input interface
interface SessionToolInput {
  command: SessionCommand;
  params?: SessionParams;
}

type SessionCommand = 'GetSession' | 'SetSession';

interface SessionParams {
  AwsProfile?: string;
  AwsEndPoint?: string;
  AwsRegion?: string;
}

export class SessionTool implements vscode.LanguageModelTool<SessionToolInput> {
  /**
   * Entry point for the language model tool
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<SessionToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params = {} } = options.input;
    ui.logToOutput(`SessionTool invoked command: ${command}`);
    ui.logToOutput(`SessionTool params: ${JSON.stringify(params, null, 2)}`);
    
    try {
      const result = await this.execute(command, params);
      const response = {
        success: true,
        command,
        data: result,
      };

      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);
    } catch (error: any) {
      const errResp = {
        success: false,
        command,
        message: error?.message || 'Unknown error',
      };
      ui.logToOutput('SessionTool error', error instanceof Error ? error : undefined);
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errResp, null, 2))
      ]);
    }
  }

  private async execute(command: SessionCommand, params: SessionParams) {
    switch (command) {
      case 'GetSession':
        return this.getSession();
      case 'SetSession':
        return this.setSession(params);
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  private getSession() {
    if (!Session.Current) {
      throw new Error('Session not initialized');
    }
    return {
      AwsProfile: Session.Current.AwsProfile,
      AwsEndPoint: Session.Current.AwsEndPoint,
      AwsRegion: Session.Current.AwsRegion,
    };
  }

  private setSession(params: SessionParams) {
    if (!Session.Current) {
      throw new Error('Session not initialized');
    }

    if (params.AwsProfile !== undefined) {
      Session.Current.AwsProfile = params.AwsProfile || 'default';
    }
    if (params.AwsEndPoint !== undefined) {
      Session.Current.AwsEndPoint = params.AwsEndPoint || undefined;
    }
    if (params.AwsRegion !== undefined) {
      Session.Current.AwsRegion = params.AwsRegion || 'us-east-1';
    }

    Session.Current.SaveState();

    return this.getSession();
  }
}
