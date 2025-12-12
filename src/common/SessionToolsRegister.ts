import * as vscode from 'vscode';
import { GetSessionTool } from './GetSessionTool';
import { SetAwsRegionTool } from './SetAwsRegionTool';
import { SetAwsProfileTool } from './SetAwsProfileTool';
import { SetAwsEndpointTool } from './SetAwsEndpointTool';

export function Register(context: vscode.ExtensionContext) {

    const tools: Array<{ name: string; instance: vscode.LanguageModelTool<any> }> = [
      { name: 'session_getSession', instance: new GetSessionTool() },
      { name: 'session_setAwsRegion', instance: new SetAwsRegionTool() },
      { name: 'session_setAwsProfile', instance: new SetAwsProfileTool() },
      { name: 'session_setAwsEndpoint', instance: new SetAwsEndpointTool() },
    ];

    for (const tool of tools) {
      const registration = vscode.lm.registerTool(tool.name, tool.instance);
      context.subscriptions.push(registration);
    }
}

