import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';

export class AIHandler {
  public static Current: AIHandler;

  constructor() {
    AIHandler.Current = this;
  }

  public async aIHandler(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ): Promise<void> {
    // 1. Define the tools we want to expose to the model
    // These must match the definitions in package.json
    const tools: vscode.LanguageModelChatTool[] = [
      {
        name: 'aws-ai-assistant_testAwsConnection',
        description:
          'Tests AWS connectivity using STS GetCallerIdentity. Returns true if the connection is successful.',
        inputSchema: {
          type: 'object',
          properties: {
            region: {
              type: 'string',
              description:
                'The AWS region to test. If not specified, uses the current session region.',
              default: 'us-east-1'
            }
          }
        }
      },
      {
        name: 'aws-ai-assistant_s3Generic',
        description:
          'Execute S3 commands. IMPORTANT: Always provide the params object with required fields. HeadBucket: {Bucket}. HeadObject: {Bucket, Key}. ListBuckets: {}. ListObjectsV2: {Bucket, Prefix?}. ListObjectVersions: {Bucket, Prefix?}. GetBucketPolicy: {Bucket}. PutObject: {Bucket, Key, Body?}. DeleteObject: {Bucket, Key}. CopyObject: {Bucket, CopySource, Key}.',
        inputSchema: {
          type: 'object',
          required: ['command', 'params'],
          properties: {
            command: {
              type: 'string',
              enum: ['HeadBucket', 'HeadObject', 'ListBuckets', 'ListObjectsV2', 'ListObjectVersions', 'GetBucketPolicy', 'PutObject', 'DeleteObject', 'CopyObject'],
              description: 'The S3 command to execute'
            },
            params: {
              type: 'object',
              description: 'REQUIRED parameters object. For ListObjectsV2: MUST include {"Bucket": "bucket-name"}. For PutObject: {Bucket, Key, Body?}. For DeleteObject: {Bucket, Key}. For CopyObject: {Bucket, CopySource, Key}.',
              properties: {
                Bucket: {
                  type: 'string',
                  description: 'Bucket name (required for all commands except ListBuckets)'
                },
                Key: {
                  type: 'string',
                  description: 'Object key (required for most commands)'
                },
                CopySource: {
                  type: 'string',
                  description: 'Source object path for copy (required for CopyObject, format: /bucket/key)'
                },
                Body: {
                  type: 'string',
                  description: 'Object content as string or base64 (optional for PutObject)'
                },
                Prefix: {
                  type: 'string',
                  description: 'Filter by prefix (optional for ListObjectsV2, ListObjectVersions)'
                },
                Delimiter: {
                  type: 'string',
                  description: 'Delimiter for grouping keys (optional)'
                },
                MaxKeys: {
                  type: 'number',
                  description: 'Maximum keys to return (optional)'
                },
                ContinuationToken: {
                  type: 'string',
                  description: 'Pagination token (optional)'
                },
                StartAfter: {
                  type: 'string',
                  description: 'Start listing after this key (optional)'
                },
                ContentType: {
                  type: 'string',
                  description: 'MIME type for PutObject (optional)'
                },
                Metadata: {
                  type: 'object',
                  description: 'Custom metadata for object (optional)'
                },
                VersionId: {
                  type: 'string',
                  description: 'Version ID (optional for HeadObject, DeleteObject)'
                },
                MetadataDirective: {
                  type: 'string',
                  description: 'How to handle metadata in CopyObject: COPY or REPLACE (optional)'
                }
              }
            }
          }
        }
      },
      {
        name: 'aws-ai-assistant_fileOperations',
        description:
          'Perform file operations: ReadFile (read file content), ReadFileStream (get file info and stream), ReadFileAsBase64 (read file as Base64), GetFileInfo (get file statistics), ListFiles (list directory contents).',
        inputSchema: {
          type: 'object',
          required: ['command', 'params'],
          properties: {
            command: {
              type: 'string',
              enum: ['ReadFile', 'ReadFileStream', 'ReadFileAsBase64', 'GetFileInfo', 'ListFiles'],
              description: 'The file operation command to execute'
            },
            params: {
              type: 'object',
              description: 'Command parameters. ReadFile: {filePath, encoding?}. ReadFileStream: {filePath}. ReadFileAsBase64: {filePath}. GetFileInfo: {filePath}. ListFiles: {dirPath, recursive?}',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'File path (required for ReadFile, ReadFileStream, ReadFileAsBase64, GetFileInfo)'
                },
                dirPath: {
                  type: 'string',
                  description: 'Directory path (required for ListFiles)'
                },
                encoding: {
                  type: 'string',
                  description: 'File encoding for ReadFile (optional, default: utf8). Examples: utf8, ascii, base64'
                },
                recursive: {
                  type: 'boolean',
                  description: 'Recursively list files in subdirectories (optional for ListFiles, default: false)'
                }
              }
            }
          }
        }
      }
    ];

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
}
