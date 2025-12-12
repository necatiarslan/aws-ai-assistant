import { DescribeLogGroupsCommand, DescribeLogGroupsCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeLogGroupsInput {
  logGroupNamePrefix?: string;
  logGroupNamePattern?: string;
  nextToken?: string;
  limit?: number;
  includeLinkedAccounts?: boolean;
}

export const DescribeLogGroupsTool = createCloudWatchLogsTool<
  DescribeLogGroupsInput,
  DescribeLogGroupsCommandInput
>({
  name: 'DescribeLogGroups',
  commandCtor: DescribeLogGroupsCommand,
  buildInput: (input) => ({
    logGroupNamePrefix: input.logGroupNamePrefix,
    logGroupNamePattern: input.logGroupNamePattern,
    nextToken: input.nextToken,
    limit: input.limit,
    includeLinkedAccounts: input.includeLinkedAccounts,
  }),
});
