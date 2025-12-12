import { DescribeResourcePoliciesCommand, DescribeResourcePoliciesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeResourcePoliciesInput {
  nextToken?: string;
  limit?: number;
}

export const DescribeResourcePoliciesTool = createCloudWatchLogsTool<
  DescribeResourcePoliciesInput,
  DescribeResourcePoliciesCommandInput
>({
  name: 'DescribeResourcePolicies',
  commandCtor: DescribeResourcePoliciesCommand,
  buildInput: (input) => ({
    nextToken: input.nextToken,
    limit: input.limit,
  }),
});
