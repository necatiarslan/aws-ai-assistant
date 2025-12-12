import { DescribeFieldIndexesCommand, DescribeFieldIndexesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeFieldIndexesInput {
  logGroupName?: string;
  logGroupIdentifiers?: string[];
  nextToken?: string;
}

export const DescribeFieldIndexesTool = createCloudWatchLogsTool<
  DescribeFieldIndexesInput,
  DescribeFieldIndexesCommandInput
>({
  name: 'DescribeFieldIndexes',
  required: [],
  commandCtor: DescribeFieldIndexesCommand,
  buildInput: (input) => ({
    logGroupName: input.logGroupName,
    logGroupIdentifiers: input.logGroupIdentifiers,
    nextToken: input.nextToken,
  }),
});
