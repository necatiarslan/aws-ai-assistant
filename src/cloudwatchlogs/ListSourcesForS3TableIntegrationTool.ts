import { ListSourcesForS3TableIntegrationCommand, ListSourcesForS3TableIntegrationCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListSourcesForS3TableIntegrationInput {
  s3TableArn?: string;
  integrationArn?: string;
  maxResults?: number;
  nextToken?: string;
}

export const ListSourcesForS3TableIntegrationTool = createCloudWatchLogsTool<
  ListSourcesForS3TableIntegrationInput,
  ListSourcesForS3TableIntegrationCommandInput
>({
  name: 'ListSourcesForS3TableIntegration',
  required: ['s3TableArn'],
  commandCtor: ListSourcesForS3TableIntegrationCommand,
  buildInput: (input) => ({
    s3TableArn: input.s3TableArn,
    integrationArn: input.integrationArn,
    maxResults: input.maxResults,
    nextToken: input.nextToken,
  }),
});
