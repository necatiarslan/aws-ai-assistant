import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import * as fs from 'fs';
import * as path from 'path';
import * as MessageHub from '../common/MessageHub';

const PARTICIPANT_ID = 'aws-ai-assistant.chat';
const DEFAULT_PROMPT = "How can I assist you with AWS today?";

export class AIHandler {
  public static Current: AIHandler;

  private latestResource: { [type: string]: { type: string; name: string; arn?: string } } = {};
  private latestResponse: string = '';
  private paginationContext: { toolName: string; command: string; params: any; paginationToken: string; tokenType: string } | null = null;

  constructor() {
    AIHandler.Current = this;
    this.registerChatParticipant();
  }

  public updateLatestResource(resource: { type: string; name: string; arn?: string }): void {
    this.latestResource[resource.type] = resource;
  }

  public registerChatParticipant(): void {
    const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, this.aIHandler.bind(AIHandler.Current));
    if(!Session.Current){ return; }

    const context: vscode.ExtensionContext = Session.Current?.Context
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'extension', 'chat-icon.png');
    context.subscriptions.push(participant);
  }

  public async aIHandler(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    MessageHub.StartWorking();

    let workingEnded = false;
    const endWorkingOnce = () => {
      if (workingEnded) {
        return;
      }
      workingEnded = true;
      MessageHub.EndWorking();
    };
    const cancelListener = token.onCancellationRequested(endWorkingOnce);

    try {
      const tools: vscode.LanguageModelChatTool[] = this.getToolsFromPackageJson();
      const messages: vscode.LanguageModelChatMessage[] = this.buildInitialMessages(request);
      const usedAppreciated = request.prompt.toLowerCase().includes('thank');
      const defaultPromptUsed = request.prompt === DEFAULT_PROMPT;

      const [model] = await vscode.lm.selectChatModels();
      if (!model) {
        stream.markdown('No suitable AI model found.');
        endWorkingOnce();
        return;
      }
      ui.logToOutput(`AIHandler: Using model ${model.family} (${model.name})`);
      
      await this.runToolCallingLoop(model, messages, tools, stream, token);
      this.renderResponseButtons(stream);
      
      if (usedAppreciated || defaultPromptUsed) {
        this.renderAppreciationMessage(stream);
      }
      endWorkingOnce();
    } catch (err) {
      this.handleError(err, stream);
      endWorkingOnce();
    } finally {
      cancelListener.dispose();
    }
  }

  private buildInitialMessages(request: vscode.ChatRequest): vscode.LanguageModelChatMessage[] {
    const messages: vscode.LanguageModelChatMessage[] = [
      vscode.LanguageModelChatMessage.User(
        `You are an expert in Amazon Web Services (AWS). You have access to tools to perform various AWS operations. Use the available tools when appropriate to help the user.
        Don't provide JSON responses unless specifically asked. Always format your responses in markdown.
        Previous Response: ${this.latestResponse || 'N/A'}`
      )
    ];

    if (Session.Current) {
      const contextInfo = `Context:\nAWS Profile: ${Session.Current.AwsProfile || 'N/A'}\nAWS Region: ${Session.Current.AwsRegion || 'N/A'}\nAWS Endpoint: ${Session.Current.AwsEndPoint || 'default'}`;
      messages.push(vscode.LanguageModelChatMessage.User(contextInfo));
    }

    for (const resource of Object.values(this.latestResource)) {
      const resourceInfo: string = `You have recently worked with the following AWS resource: Type=${resource.type} Name=${resource.name}` + (resource.arn ? `, ARN=${resource.arn}` : '');
      messages.push(vscode.LanguageModelChatMessage.User(resourceInfo));
    }

    messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
    return messages;
  }

  private async runToolCallingLoop(
    model: vscode.LanguageModelChat,
    messages: vscode.LanguageModelChatMessage[],
    tools: vscode.LanguageModelChatTool[],
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    let keepGoing = true;
    while (keepGoing && !token.isCancellationRequested) {
      keepGoing = false;

      const chatResponse = await model.sendRequest(messages, { tools }, token);
      const toolCalls = await this.collectToolCalls(chatResponse, stream);

      if (toolCalls.length > 0) {
        keepGoing = true;
        messages.push(vscode.LanguageModelChatMessage.Assistant(toolCalls));
        await this.executeToolCalls(toolCalls, messages, stream, token);
      }
    }
  }

  private async collectToolCalls(
    chatResponse: vscode.LanguageModelChatResponse,
    stream: vscode.ChatResponseStream
  ): Promise<vscode.LanguageModelToolCallPart[]> {
    // Stream the markdown response
    for await (const fragment of chatResponse.text) {
      stream.markdown(fragment);
    }

    // Collect tool calls from the response
    const toolCalls: vscode.LanguageModelToolCallPart[] = [];
    for await (const part of chatResponse.stream) {
      if (part instanceof vscode.LanguageModelToolCallPart) {
        toolCalls.push(part);
      }
    }
    return toolCalls;
  }

  private async executeToolCalls(
    toolCalls: vscode.LanguageModelToolCallPart[],
    messages: vscode.LanguageModelChatMessage[],
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    for (const toolCall of toolCalls) {
      stream.progress(`Calling : ${toolCall.name}`);
      ui.logToOutput(`AIHandler: Invoking tool ${toolCall.name} with input: ${JSON.stringify(toolCall.input)}`);

      MessageHub.StartAwsCommand();
      try {
        const result = await vscode.lm.invokeTool(
          toolCall.name,
          { input: toolCall.input } as any,
          token
        );

        const resultText = this.extractResultText(result);
        this.latestResponse = resultText;
        this.checkForPaginationToken(resultText, toolCall);
        
        messages.push(
          vscode.LanguageModelChatMessage.User([
            new vscode.LanguageModelToolResultPart(
              toolCall.callId,
              [new vscode.LanguageModelTextPart(resultText)]
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
      } finally {
        MessageHub.StartWorking();
      }
    }
  }

  private extractResultText(result: vscode.LanguageModelToolResult): string {
    return result.content
      .filter(part => part instanceof vscode.LanguageModelTextPart)
      .map(part => (part as vscode.LanguageModelTextPart).value)
      .join('\n');
  }

  private checkForPaginationToken(resultText: string, toolCall: vscode.LanguageModelToolCallPart): void {
    try {
      const parsedResponse = JSON.parse(resultText);
      if (parsedResponse?.pagination?.hasMore) {
        const pagination = parsedResponse.pagination;
        const tokenType = Object.keys(pagination).find(k => k.endsWith('Token') && k !== 'hasMore');
        if (tokenType && pagination[tokenType]) {
          const input = toolCall.input as any;
          this.paginationContext = {
            toolName: toolCall.name,
            command: input.command,
            params: input.params || {},
            paginationToken: pagination[tokenType],
            tokenType: tokenType
          };
        }
      }
    } catch (parseErr) {
      // If response is not JSON, ignore pagination detection
    }
  }

  private renderResponseButtons(stream: vscode.ChatResponseStream): void {
    this.renderCloudWatchButton(stream);
    this.renderS3Button(stream);
    this.renderPaginationButton(stream);
  }

  private renderCloudWatchButton(stream: vscode.ChatResponseStream): void {
    if (!this.latestResource["CloudWatch Log Group"]) {
      return;
    }

    const logGroup = this.latestResource["CloudWatch Log Group"].name;
    const logStream = this.latestResource["CloudWatch Log Stream"]?.name;
    
    stream.markdown("\n\n");
    stream.button({
      command: 'aws-ai-assistant.OpenCloudWatchView',
      title: 'Open Log View',
      arguments: logStream ? [logGroup, logStream] : [logGroup]
    });
  }

  private renderS3Button(stream: vscode.ChatResponseStream): void {
    if (!this.latestResource["S3 Bucket"]) {
      return;
    }

    const bucket = this.latestResource["S3 Bucket"].name;
    stream.markdown("\n\n");
    stream.button({
      command: 'aws-ai-assistant.OpenS3ExplorerView',
      title: 'Open S3 View',
      arguments: [bucket]
    });
  }

  private renderPaginationButton(stream: vscode.ChatResponseStream): void {
    if (!this.paginationContext) {
      return;
    }

    stream.markdown("\n\n");
    stream.button({
      command: 'aws-ai-assistant.LoadMoreResults',
      title: 'Load More',
      arguments: [this.paginationContext]
    });
  }

  private renderAppreciationMessage(stream: vscode.ChatResponseStream): void {
    stream.markdown("\n\n\n");
    stream.markdown("\n🙏 [Donate](https://github.com/sponsors/necatiarslan) if you found me useful!");
    stream.markdown("\n🤔 [New Feature](https://github.com/necatiarslan/aws-ai-assistant/issues/new) Request");
  }

  private handleError(err: unknown, stream: vscode.ChatResponseStream): void {
    if (err instanceof Error) {
      stream.markdown(`I'm sorry, I couldn't connect to the AI model: ${err.message}`);
    } else {
      stream.markdown("I'm sorry, I couldn't connect to the AI model.");
    }
    stream.markdown("\n🪲 Please [Report an Issue](https://github.com/necatiarslan/aws-ai-assistant/issues/new)");
  }

  public async isChatCommandAvailable(): Promise<boolean> {
    const commands = await vscode.commands.getCommands(true); // 'true' includes internal commands
    return commands.includes('workbench.action.chat.open');
  }

  public async askAI(prompt?: string): Promise<void> {
    ui.logToOutput('AIHandler.askAI Started');

    if (!await this.isChatCommandAvailable()) {
      ui.showErrorMessage(
        'Chat command is not available. Please ensure you have access to VS Code AI features.',
        undefined
      );
      return;
    }

    const commandId = this.getCommandIdForEnvironment();
    await vscode.commands.executeCommand(commandId, {
      query: '@aws ' + (prompt || DEFAULT_PROMPT)
    });
  }

  private getCommandIdForEnvironment(): string {
    const appName = vscode.env.appName;

    if (appName.includes('Antigravity')) {
      return 'antigravity.startAgentTask';
    } else if (appName.includes('Code - OSS') || appName.includes('Visual Studio Code')) {
      return 'workbench.action.chat.open';
    }
    
    return 'workbench.action.chat.open';
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
