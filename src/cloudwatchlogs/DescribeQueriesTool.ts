import { DescribeQueriesCommand, DescribeQueriesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeQueriesInput {
  logGroupName?: string;
  status?: 'Scheduled' | 'Running' | 'Complete' | 'Failed' | 'Cancelled';
  maxResults?: number;
  nextToken?: string;
}

export const DescribeQueriesTool = createCloudWatchLogsTool<
  DescribeQueriesInput,
  DescribeQueriesCommandInput
>({
  name: 'DescribeQueries',
  commandCtor: DescribeQueriesCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    status: input.status,
    maxResults: input.maxResults,
    nextToken: input.nextToken,
  }),
});
