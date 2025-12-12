import { DescribeIndexPoliciesCommand, DescribeIndexPoliciesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeIndexPoliciesInput {
  logGroupIdentifiers?: string[];
  nextToken?: string;
}

export const DescribeIndexPoliciesTool = createCloudWatchLogsTool<
  DescribeIndexPoliciesInput,
  DescribeIndexPoliciesCommandInput
>({
  name: 'DescribeIndexPolicies',
  commandCtor: DescribeIndexPoliciesCommand,
  buildInput: (input) => ({
    logGroupIdentifiers: input.logGroupIdentifiers,
    nextToken: input.nextToken,
  }),
});
