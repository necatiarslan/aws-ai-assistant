import * as vscode from 'vscode';
import * as ui from '../common/UI';
import * as s3API from './API';

interface ToolConfig<Input, CommandInput> {
  name: string;
  required?: (keyof Input)[];
  buildInput: (input: Input) => CommandInput;
  commandCtor: new (input: CommandInput) => any;
}

// Factory to reduce boilerplate for S3 language model tools
export function createS3Tool<Input extends Record<string, any>, CommandInput>(
  config: ToolConfig<Input, CommandInput>
): { new(): vscode.LanguageModelTool<Input> } {
  return class implements vscode.LanguageModelTool<Input> {
    async invoke(
      options: vscode.LanguageModelToolInvocationOptions<Input>,
      token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
      const input = (options.input || {}) as Input;
      const required = config.required || [];
      const missing = required.filter((key) => !input[key]);

      if (missing.length > 0) {
        const message = `${config.name}: Missing required parameter(s): ${missing.join(', ')}`;
        ui.showErrorMessage(message, undefined);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            JSON.stringify({ success: false, message }, null, 2)
          )
        ]);
      }

      try {
        const s3 = await s3API.GetS3Client();
        const command = new config.commandCtor(config.buildInput(input));
        const response = await s3.send(command);

        ui.logToOutput(`${config.name}: Success`);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            JSON.stringify({ success: true, data: response }, null, 2)
          )
        ]);
      } catch (error: any) {
        const errorMessage = `${config.name}: Error`;
        ui.logToOutput(errorMessage, error);
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(
            JSON.stringify(
              { success: false, message: error?.message || 'Unknown error' },
              null,
              2
            )
          )
        ]);
      }
    }
  };
}
