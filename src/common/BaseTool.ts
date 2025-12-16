import * as vscode from 'vscode';
import * as ui from './UI';
import { needsConfirmation, confirmProceed } from './ActionGuard';
import { AIHandler } from '../chat/AIHandler';

export interface BaseToolInput {
    command: string;
    params: Record<string, any>;
}

export abstract class BaseTool<TInput extends BaseToolInput> implements vscode.LanguageModelTool<TInput> {
    
    /**
     * Name of the tool for logging purposes (e.g., 'S3Tool')
     */
    protected abstract readonly toolName: string;

    /**
     * Execute the specific command logic.
     */
    protected abstract executeCommand(command: string, params: Record<string, any>): Promise<any>;

    /**
     * Optional: Update latest resource for chat context.
     * Override this to provide specific resource info.
     */
    protected updateResourceContext(command: string, params: Record<string, any>): void {
        // Default implementation does nothing
    }

    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<TInput>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        const { command, params } = options.input;

        try {
            ui.logToOutput(`${this.toolName}: Executing ${command} with params: ${JSON.stringify(params)}`);

            if (needsConfirmation(command)) {
                const ok = await confirmProceed(command);
                if (!ok) {
                    const cancelled = { success: false, command, message: 'User cancelled action command' };
                    return new vscode.LanguageModelToolResult([
                        new vscode.LanguageModelTextPart(JSON.stringify(cancelled, null, 2))
                    ]);
                }
            }

            // Update chat context if needed
            this.updateResourceContext(command, params);

            // Execute the command
            const result = await this.executeCommand(command, params);

            // Build success response
            const response = {
                success: true,
                command,
                message: `${command} executed successfully`,
                data: result,
                metadata: {
                    requestId: result?.$metadata?.requestId,
                    httpStatusCode: result?.$metadata?.httpStatusCode,
                }
            };

            ui.logToOutput(`${this.toolName}: ${command} completed successfully`);

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

            ui.logToOutput(`${this.toolName}: ${command} failed`, error);

            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
            ]);
        }
    }
}
