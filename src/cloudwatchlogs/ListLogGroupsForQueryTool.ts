import { ListLogGroupsForQueryCommand, ListLogGroupsForQueryCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface ListLogGroupsForQueryInput {
  logGroupNames?: string[];
  queryId?: string;
}

export const ListLogGroupsForQueryTool = createCloudWatchLogsTool<
  ListLogGroupsForQueryInput,
  ListLogGroupsForQueryCommandInput
>({
  name: 'ListLogGroupsForQuery',
  required: [],
  commandCtor: ListLogGroupsForQueryCommand,
  buildInput: (input) => ({
    logGroupNames: input.logGroupNames,
    queryId: input.queryId,
  }),
});
