import { ListIntegrationsCommand, ListIntegrationsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListIntegrationsInput {
}

export const ListIntegrationsTool = createCloudWatchLogsTool<
  ListIntegrationsInput,
  ListIntegrationsCommandInput
>({
  name: 'ListIntegrations',
  required: [],
  commandCtor: ListIntegrationsCommand,
  buildInput: (input) => ({}),
});
