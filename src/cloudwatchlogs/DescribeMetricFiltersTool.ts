import { DescribeMetricFiltersCommand, DescribeMetricFiltersCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeMetricFiltersInput {
  logGroupName: string;
  filterNamePrefix?: string;
  nextToken?: string;
  limit?: number;
}

export const DescribeMetricFiltersTool = createCloudWatchLogsTool<
  DescribeMetricFiltersInput,
  DescribeMetricFiltersCommandInput
>({
  name: 'DescribeMetricFilters',
  required: ['logGroupName'],
  commandCtor: DescribeMetricFiltersCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    filterNamePrefix: input.filterNamePrefix,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
