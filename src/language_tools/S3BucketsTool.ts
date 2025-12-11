import * as vscode from 'vscode';
import * as ui from '../common/UI';
import { Session } from '../common/Session';
import * as s3API from '../s3/API';

// Chat participant display name
const CHAT_PARTICIPANT_NAME = 'Aws Assistant';

export function registerS3BucketsTool(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('aws-ai-assistant.ListS3Buckets', async () => {
    try {
      const awsProfile = Session.Current?.AwsProfile;
      if (awsProfile) {
        process.env.AWS_PROFILE = awsProfile;
      }

      ui.logToOutput(`${CHAT_PARTICIPANT_NAME}: Listing S3 buckets (profile=${awsProfile || 'default'})`);

      const result = await s3API.GetBucketList();
      if (result.isSuccessful) {
        const buckets = result.result || [];
        ui.showOutputMessage({
          participant: CHAT_PARTICIPANT_NAME,
          profile: awsProfile || 'default',
          buckets,
        }, 'Results are printed to OUTPUT / AwsAccess-Extension', true);
      } else {
        throw result.error ?? new Error('Unknown error listing buckets');
      }
    } catch (error: any) {
      ui.showErrorMessage('Failed to list S3 buckets', error);
      ui.logToOutput('S3BucketsTool error while listing buckets', error);
    }
  });

  context.subscriptions.push(disposable);
}
