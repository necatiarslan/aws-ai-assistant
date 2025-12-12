import { DescribeSubscriptionFiltersCommand, DescribeSubscriptionFiltersCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeSubscriptionFiltersInput {
  logGroupName: string;
  filterNamePrefix?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeSubscriptionFiltersTool = createCloudWatchLogsTool<
  DescribeSubscriptionFiltersInput,
  DescribeSubscriptionFiltersCommandInput
>({
  name: 'DescribeSubscriptionFilters',
  required: ['logGroupName'],
  commandCtor: DescribeSubscriptionFiltersCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    filterNamePrefix: input.filterNamePrefix,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
