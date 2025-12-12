import { ListScheduledQueriesCommand, ListScheduledQueriesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListScheduledQueriesInput {
  maxResults?: number;
  nextToken?: string;
}

export const ListScheduledQueriesTool = createCloudWatchLogsTool<
  ListScheduledQueriesInput,
  ListScheduledQueriesCommandInput
>({
  name: 'ListScheduledQueries',
  required: [],
  commandCtor: ListScheduledQueriesCommand,
  buildInput: (input) => ({
    maxResults: input.maxResults,
    nextToken: input.nextToken,
  }),
});
