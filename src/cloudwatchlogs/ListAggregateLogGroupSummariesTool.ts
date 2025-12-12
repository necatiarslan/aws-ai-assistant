import { ListAggregateLogGroupSummariesCommand, ListAggregateLogGroupSummariesCommandInput, ListAggregateLogGroupSummariesGroupBy } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListAggregateLogGroupSummariesInput {
  accountIdentifiers?: string[];
  logGroupNameFilter?: string;
  groupBy?: ListAggregateLogGroupSummariesGroupBy;
  maxResults?: number;
  nextToken?: string;
}

export const ListAggregateLogGroupSummariesTool = createCloudWatchLogsTool<
  ListAggregateLogGroupSummariesInput,
  ListAggregateLogGroupSummariesCommandInput
>({
  name: 'ListAggregateLogGroupSummaries',
  required: [],
  commandCtor: ListAggregateLogGroupSummariesCommand,
  buildInput: (input) => ({
    accountIdentifiers: input.accountIdentifiers,
    logGroupNameFilter: input.logGroupNameFilter,
    groupBy: input.groupBy,
    maxResults: input.maxResults,
    nextToken: input.nextToken,
  }),
});
