import { DescribeAccountPoliciesCommand, DescribeAccountPoliciesCommandInput } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsTool } from './CloudWatchLogsToolFactory';

export interface DescribeAccountPoliciesInput {
  policyType: 'DATA_PROTECTION_POLICY' | 'SUBSCRIPTION_FILTER_POLICY';
  accountPolicy?: string;
  paginate?: boolean;
}

export const DescribeAccountPoliciesTool = createCloudWatchLogsTool<
  DescribeAccountPoliciesInput,
  DescribeAccountPoliciesCommandInput
>({
  name: 'DescribeAccountPolicies',
  required: ['policyType'],
  commandCtor: DescribeAccountPoliciesCommand,
  buildInput: (input) => ({
    policyType: input.policyType,
    accountPolicy: input.accountPolicy,
  }),
});
