import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import * as stsAPI from '../sts/API';

const PARTICIPANT_ID = 'aws-ai-assistant.chat';

export function registerChatParticipant(context: vscode.ExtensionContext): vscode.Disposable {
  const participant = vscode.chat.createChatParticipant(PARTICIPANT_ID, async (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => {
    try {
      // Provide current session information
      const awsProfile = Session.Current?.AwsProfile || 'default';
      const awsRegion = Session.Current?.AwsRegion || 'us-east-1';
      const awsEndpoint = Session.Current?.AwsEndPoint || 'default';

      ui.logToOutput(`Chat Participant: Processing request - "${request.prompt}"`);
      ui.logToOutput(`Session Info: Profile=${awsProfile}, Region=${awsRegion}, Endpoint=${awsEndpoint}`);

      const prompt = request.prompt.toLowerCase();

      // Show current session info
      stream.markdown(`### 📋 Current AWS Session\n`);
      stream.markdown(`- **Profile**: ${awsProfile}\n`);
      stream.markdown(`- **Region**: ${awsRegion}\n`);
      stream.markdown(`- **Endpoint**: ${awsEndpoint}\n\n`);

      // Handle test connection requests
      if (prompt.includes('test') && (prompt.includes('connection') || prompt.includes('connectivity') || prompt.includes('aws'))) {
        stream.markdown(`### 🔌 Testing AWS Connection...\n\n`);
        stream.progress('Testing AWS connectivity with STS GetCallerIdentity...');
        
        const result = await stsAPI.TestAwsConnection(awsRegion);
        
        if (result.isSuccessful) {
          stream.markdown(`✅ **AWS Connection Successful!**\n\n`);
          stream.markdown(`Connection details:\n`);
          stream.markdown(`- Profile: ${awsProfile}\n`);
          stream.markdown(`- Region: ${awsRegion}\n`);
          stream.markdown(`- Endpoint: ${awsEndpoint}\n`);
        } else {
          stream.markdown(`❌ **AWS Connection Failed**\n\n`);
          stream.markdown(`Error: ${result.error?.message || 'Unknown error'}\n\n`);
          stream.markdown(`Please check:\n`);
          stream.markdown(`- AWS credentials are configured\n`);
          stream.markdown(`- Profile "${awsProfile}" exists\n`);
          stream.markdown(`- Network connectivity\n`);
        }
        return;
      }

      // Handle session info requests
      if (prompt.includes('session') || prompt.includes('profile') || prompt.includes('region') || prompt.includes('info')) {
        stream.markdown(`### ℹ️ Session Management\n\n`);
        stream.markdown(`You can modify the session using these commands:\n\n`);
        stream.markdown(`- **Set AWS Profile**: \`Aws AI Assistant:Set Active Profile\`\n`);
        stream.markdown(`- **Set AWS Region**: \`Aws AI Assistant:Set Default AWS Region\`\n`);
        stream.markdown(`- **Set AWS Endpoint**: \`Aws AI Assistant:Set AWS Endpoint\`\n`);
        stream.markdown(`- **Refresh Credentials**: \`Aws AI Assistant:Refresh Credentials\`\n`);
        return;
      }

      // Default help message
      stream.markdown(`### 🤖 AWS AI Assistant\n\n`);
      stream.markdown(`I can help you with:\n\n`);
      stream.markdown(`- **Test AWS Connection**: Ask me to "test aws connection"\n`);
      stream.markdown(`- **Session Info**: Ask about "session" or "profile"\n`);
      stream.markdown(`- **List S3 Buckets**: Coming soon\n\n`);
      stream.markdown(`What would you like to do?\n`);

    } catch (error: any) {
      ui.logToOutput('Chat Participant Error:', error);
      stream.markdown(`❌ Error: ${error.message}\n`);
    }
  });

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'aws-ai-assistant-logo.png');

  return participant;
}
