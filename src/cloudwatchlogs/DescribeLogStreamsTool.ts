import { DescribeLogStreamsCommand, DescribeLogStreamsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeLogStreamsInput {
  logGroupName: string;
  logStreamNamePrefix?: string;
  orderBy?: 'LogStreamName' | 'LastEventTime';
  descending?: boolean;
  nextToken?: string;
  limit?: number;
}

export const DescribeLogStreamsTool = createCloudWatchLogsTool<
  DescribeLogStreamsInput,
  DescribeLogStreamsCommandInput
>({
  name: 'DescribeLogStreams',
  required: ['logGroupName'],
  commandCtor: DescribeLogStreamsCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    logStreamNamePrefix: input.logStreamNamePrefix,
    orderBy: input.orderBy,
    descending: input.descending,
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
