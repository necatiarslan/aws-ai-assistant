import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { TestAwsConnectionTool } from './TestAwsConnectionTool';

export function Register(context: vscode.ExtensionContext) {
    const tools: Array<{ name: string; instance: vscode.LanguageModelTool<any> }> = [
            { name: 'sts_testAwsConnection', instance: new TestAwsConnectionTool() },
    ];

    for (const tool of tools) {
        const registration = vscode.lm.registerTool(tool.name, tool.instance);
        context.subscriptions.push(registration);
    }

    ui.logToOutput('STS Language model tools registered');
}