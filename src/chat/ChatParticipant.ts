import * as vscode from 'vscode';
import { AIHandler } from './AIHandler';
import * as ui from '../common/UI';

const PARTICIPANT_ID = 'aws-ai-assistant.chat';

export function registerChatParticipant(context: vscode.ExtensionContext): vscode.Disposable {
  const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, AIHandler.Current.aIHandler.bind(AIHandler.Current));

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'aws-assistant-icon.png');
  context.subscriptions.push(participant);
  ui.logToOutput('Chat participant registered');
  return participant;
}
