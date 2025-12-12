import { GetIntegrationCommand, GetIntegrationCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface GetIntegrationInput {
  integrationName: string;
  integationType: string;
}

export const GetIntegrationTool = createCloudWatchLogsTool<
  GetIntegrationInput,
  GetIntegrationCommandInput
>({
  name: 'GetIntegration',
  required: ['integrationName', 'integationType'],
  commandCtor: GetIntegrationCommand,
  buildInput: (input) => ({
    integrationName: input.integrationName,
    integationType: input.integationType,
  }),
});
