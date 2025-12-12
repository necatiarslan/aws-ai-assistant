import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import * as fs from 'fs';
import * as path from 'path';

const PARTICIPANT_ID = 'aws-ai-assistant.chat';

export class AIHandler {
  public static Current: AIHandler;

  constructor() {
    AIHandler.Current = this;
    this.registerChatParticipant();
  }

  
  public registerChatParticipant(): void {
    const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, this.aIHandler.bind(AIHandler.Current));
    if(!Session.Current){ return; }

    const context: vscode.ExtensionContext = Session.Current?.Context
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'aws-assistant-icon.png');
    context.subscriptions.push(participant);
  }

  public async aIHandler(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    // 1. Define the tools we want to expose to the model
    // Read directly from package.json to keep definitions in sync
    const tools: vscode.LanguageModelChatTool[] = this.getToolsFromPackageJson();

    // 2. Construct the Initial Messages
    const messages: vscode.LanguageModelChatMessage[] = [
      vscode.LanguageModelChatMessage.User(
        `You are an expert in Amazon Web Services (AWS). You have access to tools to manage S3 buckets, 
        test connectivity, and perform various AWS operations. Use the available tools when appropriate to help the user.`
      )
    ];

    // Add session context if available
    if (Session.Current) {
      const contextInfo = `Context:\nAWS Profile: ${Session.Current.AwsProfile || 'N/A'}\nAWS Region: ${Session.Current.AwsRegion || 'N/A'}\nAWS Endpoint: ${Session.Current.AwsEndPoint || 'default'}`;
      messages.push(vscode.LanguageModelChatMessage.User(contextInfo));
    }

    messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

    // 3. Select Model and Send Request
    try {
      const [model] = await vscode.lm.selectChatModels();
      if (!model) {
        stream.markdown('No suitable AI model found.');
        return;
      }

      // Tool calling loop
      let keepGoing = true;
      while (keepGoing && !token.isCancellationRequested) {
        keepGoing = false; // Default to stop unless we get a tool call

        const chatResponse = await model.sendRequest(messages, { tools }, token);
        let toolCalls: vscode.LanguageModelToolCallPart[] = [];

        // Stream the markdown response
        for await (const fragment of chatResponse.text) {
          stream.markdown(fragment);
        }

        // Collect tool calls from the response
        for await (const part of chatResponse.stream) {
          if (part instanceof vscode.LanguageModelToolCallPart) {
            toolCalls.push(part);
          }
        }

        // Execute tools if any were called
        if (toolCalls.length > 0) {
          keepGoing = true; // We need to send results back to the model

          // Add the model's response (including tool calls) to history
          messages.push(
            vscode.LanguageModelChatMessage.Assistant(toolCalls)
          );

          for (const toolCall of toolCalls) {
            stream.progress(`Running tool: ${toolCall.name}...`);

            try {
              // Invoke the tool using VS Code LM API
              const result = await vscode.lm.invokeTool(
                toolCall.name,
                { input: toolCall.input } as any,
                token
              );

              // Convert result to string/text part
              const resultText = result.content
                .filter(
                  part => part instanceof vscode.LanguageModelTextPart
                )
                .map(part => (part as vscode.LanguageModelTextPart).value)
                .join('\n');

              // Add result to history
              messages.push(
                vscode.LanguageModelChatMessage.User([
                  new vscode.LanguageModelToolResultPart(
                    toolCall.callId,
                    [
                      new vscode.LanguageModelTextPart(resultText)
                    ]
                  )
                ])
              );
            } catch (err) {
              const errorMessage = `Tool execution failed: ${
                err instanceof Error ? err.message : String(err)
              }`;
              messages.push(
                vscode.LanguageModelChatMessage.User([
                  new vscode.LanguageModelToolResultPart(
                    toolCall.callId,
                    [new vscode.LanguageModelTextPart(errorMessage)]
                  )
                ])
              );
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        stream.markdown(
          `I'm sorry, I couldn't connect to the AI model: ${err.message}`
        );
      } else {
        stream.markdown(
          "I'm sorry, I couldn't connect to the AI model."
        );
      }
    }
  }

  public async isChatCommandAvailable(): Promise<boolean> {
    const commands = await vscode.commands.getCommands(true); // 'true' includes internal commands
    return commands.includes('workbench.action.chat.open');
  }

  public async askAI(): Promise<void> {
    ui.logToOutput('AIHandler.askAI Started');

    if (!await this.isChatCommandAvailable()) {
      ui.showErrorMessage(
        'Chat command is not available. Please ensure you have access to VS Code AI features.',
        undefined
      );
      return;
    }

    const appName = vscode.env.appName;
    let commandId = '';

    if (appName.includes('Antigravity')) {
      // Antigravity replaces the Chat with an Agent workflow
      commandId = 'antigravity.startAgentTask';
    } else if (
      appName.includes('Code - OSS') ||
      appName.includes('Visual Studio Code')
    ) {
      // This is standard VS Code or VSCodium
      commandId = 'workbench.action.chat.open';
    } else {
      // Unknown environment, default to standard Chat command
      commandId = 'workbench.action.chat.open';
    }

    await vscode.commands.executeCommand(commandId, {
      query: '@aws Help me with AWS tasks'
    });
  }

  private getToolsFromPackageJson(): vscode.LanguageModelChatTool[] {
    try {
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const raw = fs.readFileSync(packageJsonPath, 'utf8');
      const pkg = JSON.parse(raw) as any;
      const lmTools = pkg?.contributes?.languageModelTools as any[] | undefined;

      if (!Array.isArray(lmTools)) {
        ui.logToOutput('AIHandler: No languageModelTools found in package.json');
        return [];
      }

      return lmTools.map((tool) => ({
        name: tool.name,
        description: tool.modelDescription || tool.userDescription || tool.displayName || 'Tool',
        inputSchema: tool.inputSchema ?? { type: 'object' }
      } satisfies vscode.LanguageModelChatTool));
    } catch (err) {
      ui.logToOutput('AIHandler: Failed to load tools from package.json', err instanceof Error ? err : undefined);
      return [];
    }
  }
}
